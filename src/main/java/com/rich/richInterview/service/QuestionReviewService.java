package com.rich.richInterview.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.rich.richInterview.model.dto.questionReview.QuestionReviewQueryRequest;
import com.rich.richInterview.model.entity.QuestionReview;

import javax.servlet.http.HttpServletRequest;

/**
 * 题目审批服务
 *
 */
public interface QuestionReviewService extends IService<QuestionReview> {

    /**
     * 校验数据
     *
     * @param questionReview
     * @param add 对创建的数据进行校验
     */
    void validQuestionReview(QuestionReview questionReview, boolean add);

    /**
     * 获取查询条件
     *
     * @param questionReviewQueryRequest
     * @return
     */
    QueryWrapper<QuestionReview> getQueryWrapper(QuestionReviewQueryRequest questionReviewQueryRequest);
}
