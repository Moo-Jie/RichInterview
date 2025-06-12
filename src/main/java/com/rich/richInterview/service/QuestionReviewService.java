package com.rich.richInterview.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.rich.richInterview.model.dto.questionReview.QuestionReviewAddRequest;
import com.rich.richInterview.model.dto.questionReview.QuestionReviewQueryRequest;
import com.rich.richInterview.model.dto.questionReview.QuestionReviewUpdateRequest;
import com.rich.richInterview.model.entity.QuestionReview;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 题目审批服务
 *
 */
public interface QuestionReviewService extends IService<QuestionReview> {

    /**
     *
     * 校验数据
     * @param questionReview
     * @param add
     * @return void
     * @author DuRuiChi
     * @create 2025/6/12
     **/
    void validQuestionReview(QuestionReview questionReview, boolean add);

    /**
     *
     * 获取查询条件
     * @param questionReviewQueryRequest
     * @return com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<com.rich.richInterview.model.entity.QuestionReview>
     * @author DuRuiChi
     * @create 2025/6/12
     **/
    QueryWrapper<QuestionReview> getQueryWrapper(QuestionReviewQueryRequest questionReviewQueryRequest);

    /**
     * 添加题目审批
     * @param questionReviewAddRequest
     * @param request
     * @return java.lang.Long
     * @author DuRuiChi
     * @create 2025/6/12
     **/
    Long addQuestionReview(QuestionReviewAddRequest questionReviewAddRequest, HttpServletRequest request);

    /**
     *
     * 删除题目审批
     * @param id
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/6/12
     **/
    Boolean deleteQuestionReview(Long id, HttpServletRequest request);

    /**
     *
     *  批量删除题目审批
     * @param ids
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/6/12
     **/
    Boolean batchDeleteQuestionReview(List<Long> ids, HttpServletRequest request);

    /**
     *
     *  更新题目审批
     * @param questionReviewUpdateRequest
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/6/12
     **/
    Boolean updateQuestionReview(QuestionReviewUpdateRequest questionReviewUpdateRequest);

    /**
     *
     * 通过审批
     * @param reviewId
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/6/12
     **/
    Boolean approveQuestionReview(Long reviewId, HttpServletRequest request);

    /**
     *
     *  批量通过审批
     * @param reviewIds
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/6/12
     **/
    Boolean batchApproveQuestionReview(List<Long> reviewIds, HttpServletRequest request);

    /**
     *
     *  拒绝审批
     * @param reviewId
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/6/12
     **/
    Boolean rejectQuestionReview(Long reviewId, HttpServletRequest request);

    /**
     *
     *  批量拒绝审批
     * @param reviewIds
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/6/12
     **/
    Boolean batchRejectQuestionReview(List<Long> reviewIds, HttpServletRequest request);
}
