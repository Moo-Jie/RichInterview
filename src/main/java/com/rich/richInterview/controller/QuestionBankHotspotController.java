package com.rich.richInterview.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import cn.dev33.satoken.annotation.SaMode;
import com.alibaba.csp.sentinel.Entry;
import com.alibaba.csp.sentinel.EntryType;
import com.alibaba.csp.sentinel.SphU;
import com.alibaba.csp.sentinel.Tracer;
import com.alibaba.csp.sentinel.annotation.SentinelResource;
import com.alibaba.csp.sentinel.slots.block.BlockException;
import com.alibaba.csp.sentinel.slots.block.degrade.DegradeException;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rich.richInterview.annotation.AutoCache;
import com.rich.richInterview.annotation.AutoClearCache;
import com.rich.richInterview.common.BaseResponse;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.UserConstant;
import com.rich.richInterview.exception.BusinessException;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.manager.CounterManager;
import com.rich.richInterview.model.dto.questionBankHotspot.QuestionBankHotspotQueryRequest;
import com.rich.richInterview.model.dto.questionBankHotspot.QuestionBankHotspotUpdateRequest;
import com.rich.richInterview.model.entity.QuestionBankHotspot;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.model.enums.IncrementFieldEnum;
import com.rich.richInterview.model.vo.QuestionBankHotspotVO;
import com.rich.richInterview.service.QuestionBankHotspotService;
import com.rich.richInterview.service.UserService;
import com.rich.richInterview.utils.CacheUtils;
import com.rich.richInterview.utils.DetectCrawlersUtils;
import com.rich.richInterview.utils.ResultUtils;
import com.rich.richInterview.utils.SentinelUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import static com.rich.richInterview.model.enums.IncrementFieldEnum.COMMENT_NUM;

/**
 * 题库热点接口
 */
@RestController
@RequestMapping("/questionBankHotspot")
@Slf4j
public class QuestionBankHotspotController {

    @Resource
    private QuestionBankHotspotService questionBankHotspotService;

    @Resource
    private UserService userService;

    @Resource
    private DetectCrawlersUtils detectCrawlersUtils;

    @Resource
    private CacheUtils cacheUtils;

    @Resource
    private CounterManager counterManager;

    // 缓存前缀常量
    private static final String HOTSPOT_CACHE_PREFIX = "question_bank_hotspot";

    // 缓存过期时间（秒）
    private static final long FIELD_CACHE_EXPIRE_TIME = 1200; // 20 分钟
    private static final long RANDOM_EXPIRE_RANGE = 60;      // 随机范围 1 分钟

    /**
     * 热点字段递增接口（自动初始化）
     */
    @PostMapping("/increment")
    public BaseResponse<Boolean> incrementField(@RequestParam Long questionBankId, @RequestParam String fieldType) {
        ThrowUtils.throwIf(questionBankId == null, ErrorCode.PARAMS_ERROR);

        // 使用字段名查找对应的枚举
        IncrementFieldEnum field = IncrementFieldEnum.fromFieldName(fieldType);

        // 构建缓存键
        String cacheKey = buildFieldCacheKey(questionBankId, field);

        // 使用 CounterManager 进行原子性递增，最多重试3次
        int maxRetries = 3;
        boolean success = false;

        for (int i = 0; i < maxRetries; i++) {
            try {
                // 使用Lua脚本进行原子性递增
                long newValue = counterManager.incrCount(cacheKey);
                if (newValue == -1) {
                    // key不存在，说明缓存还未初始化，等待后重试
                    log.info("题库热点缓存key不存在，等待缓存初始化... questionBankId: {}, field: {}, attempt: {}", questionBankId, field.getFieldName(), i + 1);
                } else if (newValue > 0) {
                    // 递增成功
                    success = true;
                    log.debug("字段递增成功，questionBankId: {}, field: {}, newValue: {}", questionBankId, field.getFieldName(), newValue);
                    break;
                } else {
                    // 其他异常情况
                    log.warn("字段递增返回异常值: {}, questionBankId: {}, field: {}", newValue, questionBankId, field.getFieldName());
                }
            } catch (Exception e) {
                log.warn("字段递增失败，重试中... questionBankId: {}, field: {}, attempt: {}", questionBankId, field.getFieldName(), i + 1, e);
            }

            // 如果失败，短暂等待后重试
            // 此操作是为了防止 热点增量请求 比 热点查询请求 早一步到达，导致增量时，仍未创建热点缓存
            if (i < maxRetries - 1) {
                try {
                    Thread.sleep(50); // 等待 50ms
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        }

        if (!success) {
            log.warn("字段递增最终失败，可能是缓存未初始化，questionBankId: {}, field: {}", questionBankId, field.getFieldName());
            // 不抛出异常，避免影响用户体验
            return ResultUtils.success(false);
        }

        return ResultUtils.success(true);
    }

    /**
     * 根据题库 ID 获取热点封装类
     *
     * @param questionBankId 题库ID
     * @param request
     * @return QuestionBankHotspotVO
     */
    @GetMapping("/get/vo/byQuestionBankId")
    @SaCheckRole(value = {UserConstant.ADMIN_ROLE, UserConstant.DEFAULT_ROLE}, mode = SaMode.OR)
    public BaseResponse<QuestionBankHotspotVO> getQuestionBankHotspotVOByQuestionBankId(@RequestParam Long questionBankId, HttpServletRequest request) {
        ThrowUtils.throwIf(questionBankId == null || questionBankId <= 0, ErrorCode.PARAMS_ERROR);

        // 1.反爬虫处理，针对用户 ID 控制访问次数
        User loginUser = userService.getLoginUser(request);
        if (!loginUser.getUserRole().equals(UserConstant.ADMIN_ROLE)) {
            detectCrawlersUtils.detectCrawler(loginUser.getId());
        }

        // 获取用户 IP
        String remoteAddr = request.getRemoteAddr();
        Entry entry = null;
        initFlowAndDegradeRules("getQuestionBankHotspotVOByQuestionBankId");

        try {
            entry = SphU.entry("getQuestionBankHotspotVOByQuestionBankId", EntryType.IN, 1, remoteAddr);

            // 核心业务
            userService.updateById(loginUser);

            // 尝试从缓存获取各个字段的值
            QuestionBankHotspotVO hotspotVO = getQuestionBankHotspotFromCache(questionBankId);

            if (hotspotVO != null) {
                // 从缓存获取热点数据成功
                return ResultUtils.success(hotspotVO);
            } else {
                log.info("缓存未命中，查询数据库，questionBankId: {}", questionBankId);
            }

            // 缓存未命中，查询数据库
            QuestionBankHotspot questionBankHotspot = questionBankHotspotService.getByQuestionBankId(questionBankId);
            ThrowUtils.throwIf(questionBankHotspot == null, ErrorCode.NOT_FOUND_ERROR);

            // 将数据库数据写入缓存
            cacheQuestionBankHotspotFields(questionBankHotspot);

            return ResultUtils.success(questionBankHotspotService.getQuestionBankHotspotVO(questionBankHotspot, request));

        } catch (Throwable ex) {
            if (!BlockException.isBlockException(ex)) {
                Tracer.trace(ex);
                return ResultUtils.error(ErrorCode.SYSTEM_ERROR, ex.getMessage());
            }
            if (ex instanceof DegradeException) {
                return SentinelUtils.handleFallback(QuestionBankHotspotVO.class);
            }
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "您访问过于频繁，系统压力稍大，请耐心等待哟~");
        } finally {
            if (entry != null) {
                entry.exit(1, remoteAddr);
            }
        }
    }

    /**
     * 更新题库热点（仅管理员可用）
     *
     * @param questionBankHotspotUpdateRequest
     * @return
     */
    @PostMapping("/update")
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    @AutoClearCache(prefixes = {"question_bank_hotspot_page", "question_bank_hotspot_vo"})
    public BaseResponse<Boolean> updateQuestionBankHotspot(@RequestBody QuestionBankHotspotUpdateRequest questionBankHotspotUpdateRequest) {
        if (questionBankHotspotUpdateRequest == null || questionBankHotspotUpdateRequest.getQuestionBankId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        // todo 在此处将实体类和 DTO 进行转换
        QuestionBankHotspot questionBankHotspot = new QuestionBankHotspot();
        BeanUtils.copyProperties(questionBankHotspotUpdateRequest, questionBankHotspot);
        // 数据校验
        questionBankHotspotService.validQuestionBankHotspot(questionBankHotspot, false);
        // 操作数据库
        boolean result = questionBankHotspotService.updateById(questionBankHotspot);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }

    /**
     * 分页获取题库热点列表（仅管理员可用）
     *
     * @param questionBankHotspotQueryRequest
     * @return
     */
    @PostMapping("/list/page")
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<QuestionBankHotspot>> listQuestionBankHotspotByPage(@RequestBody QuestionBankHotspotQueryRequest questionBankHotspotQueryRequest) {
        long current = questionBankHotspotQueryRequest.getCurrent();
        long size = questionBankHotspotQueryRequest.getPageSize();
        // 查询数据库
        Page<QuestionBankHotspot> questionBankHotspotPage = questionBankHotspotService.page(new Page<>(current, size), questionBankHotspotService.getQueryWrapper(questionBankHotspotQueryRequest));
        return ResultUtils.success(questionBankHotspotPage);
    }

    /**
     * 分页获取题库热点列表（封装类）
     * 源： https://sentinelguard.io/zh-cn/docs/annotation-support.html
     *
     * @param questionBankHotspotQueryRequest
     * @param request
     * @return com.rich.richInterview.common.BaseResponse<com.baomidou.mybatisplus.extension.plugins.pagination.Page < com.rich.richInterview.model.vo.QuestionBankHotspotVO>>
     * @author DuRuiChi
     * @create 2025/5/27
     **/
    @PostMapping("/list/page/vo")
    @SentinelResource(value = "listQuestionBankHotspotVOByPage", blockHandler = "handleBlockException", fallback = "handleFallback")
    @AutoCache(keyPrefix = "question_bank_hotspot_page")
    public BaseResponse<Page<QuestionBankHotspotVO>> listQuestionBankHotspotVOByPage(@RequestBody QuestionBankHotspotQueryRequest questionBankHotspotQueryRequest, HttpServletRequest request) {

        long current = questionBankHotspotQueryRequest.getCurrent();
        long size = questionBankHotspotQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        // 查询数据库
        Page<QuestionBankHotspot> questionBankHotspotPage = questionBankHotspotService.page(new Page<>(current, size), questionBankHotspotService.getQueryWrapper(questionBankHotspotQueryRequest));
        // 获取封装类
        return ResultUtils.success(questionBankHotspotService.getQuestionBankHotspotVOPage(questionBankHotspotPage, request));
    }

    /**
     * 设定限流与熔断规则
     */
    private void initFlowAndDegradeRules(String resourceName) {
        SentinelUtils.initFlowAndDegradeRules(resourceName);
    }

    /**
     * 构建字段缓存键
     */
    private String buildFieldCacheKey(Long questionBankId, IncrementFieldEnum field) {
        return HOTSPOT_CACHE_PREFIX + ":" + questionBankId + ":" + field.getFieldName();
    }

    /**
     * 从缓存获取题库热点数据
     * 适配新的数值存储格式（非JSON格式）
     */
    private QuestionBankHotspotVO getQuestionBankHotspotFromCache(Long questionBankId) {
        try {
            QuestionBankHotspotVO hotspotVO = new QuestionBankHotspotVO();
            hotspotVO.setQuestionBankId(questionBankId);

            // 尝试从缓存获取各个字段
            boolean hasAnyCache = false;

            for (IncrementFieldEnum field : IncrementFieldEnum.values()) {
                // 跳过 COMMENT_NUM 字段，题库热点数据不包含评论数
                if (field == COMMENT_NUM) {
                    continue;
                }
                String cacheKey = buildFieldCacheKey(questionBankId, field);

                // 直接从 Redis 获取字符串值，然后转换为整数
                Object rawValue = cacheUtils.getCache(cacheKey, Object.class);
                Integer value = null;

                if (rawValue != null) {
                    try {
                        // 尝试将值转换为整数
                        if (rawValue instanceof Number) {
                            value = ((Number) rawValue).intValue();
                        } else if (rawValue instanceof String) {
                            // 处理纯数值字符串（如 "123"）
                            String strValue = (String) rawValue;
                            if (strValue.matches("^\\d+$")) {
                                value = Integer.parseInt(strValue);
                            } else {
                                // 如果是JSON格式的字符串，尝试解析
                                try {
                                    value = Integer.parseInt(strValue.replaceAll("\"", ""));
                                } catch (NumberFormatException e) {
                                    log.warn("无法解析缓存值为整数，key: {}, value: {}", cacheKey, strValue);
                                    return null;
                                }
                            }
                        }
                    } catch (Exception e) {
                        log.warn("解析缓存值失败，key: {}, rawValue: {}", cacheKey, rawValue, e);
                        return null;
                    }
                }

                // 只要存在没有缓存的热点数据，就返回 null，走数据库查询
                if (value != null) {
                    log.debug("从缓存获取字段 {} 的值: {}", field.getFieldName(), value);
                    hasAnyCache = true;
                    switch (field) {
                        case VIEW_NUM:
                            hotspotVO.setViewNum(value);
                            break;
                        case STAR_NUM:
                            hotspotVO.setStarNum(value);
                            break;
//                        case FORWARD_NUM:
//                            hotspotVO.setForwardNum(value);
//                            break;
//                        case COLLECT_NUM:
//                            hotspotVO.setCollectNum(value);
//                            break;
//                        case COMMENT_NUM:
//                            hotspotVO.setCommentNum(value);
//                            break;
                    }
                } else {
                    return null;
                }
            }
            return hasAnyCache ? hotspotVO : null;
        } catch (Exception e) {
            log.error("从缓存获取题库热点数据失败，questionBankId: {}", questionBankId, e);
            return null;
        }
    }

    /**
     * 将题库热点数据缓存到Redis
     * 使用 CounterManager 初始化计数器，确保数据类型兼容性
     */
    private void cacheQuestionBankHotspotFields(QuestionBankHotspot questionBankHotspot) {
        try {
            Long questionBankId = questionBankHotspot.getQuestionBankId();

            // 计算实际过期时间（包含随机范围）
            long actualExpireTime = FIELD_CACHE_EXPIRE_TIME + (long) (Math.random() * RANDOM_EXPIRE_RANGE);

            // 使用 CounterManager 初始化各个字段的计数器，确保存储的是纯数值格式
            boolean viewNumSuccess = counterManager.initCounter(buildFieldCacheKey(questionBankId, IncrementFieldEnum.VIEW_NUM), questionBankHotspot.getViewNum(), actualExpireTime);

            boolean starNumSuccess = counterManager.initCounter(buildFieldCacheKey(questionBankId, IncrementFieldEnum.STAR_NUM), questionBankHotspot.getStarNum(), actualExpireTime);

//            boolean forwardNumSuccess = counterManager.initCounter(
//                    buildFieldCacheKey(questionBankId, IncrementFieldEnum.FORWARD_NUM),
//                    questionBankHotspot.getForwardNum(), actualExpireTime);
//
//            boolean collectNumSuccess = counterManager.initCounter(
//                    buildFieldCacheKey(questionBankId, IncrementFieldEnum.COLLECT_NUM),
//                    questionBankHotspot.getCollectNum(), actualExpireTime);
//
            if (viewNumSuccess && starNumSuccess) {
                log.info("缓存题库热点字段成功，questionBankId: {}", questionBankId);
            } else {
                log.warn("部分题库热点字段缓存失败，questionBankId: {}, viewNum: {}, starNum: {}", questionBankId, viewNumSuccess, starNumSuccess);
            }
        } catch (Exception e) {
            log.error("缓存题库热点字段失败，questionBankId: {}", questionBankHotspot.getQuestionBankId(), e);
        }
    }

    /**
     * Sintel 流控：触发异常熔断后的降级服务
     *
     * @return com.rich.richInterview.common.BaseResponse<com.baomidou.mybatisplus.extension.plugins.pagination.Page < com.rich.richInterview.model.vo.QuestionBankHotspotVO>>
     * @author DuRuiChi
     * @create 2025/5/27
     **/
    public BaseResponse<Page<QuestionBankHotspotVO>> handleFallback() {
        return SentinelUtils.handleFallbackPage(QuestionBankHotspotVO.class);
    }

    /**
     * 限流规则
     *
     * @return void
     * @author DuRuiChi
     * @create 2025/5/27
     **/
    @PostConstruct
    private void initFlowRules() {
        SentinelUtils.initFlowAndDegradeRules("listQuestionBankHotspotVOByPage");
        SentinelUtils.initFlowAndDegradeRules("getQuestionBankHotspotVOByQuestionBankId");
    }

    /**
     * Sintel 流控： 触发流量过大阻塞后响应的服务
     *
     * @param ex
     * @return com.rich.richInterview.common.BaseResponse<com.baomidou.mybatisplus.extension.plugins.pagination.Page < com.rich.richInterview.model.vo.QuestionBankHotspotVO>>
     * @author DuRuiChi
     * @create 2025/5/27
     **/
    public BaseResponse<Page<QuestionBankHotspotVO>> handleBlockException(BlockException ex) {
        // 过滤普通降级操作
        if (ex instanceof DegradeException) {
            return handleFallback();
        }
        // 系统高压限流降级操作
        return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "系统压力稍大，请耐心等待哟~");
    }
}
