package com.rich.richInterview.service.impl;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.CommonConstant;
import com.rich.richInterview.constant.IncrementField;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.mapper.QuestionHotspotMapper;
import com.rich.richInterview.model.dto.questionHotspot.QuestionHotspotQueryRequest;
import com.rich.richInterview.model.entity.Question;
import com.rich.richInterview.model.entity.QuestionHotspot;
import com.rich.richInterview.model.vo.QuestionHotspotVO;
import com.rich.richInterview.service.QuestionHotspotService;
import com.rich.richInterview.service.QuestionService;
import com.rich.richInterview.utils.SqlUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 题目热点服务实现
 *
 */
@Service
@Slf4j
public class QuestionHotspotServiceImpl extends ServiceImpl<QuestionHotspotMapper, QuestionHotspot> implements QuestionHotspotService {

    @Resource
    private QuestionService questionService;

    /**
     * 根据题目id获取题目热点
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
            hotspot = new QuestionHotspot();
            hotspot.setQuestionId(questionId);
            hotspot.setViewNum(0);
            hotspot.setStarNum(0);
            hotspot.setForwardNum(0);
            hotspot.setCollectNum(0);
            hotspot.setCommentNum(0);
            this.save(hotspot);
        }
        return hotspot;
    }

    /**
     * 热点字段递增接口（自动初始化）
     * @param questionId
     * @param field
     * @return boolean
     * @author DuRuiChi
     * @create 2025/5/22
     **/
    @Override
    public boolean incrementField(Long questionId, IncrementField field) {
        // 参数校验
        ThrowUtils.throwIf(questionId == null || field == null, ErrorCode.PARAMS_ERROR);
        Question q = questionService.getById(questionId);
        ThrowUtils.throwIf(q == null, ErrorCode.NOT_FOUND_ERROR);

        // 使用原子操作进行字段递增
        UpdateWrapper<QuestionHotspot> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("questionId", questionId)
                .setSql(field.getFieldName() + " = " + field.getFieldName() + " + 1");

        // 如果不存在记录则创建
        boolean exists = this.baseMapper.exists(new QueryWrapper<QuestionHotspot>()
                .eq("questionId", questionId));
        if (!exists) {
            QuestionHotspot newRecord = new QuestionHotspot();
            newRecord.setQuestionId(questionId);
            newRecord.setViewNum(0);
            newRecord.setStarNum(0);
            newRecord.setForwardNum(0);
            newRecord.setCollectNum(0);
            newRecord.setCommentNum(0);
            this.save(newRecord);
        }

        return this.update(updateWrapper);
    }

    /**
     * 校验数据
     *
     * @param questionHotspot
     * @param add      对创建的数据进行校验
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
        Question question = questionService.getById(questionHotspot.getQuestionId());
        if (question != null) {
            // 填充题目基础信息
            questionHotspotVO.setTitle(question.getTitle());
            questionHotspotVO.setContent(question.getContent());
            questionHotspotVO.setAnswer(question.getAnswer());
            questionHotspotVO.setTagList(JSONUtil.toList(question.getTags(), String.class));
            return questionHotspotVO;
        }
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
            // 填充题目基础信息
            Question question = questionService.getById(questionHotspotVO.getQuestionId());
            if (question!= null) {
                questionHotspotVO.setTitle(question.getTitle());
                questionHotspotVO.setContent(question.getContent());
                questionHotspotVO.setAnswer(question.getAnswer());
                questionHotspotVO.setTagList(JSONUtil.toList(question.getTags(), String.class));
            }
        });
        questionHotspotVOPage.setRecords(questionHotspotVOList);
        return questionHotspotVOPage;
    }
}
