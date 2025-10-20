package com.rich.richInterview.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import cn.dev33.satoken.annotation.SaMode;
import com.alibaba.csp.sentinel.Entry;
import com.alibaba.csp.sentinel.EntryType;
import com.alibaba.csp.sentinel.SphU;
import com.alibaba.csp.sentinel.Tracer;
import com.alibaba.csp.sentinel.slots.block.BlockException;
import com.alibaba.csp.sentinel.slots.block.degrade.DegradeException;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rich.richInterview.annotation.AutoCache;
import com.rich.richInterview.common.BaseResponse;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.UserConstant;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.manager.CounterManager;
import com.rich.richInterview.model.dto.questionHotspot.QuestionHotspotQueryRequest;
import com.rich.richInterview.model.entity.QuestionHotspot;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.model.enums.IncrementFieldEnum;
import com.rich.richInterview.model.vo.QuestionHotspotVO;
import com.rich.richInterview.service.QuestionHotspotService;
import com.rich.richInterview.service.UserService;
import com.rich.richInterview.utils.CacheUtils;
import com.rich.richInterview.utils.DetectCrawlersUtils;
import com.rich.richInterview.utils.ResultUtils;
import com.rich.richInterview.utils.SentinelUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

/**
 * 题目热点接口
 */
@RestController
@RequestMapping("/questionHotspot")
@Slf4j
public class QuestionHotspotController {

    @Resource
    private QuestionHotspotService questionHotspotService;

    @Resource
    private UserService userService;

    @Resource
    private DetectCrawlersUtils detectCrawlersUtils;

    @Resource
    private CacheUtils cacheUtils;

    @Resource
    private CounterManager counterManager;

    // 缓存前缀常量
    private static final String HOTSPOT_CACHE_PREFIX = "question_hotspot";

    // 缓存过期时间（秒）
    private static final long FIELD_CACHE_EXPIRE_TIME = 1200; // 20 分钟
    private static final long RANDOM_EXPIRE_RANGE = 60;      // 随机范围 5 分钟

    /**
     * 热点字段递增接口（自动初始化）
     */
    @PostMapping("/increment")
    public BaseResponse<Boolean> incrementField(
            @RequestParam Long questionId,
            @RequestParam String fieldType) {
        ThrowUtils.throwIf(questionId == null, ErrorCode.PARAMS_ERROR);

        // 使用字段名查找对应的枚举
        IncrementFieldEnum field = IncrementFieldEnum.fromFieldName(fieldType);

        // 构建缓存键
        String cacheKey = buildFieldCacheKey(questionId, field);

        // 使用 CounterManager 进行原子性递增，最多重试3次
        int maxRetries = 3;
        boolean success = false;

        for (int i = 0; i < maxRetries; i++) {
            try {
                // 使用Lua脚本进行原子性递增
                long newValue = counterManager.incrCount(cacheKey);
                if (newValue == -1) {
                    // key不存在，说明缓存还未初始化，等待后重试
                    log.info("热点缓存key不存在，等待缓存初始化... questionId: {}, field: {}, attempt: {}", 
                            questionId, field.getFieldName(), i + 1);
                } else if (newValue > 0) {
                    // 递增成功
                    success = true;
                    log.debug("字段递增成功，questionId: {}, field: {}, newValue: {}", 
                            questionId, field.getFieldName(), newValue);
                    break;
                } else {
                    // 其他异常情况
                    log.warn("字段递增返回异常值: {}, questionId: {}, field: {}", 
                            newValue, questionId, field.getFieldName());
                }
            } catch (Exception e) {
                log.warn("字段递增失败，重试中... questionId: {}, field: {}, attempt: {}", 
                        questionId, field.getFieldName(), i + 1, e);
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
            log.warn("字段递增最终失败，可能是缓存未初始化，questionId: {}, field: {}", 
                    questionId, field.getFieldName());
            // 不抛出异常，避免影响用户体验
            return ResultUtils.success(false);
        }

        return ResultUtils.success(true);
    }

    /**
     * 根据题目ID获取热点封装类
     *
     * @param questionId 题目ID
     * @param request
     * @return QuestionHotspotVO
     */
    @GetMapping("/get/vo/byQuestionId")
    @SaCheckRole(value = {UserConstant.ADMIN_ROLE, UserConstant.DEFAULT_ROLE}, mode = SaMode.OR)
    public BaseResponse<QuestionHotspotVO> getQuestionHotspotVOByQuestionId(
            @RequestParam Long questionId,
            HttpServletRequest request) {
        ThrowUtils.throwIf(questionId == null || questionId <= 0, ErrorCode.PARAMS_ERROR);

        // 1.反爬虫处理，针对用户 ID 控制访问次数
        User loginUser = userService.getLoginUser(request);
        if (!loginUser.getUserRole().equals(UserConstant.ADMIN_ROLE)) {
            detectCrawlersUtils.detectCrawler(loginUser.getId());
        }

        // 获取用户 IP
        String remoteAddr = request.getRemoteAddr();
        Entry entry = null;
        initFlowAndDegradeRules("getQuestionHotspotVOByQuestionId");

        try {
            entry = SphU.entry("getQuestionHotspotVOByQuestionId", EntryType.IN, 1, remoteAddr);

            // 核心业务
            loginUser.setPreviousQuestionID(questionId);
            userService.updateById(loginUser);

            // 尝试从缓存获取各个字段的值
            QuestionHotspotVO hotspotVO = getQuestionHotspotFromCache(questionId);

            if (hotspotVO != null) {
                // 从缓存获取热点数据成功
                return ResultUtils.success(hotspotVO);
            } else {
                log.info("缓存未命中，查询数据库，questionId: {}", questionId);
            }

            // 缓存未命中，查询数据库
            QuestionHotspot questionHotspot = questionHotspotService.getByQuestionId(questionId);
            ThrowUtils.throwIf(questionHotspot == null, ErrorCode.NOT_FOUND_ERROR);

            // 将数据库数据写入缓存
            cacheQuestionHotspotFields(questionHotspot);

            return ResultUtils.success(questionHotspotService.getQuestionHotspotVO(questionHotspot, request));

        } catch (Throwable ex) {
            if (!BlockException.isBlockException(ex)) {
                Tracer.trace(ex);
                return ResultUtils.error(ErrorCode.SYSTEM_ERROR, ex.getMessage());
            }
            if (ex instanceof DegradeException) {
                return SentinelUtils.handleFallback(QuestionHotspotVO.class);
            }
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "您访问过于频繁，系统压力稍大，请耐心等待哟~");
        } finally {
            if (entry != null) {
                entry.exit(1, remoteAddr);
            }
        }
    }

    /**
     * 分页获取题目热点列表（仅管理员可用）
     *
     * @param questionHotspotQueryRequest
     * @return
     */
    @PostMapping("/list/page")
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<QuestionHotspot>> listQuestionHotspotByPage(@RequestBody QuestionHotspotQueryRequest questionHotspotQueryRequest) {
        long current = questionHotspotQueryRequest.getCurrent();
        long size = questionHotspotQueryRequest.getPageSize();
        Page<QuestionHotspot> questionHotspotPage = questionHotspotService.page(new Page<>(current, size),
                questionHotspotService.getQueryWrapper(questionHotspotQueryRequest));
        return ResultUtils.success(questionHotspotPage);
    }

    /**
     * 分页获取题目热点列表（封装类）
     * 保留原有缓存注解，让其自然过期
     *
     * @param questionHotspotQueryRequest
     * @param request
     * @return
     */
    @PostMapping("/list/page/vo")
    @AutoCache(keyPrefix = "question_hotspot_page")
    public BaseResponse<Page<QuestionHotspotVO>> listQuestionHotspotVOByPage(@RequestBody QuestionHotspotQueryRequest questionHotspotQueryRequest,
                                                                             HttpServletRequest request) {
        long current = questionHotspotQueryRequest.getCurrent();
        long size = questionHotspotQueryRequest.getPageSize();

        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        String remoteAddr = request.getRemoteAddr();
        Entry entry = null;
        initFlowAndDegradeRules("listQuestionHotspotVOByPage");

        try {
            entry = SphU.entry("listQuestionHotspotVOByPage", EntryType.IN, 1, remoteAddr);
            Page<QuestionHotspot> questionHotspotPage = questionHotspotService.page(new Page<>(current, size),
                    questionHotspotService.getQueryWrapper(questionHotspotQueryRequest));
            return ResultUtils.success(questionHotspotService.getQuestionHotspotVOPage(questionHotspotPage, request));
        } catch (Throwable ex) {
            if (!BlockException.isBlockException(ex)) {
                Tracer.trace(ex);
                return ResultUtils.error(ErrorCode.SYSTEM_ERROR, ex.getMessage());
            }
            if (ex instanceof DegradeException) {
                return SentinelUtils.handleFallbackPage(QuestionHotspotVO.class);
            }
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "您访问过于频繁，系统压力稍大，请耐心等待哟~");
        } finally {
            if (entry != null) {
                entry.exit(1, remoteAddr);
            }
        }
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
    private String buildFieldCacheKey(Long questionId, IncrementFieldEnum field) {
        return HOTSPOT_CACHE_PREFIX + ":" + questionId + ":" + field.getFieldName();
    }

    /**
     * 从缓存获取题目热点数据
     * 适配新的数值存储格式（非JSON格式）
     */
    private QuestionHotspotVO getQuestionHotspotFromCache(Long questionId) {
        try {
            QuestionHotspotVO hotspotVO = new QuestionHotspotVO();
            hotspotVO.setQuestionId(questionId);

            // 尝试从缓存获取各个字段
            boolean hasAnyCache = false;

            for (IncrementFieldEnum field : IncrementFieldEnum.values()) {
                String cacheKey = buildFieldCacheKey(questionId, field);
                
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
                        case COMMENT_NUM:
                            hotspotVO.setCommentNum(value);
                            break;
                    }
                } else {
                    return null;
                }
            }
            return hasAnyCache ? hotspotVO : null;
        } catch (Exception e) {
            log.error("从缓存获取热点数据失败，questionId: {}", questionId, e);
            return null;
        }
    }

    /**
     * 将题目热点数据缓存到Redis
     * 使用 CounterManager 初始化计数器，确保数据类型兼容性
     */
    private void cacheQuestionHotspotFields(QuestionHotspot questionHotspot) {
        try {
            Long questionId = questionHotspot.getQuestionId();
            
            // 计算实际过期时间（包含随机范围）
            long actualExpireTime = FIELD_CACHE_EXPIRE_TIME + (long) (Math.random() * RANDOM_EXPIRE_RANGE);

            // 使用 CounterManager 初始化各个字段的计数器，确保存储的是纯数值格式
            boolean viewNumSuccess = counterManager.initCounter(
                    buildFieldCacheKey(questionId, IncrementFieldEnum.VIEW_NUM),
                    questionHotspot.getViewNum(), actualExpireTime);
            
            boolean starNumSuccess = counterManager.initCounter(
                    buildFieldCacheKey(questionId, IncrementFieldEnum.STAR_NUM),
                    questionHotspot.getStarNum(), actualExpireTime);
            
            boolean commentNumSuccess = counterManager.initCounter(
                    buildFieldCacheKey(questionId, IncrementFieldEnum.COMMENT_NUM),
                    questionHotspot.getCommentNum(), actualExpireTime);

//            boolean forwardNumSuccess = counterManager.initCounter(
//                    buildFieldCacheKey(questionId, IncrementFieldEnum.FORWARD_NUM),
//                    questionHotspot.getForwardNum(), actualExpireTime);
//            
//            boolean collectNumSuccess = counterManager.initCounter(
//                    buildFieldCacheKey(questionId, IncrementFieldEnum.COLLECT_NUM),
//                    questionHotspot.getCollectNum(), actualExpireTime);

            if (viewNumSuccess && starNumSuccess && commentNumSuccess) {
                log.info("缓存题目热点字段成功，questionId: {}", questionId);
            } else {
                log.warn("部分热点字段缓存失败，questionId: {}, viewNum: {}, starNum: {}, commentNum: {}", 
                        questionId, viewNumSuccess, starNumSuccess, commentNumSuccess);
            }
        } catch (Exception e) {
            log.error("缓存题目热点字段失败，questionId: {}", questionHotspot.getQuestionId(), e);
        }
    }
}
