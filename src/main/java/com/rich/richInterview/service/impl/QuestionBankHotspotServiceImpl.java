package com.rich.richInterview.service.impl;

import cn.hutool.core.collection.CollUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.CommonConstant;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.manager.CounterManager;
import com.rich.richInterview.mapper.QuestionBankHotspotMapper;
import com.rich.richInterview.model.dto.questionBankHotspot.QuestionBankHotspotQueryRequest;
import com.rich.richInterview.model.entity.QuestionBank;
import com.rich.richInterview.model.entity.QuestionBankHotspot;
import com.rich.richInterview.model.enums.IncrementFieldEnum;
import com.rich.richInterview.model.vo.QuestionBankHotspotVO;
import com.rich.richInterview.service.QuestionBankHotspotService;
import com.rich.richInterview.service.QuestionBankService;
import com.rich.richInterview.utils.CacheUtils;
import com.rich.richInterview.utils.ResultUtils;
import com.rich.richInterview.utils.SentinelUtils;
import com.rich.richInterview.utils.SqlUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Collectors;

import static com.rich.richInterview.model.enums.IncrementFieldEnum.COMMENT_NUM;

/**
 * 题库热点服务实现
 */
@Service
@Slf4j
public class QuestionBankHotspotServiceImpl extends ServiceImpl<QuestionBankHotspotMapper, QuestionBankHotspot> implements QuestionBankHotspotService {

    @Resource
    private QuestionBankService questionBankService;

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
     * 校验数据
     *
     * @param questionBankHotspot
     * @param add                 对创建的数据进行校验
     */
    @Override
    public void validQuestionBankHotspot(QuestionBankHotspot questionBankHotspot, boolean add) {
        ThrowUtils.throwIf(questionBankHotspot == null, ErrorCode.PARAMS_ERROR);
    }

    /**
     * 获取查询条件
     *
     * @param questionBankHotspotQueryRequest
     * @return
     */
    @Override
    public QueryWrapper<QuestionBankHotspot> getQueryWrapper(QuestionBankHotspotQueryRequest questionBankHotspotQueryRequest) {
        QueryWrapper<QuestionBankHotspot> queryWrapper = new QueryWrapper<>();
        if (questionBankHotspotQueryRequest == null) {
            return queryWrapper;
        }
        // todo 从对象中取值
        Long questionBankId = questionBankHotspotQueryRequest.getQuestionBankId();
        Integer viewNum = questionBankHotspotQueryRequest.getViewNum();
        Integer starNum = questionBankHotspotQueryRequest.getStarNum();
        Integer forwardNum = questionBankHotspotQueryRequest.getForwardNum();
        Integer collectNum = questionBankHotspotQueryRequest.getCollectNum();
        Integer commentNum = questionBankHotspotQueryRequest.getCommentNum();
        String sortField = questionBankHotspotQueryRequest.getSortField();
        String sortOrder = questionBankHotspotQueryRequest.getSortOrder();

        // 精确查询
        queryWrapper.ne(ObjectUtils.isNotEmpty(questionBankId), "questionBankId", questionBankId);
        queryWrapper.eq(ObjectUtils.isNotEmpty(viewNum), "viewNum", viewNum);
        queryWrapper.eq(ObjectUtils.isNotEmpty(starNum), "userId", starNum);
        queryWrapper.eq(ObjectUtils.isNotEmpty(forwardNum), "forwardNum", forwardNum);
        queryWrapper.eq(ObjectUtils.isNotEmpty(collectNum), "collectNum", collectNum);
        queryWrapper.eq(ObjectUtils.isNotEmpty(commentNum), "commentNum", commentNum);

        // 排序规则
        queryWrapper.orderBy(SqlUtils.validSortField(sortField),
                sortOrder.equals(CommonConstant.SORT_ORDER_ASC),
                sortField);
        return queryWrapper;
    }

    /**
     * 获取题库热点封装
     *
     * @param questionBankHotspot
     * @param request
     * @return
     */
    @Override
    public QuestionBankHotspotVO getQuestionBankHotspotVO(QuestionBankHotspot questionBankHotspot, HttpServletRequest request) {
        // 对象转封装类
        QuestionBankHotspotVO questionBankHotspotVO = QuestionBankHotspotVO.objToVo(questionBankHotspot);
        // 补充设置题库信息
        QuestionBank questionBank = questionBankService.getById(questionBankHotspotVO.getQuestionBankId());
        questionBankHotspotVO.setTitle(questionBank.getTitle());
        questionBankHotspotVO.setDescription(questionBank.getDescription());
        return questionBankHotspotVO;
    }

    /**
     * 分页获取题库热点封装
     *
     * @param questionBankHotspotPage
     * @param request
     * @return
     */
    @Override
    public Page<QuestionBankHotspotVO> getQuestionBankHotspotVOPage(Page<QuestionBankHotspot> questionBankHotspotPage, HttpServletRequest request) {
        List<QuestionBankHotspot> questionBankHotspotList = questionBankHotspotPage.getRecords();
        Page<QuestionBankHotspotVO> questionBankHotspotVOPage = new Page<>(questionBankHotspotPage.getCurrent(), questionBankHotspotPage.getSize(), questionBankHotspotPage.getTotal());
        if (CollUtil.isEmpty(questionBankHotspotList)) {
            return questionBankHotspotVOPage;
        }
        // 对象列表 => 封装对象列表
        List<QuestionBankHotspotVO> questionBankHotspotVOList = questionBankHotspotList
                .stream()
                .map(QuestionBankHotspotVO::objToVo)
                .collect(Collectors.toList());
        questionBankHotspotVOList.forEach(questionBankHotspotVO -> {
            // 设置题库信息（避免过长冗余信息）
            QuestionBank questionBank = questionBankService.getById(questionBankHotspotVO.getQuestionBankId());
            questionBankHotspotVO.setTitle(questionBank.getTitle());
            questionBankHotspotVO.setDescription(questionBank.getDescription());
        });

        // 封装对象列表 => 封装对象分页
        questionBankHotspotVOPage.setRecords(questionBankHotspotVOList);
        return questionBankHotspotVOPage;
    }

    /**
     * 热点字段递增接口（自动初始化）
     *
     * @param questionBankId
     * @param field
     * @return boolean
     * @author DuRuiChi
     * @create 2025/5/25
     **/
    @Override
    public boolean incrementField(Long questionBankId, IncrementFieldEnum field) {
        // 参数校验
        ThrowUtils.throwIf(questionBankId == null || field == null, ErrorCode.PARAMS_ERROR);
        // 题库合法
        QuestionBank q = questionBankService.getById(questionBankId);
        ThrowUtils.throwIf(q == null, ErrorCode.NOT_FOUND_ERROR);
        // 题库是否已被记录在热点表
        QueryWrapper<QuestionBankHotspot> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq(ObjectUtils.isNotEmpty(q.getId()), "questionBankId", questionBankId);
        QuestionBankHotspot questionBankHotspot = this.getOne(queryWrapper);

        // 原子操作
        if (questionBankHotspot == null) {
            // 若不存在则插入
            try {
                QuestionBankHotspot newRecord = new QuestionBankHotspot();
                newRecord.setQuestionBankId(questionBankId);
                newRecord.setViewNum(0);
                newRecord.setStarNum(0);
                newRecord.setForwardNum(0);
                newRecord.setCollectNum(0);
                newRecord.setCommentNum(0);
                this.save(newRecord);
            } catch (DuplicateKeyException ignored) {
                // 忽略重复键异常，并停止本次保存，防止前端因 SSR 和 CSR 渲染差异而并发插入
            }
        }
        UpdateWrapper<QuestionBankHotspot> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("questionBankId", questionBankId)
                .setSql(field.getFieldName() + " = " + field.getFieldName() + " + 1");
        return this.update(updateWrapper);
    }

    /**
     * 根据题库 id 获取题库热点信息，不存在时初始化
     *
     * @param questionBankId
     * @return
     */
    @Override
    public QuestionBankHotspot getByQuestionBankId(Long questionBankId) {
        QueryWrapper<QuestionBankHotspot> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("questionBankId", questionBankId);
        QuestionBankHotspot hotspot = this.getOne(queryWrapper);

        // 不存在时初始化热点数据
        if (hotspot == null) {
            try {
                // 尝试原子性插入
                hotspot = new QuestionBankHotspot();
                hotspot.setQuestionBankId(questionBankId);
                hotspot.setViewNum(0);
                hotspot.setStarNum(0);
                hotspot.setForwardNum(0);
                hotspot.setCollectNum(0);
                hotspot.setCommentNum(0);
                this.save(hotspot);
            } catch (DuplicateKeyException e) {
                // 重新查询，防止前端因 SSR 和 CSR 渲染差异而并发插入
                return this.getOne(queryWrapper);
            }
        }
        return hotspot;
    }

    /**
     * 设定限流与熔断规则
     */
    @Override
    public void initFlowAndDegradeRules(String resourceName) {
        SentinelUtils.initFlowAndDegradeRules(resourceName);
    }

    /**
     * 构建字段缓存键
     */
    @Override
    public String buildFieldCacheKey(Long questionBankId, IncrementFieldEnum field) {
        return HOTSPOT_CACHE_PREFIX + ":" + questionBankId + ":" + field.getFieldName();
    }

    /**
     * 从缓存获取题库热点数据
     * 适配新的数值存储格式（非JSON格式）
     */
    @Override
    public QuestionBankHotspotVO getQuestionBankHotspotFromCache(Long questionBankId) {
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
    @Override
    public void cacheQuestionBankHotspotFields(QuestionBankHotspot questionBankHotspot) {
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
     * 执行字段增量
     *
     * @param questionBankId     题库 id
     * @param field              字段枚举
     * @param cacheKey           缓存键
     * @return java.lang.Boolean
     **/
    @Override
    public Boolean doIncrementField(Long questionBankId, IncrementFieldEnum field, String cacheKey) {
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
            return false;
        }

        return success;
    }
}
