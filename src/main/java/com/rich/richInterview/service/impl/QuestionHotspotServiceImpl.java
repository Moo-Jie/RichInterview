package com.rich.richInterview.service.impl;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.CommonConstant;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.manager.CounterManager;
import com.rich.richInterview.mapper.QuestionHotspotMapper;
import com.rich.richInterview.model.dto.questionHotspot.QuestionHotspotQueryRequest;
import com.rich.richInterview.model.entity.Question;
import com.rich.richInterview.model.entity.QuestionHotspot;
import com.rich.richInterview.model.enums.IncrementFieldEnum;
import com.rich.richInterview.model.vo.QuestionHotspotVO;
import com.rich.richInterview.service.QuestionHotspotService;
import com.rich.richInterview.service.QuestionService;
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

/**
 * 题目热点服务实现
 */
@Service
@Slf4j
public class QuestionHotspotServiceImpl extends ServiceImpl<QuestionHotspotMapper, QuestionHotspot> implements QuestionHotspotService {

    @Resource
    private QuestionService questionService;

    @Resource
    private CounterManager counterManager;

    @Resource
    private CacheUtils cacheUtils;

    // 缓存前缀常量
    private static final String HOTSPOT_CACHE_PREFIX = "question_hotspot";

    // 缓存过期时间（秒）
    private static final long FIELD_CACHE_EXPIRE_TIME = 1200; // 20 分钟

    private static final long RANDOM_EXPIRE_RANGE = 60;      // 随机范围 5 分钟

    /**
     * 根据题目 id 获取题库热点信息，不存在时初始化
     *
     * @param questionId
     * @return
     */
    @Override
    public QuestionHotspot getByQuestionId(Long questionId) {
        QueryWrapper<QuestionHotspot> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("questionId", questionId);
        QuestionHotspot hotspot = this.getOne(queryWrapper);

        // 不存在时初始化热点数据
        if (hotspot == null) {
            try {
                // 尝试原子性插入
                hotspot = new QuestionHotspot();
                hotspot.setQuestionId(questionId);
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
     * 热点字段递增接口
     *
     * @param questionId
     * @param field
     * @return boolean
     * @author DuRuiChi
     * @create 2025/5/22
     **/
    @Override
    public boolean incrementField(Long questionId, IncrementFieldEnum field) {
        // 参数校验
        ThrowUtils.throwIf(questionId == null || field == null, ErrorCode.PARAMS_ERROR);
        // 题目合法
        Question q = questionService.getById(questionId);
        ThrowUtils.throwIf(q == null, ErrorCode.NOT_FOUND_ERROR);
        // 题目是否已被记录在热点表
        QueryWrapper<QuestionHotspot> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq(ObjectUtils.isNotEmpty(q.getId()), "questionId", questionId);
        QuestionHotspot questionHotspot = this.getOne(queryWrapper);

        // 原子操作
        if (questionHotspot == null) {
            // 若不存在则插入
            try {
                QuestionHotspot newRecord = new QuestionHotspot();
                newRecord.setQuestionId(questionId);
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
        // 更新热点字段
        UpdateWrapper<QuestionHotspot> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("questionId", questionId)
                .setSql(field.getFieldName() + " = " + field.getFieldName() + " + 1");
        return this.update(updateWrapper);
    }

    /**
     * 热点字段递减接口
     *
     * @param questionId
     * @param field
     * @return boolean
     * @author DuRuiChi
     * @create 2025/5/22
     **/
    @Override
    public boolean decrementField(Long questionId, IncrementFieldEnum field) {
        // 题目合法
        ThrowUtils.throwIf(questionId == null || field == null, ErrorCode.PARAMS_ERROR);
        Question q = questionService.getById(questionId);
        ThrowUtils.throwIf(q == null, ErrorCode.NOT_FOUND_ERROR);

        // 题目是否已被记录在热点表
        QueryWrapper<QuestionHotspot> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("questionId", questionId);
        QuestionHotspot questionHotspot = this.getOne(queryWrapper);

        // 原子操作逻辑
        if (questionHotspot == null) {
            try {
                QuestionHotspot newRecord = new QuestionHotspot();
                newRecord.setQuestionId(questionId);
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

        // 更新热点字段
        UpdateWrapper<QuestionHotspot> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("questionId", questionId)
                .setSql(field.getFieldName() + " = " + field.getFieldName() + " - 1");
        return this.update(updateWrapper);
    }

    /**
     * 校验数据
     *
     * @param questionHotspot
     * @param add             对创建的数据进行校验
     */
    @Override
    public void validQuestionHotspot(QuestionHotspot questionHotspot, boolean add) {
        ThrowUtils.throwIf(questionHotspot == null, ErrorCode.PARAMS_ERROR);
        ThrowUtils.throwIf(questionHotspot.getQuestionId() == null, ErrorCode.PARAMS_ERROR);
    }

    /**
     * 获取查询条件
     *
     * @param questionHotspotQueryRequest
     * @return
     */
    @Override
    public QueryWrapper<QuestionHotspot> getQueryWrapper(QuestionHotspotQueryRequest questionHotspotQueryRequest) {
        QueryWrapper<QuestionHotspot> queryWrapper = new QueryWrapper<>();
        if (questionHotspotQueryRequest == null) {
            return queryWrapper;
        }
        // todo 从对象中取值
        Long questionId = questionHotspotQueryRequest.getQuestionId();
        Integer viewNum = questionHotspotQueryRequest.getViewNum();
        Integer starNum = questionHotspotQueryRequest.getStarNum();
        Integer forwardNum = questionHotspotQueryRequest.getForwardNum();
        Integer collectNum = questionHotspotQueryRequest.getCollectNum();
        Integer commentNum = questionHotspotQueryRequest.getCommentNum();
        int current = questionHotspotQueryRequest.getCurrent();
        int pageSize = questionHotspotQueryRequest.getPageSize();
        String sortField = questionHotspotQueryRequest.getSortField();
        String sortOrder = questionHotspotQueryRequest.getSortOrder();

        // todo 补充需要的查询条件
        // 精确查询
        queryWrapper.eq(ObjectUtils.isNotEmpty(questionId), "questionId", questionId);
        queryWrapper.eq(ObjectUtils.isNotEmpty(viewNum), "viewNum", viewNum);
        queryWrapper.eq(ObjectUtils.isNotEmpty(starNum), "starNum", starNum);
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
     * 获取题目热点封装
     *
     * @param questionHotspot
     * @param request
     * @return
     */
    @Override
    public QuestionHotspotVO getQuestionHotspotVO(QuestionHotspot questionHotspot, HttpServletRequest request) {
        QuestionHotspotVO questionHotspotVO = QuestionHotspotVO.objToVo(questionHotspot);
        // 设置题目信息
        // TODO 与题目信息重复，冗余响应，此处关闭
//        Question question = questionService.getById(questionHotspot.getQuestionId());
//        if (question != null) {
//            // 填充题目基础信息
//            questionHotspotVO.setTitle(question.getTitle());
//            questionHotspotVO.setContent(question.getContent());
//            questionHotspotVO.setAnswer(question.getAnswer());
//            questionHotspotVO.setTagList(JSONUtil.toList(question.getTags(), String.class));
//            return questionHotspotVO;
//        }
        // 对象转封装类
        return questionHotspotVO;
    }

    /**
     * 分页获取题目热点封装
     *
     * @param questionHotspotPage
     * @param request
     * @return
     */
    @Override
    public Page<QuestionHotspotVO> getQuestionHotspotVOPage(Page<QuestionHotspot> questionHotspotPage, HttpServletRequest request) {
        List<QuestionHotspot> questionHotspotList = questionHotspotPage.getRecords();
        Page<QuestionHotspotVO> questionHotspotVOPage = new Page<>(questionHotspotPage.getCurrent(), questionHotspotPage.getSize(), questionHotspotPage.getTotal());
        if (CollUtil.isEmpty(questionHotspotList)) {
            return questionHotspotVOPage;
        }
        // 对象列表 => 封装对象列表
        List<QuestionHotspotVO> questionHotspotVOList = questionHotspotList.stream().map(QuestionHotspotVO::objToVo).collect(Collectors.toList());
        questionHotspotVOList.forEach(questionHotspotVO -> {
            // 填充题目基础信息（避免过长冗余信息）
            Question question = questionService.getById(questionHotspotVO.getQuestionId());
            if (question != null) {
                questionHotspotVO.setTitle(question.getTitle());
                questionHotspotVO.setContent(question.getContent());
                questionHotspotVO.setTagList(JSONUtil.toList(question.getTags(), String.class));
            }
        });
        questionHotspotVOPage.setRecords(questionHotspotVOList);
        return questionHotspotVOPage;
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
    public String buildFieldCacheKey(Long questionId, IncrementFieldEnum field) {
        return HOTSPOT_CACHE_PREFIX + ":" + questionId + ":" + field.getFieldName();
    }

    /**
     * 从缓存获取题目热点数据
     * 适配新的数值存储格式（非JSON格式）
     */
    @Override
    public QuestionHotspotVO getQuestionHotspotFromCache(Long questionId) {
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
    @Override
    public void cacheQuestionHotspotFields(QuestionHotspot questionHotspot) {
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

    /**
     * 热点字段递增接口（自动初始化）
     *
     * @param questionId 题目ID
     * @param field      字段枚举
     * @param cacheKey   缓存键
     * @return boolean
     **/
    @Override
    public Boolean doIncrementField(Long questionId, IncrementFieldEnum field, String cacheKey) {
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
            return false;
        }
        return success;
    }
}
