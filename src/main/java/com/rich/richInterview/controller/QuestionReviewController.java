package com.rich.richInterview.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rich.richInterview.common.BaseResponse;
import com.rich.richInterview.common.DeleteRequest;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.UserConstant;
import com.rich.richInterview.exception.BusinessException;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.model.dto.questionReview.QuestionReviewAddRequest;
import com.rich.richInterview.model.dto.questionReview.QuestionReviewQueryRequest;
import com.rich.richInterview.model.dto.questionReview.QuestionReviewUpdateRequest;
import com.rich.richInterview.model.entity.QuestionReview;
import com.rich.richInterview.service.QuestionReviewService;
import com.rich.richInterview.utils.ResultUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 题目审批接口
 */
@RestController
@RequestMapping("/questionReview")
@Slf4j
public class QuestionReviewController {

    @Resource
    private QuestionReviewService questionReviewService;

    /**
     * 用户提交题目审批
     *
     * @param questionReviewAddRequest
     * @param request
     * @return
     */
    @PostMapping("/add")
    public BaseResponse<Long> addQuestionReview(@RequestBody QuestionReviewAddRequest questionReviewAddRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(questionReviewAddRequest == null, ErrorCode.PARAMS_ERROR);

        return ResultUtils.success(questionReviewService.addQuestionReview(questionReviewAddRequest, request));
    }

    /**
     * 删除题目审批内容
     *
     * @param deleteRequest
     * @param request
     * @return
     */
    @PostMapping("/delete")
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> deleteQuestionReview(@RequestBody DeleteRequest deleteRequest, HttpServletRequest request) {
        if (deleteRequest == null || deleteRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        return ResultUtils.success(questionReviewService.deleteQuestionReview(deleteRequest.getId(), request));
    }

    /**
     * 批量删除审批记录
     */
    @PostMapping("/batch/delete")
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> batchDeleteQuestionReview(
            @RequestBody List<Long> ids,
            HttpServletRequest request) {
        ThrowUtils.throwIf(ids == null || ids.isEmpty(), ErrorCode.PARAMS_ERROR);

        return ResultUtils.success(questionReviewService.batchDeleteQuestionReview(ids, request));
    }

    /**
     * 更新题目审批内容（仅管理员可用）
     *
     * @param questionReviewUpdateRequest
     * @return
     */
    @PostMapping("/update")
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> updateQuestionReview(@RequestBody QuestionReviewUpdateRequest questionReviewUpdateRequest) {
        if (questionReviewUpdateRequest == null || questionReviewUpdateRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        return ResultUtils.success(questionReviewService.updateQuestionReview(questionReviewUpdateRequest));
    }

    /**
     * 分页获取题目审批列表（仅管理员可用）
     *
     * @param questionReviewQueryRequest
     * @return
     */
    @PostMapping("/list/page")
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<QuestionReview>> listQuestionReviewByPage(@RequestBody QuestionReviewQueryRequest questionReviewQueryRequest) {
        long current = questionReviewQueryRequest.getCurrent();
        long size = questionReviewQueryRequest.getPageSize();
        // 查询数据库
        Page<QuestionReview> questionReviewPage = questionReviewService.page(new Page<>(current, size),
                questionReviewService.getQueryWrapper(questionReviewQueryRequest));
        return ResultUtils.success(questionReviewPage);
    }


    /**
     * 审批通过接口
     *
     * @param reviewId
     */
    @PostMapping("/review/pass")
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> approveQuestionReview(
            @RequestParam Long reviewId,
            HttpServletRequest request) {

        // 参数校验
        ThrowUtils.throwIf(reviewId == null || reviewId <= 0, ErrorCode.PARAMS_ERROR);

        return ResultUtils.success(questionReviewService.approveQuestionReview(reviewId, request));
    }

    /**
     * 批量通过审批接口
     */
    @PostMapping("/review/batch/pass")
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> batchApproveQuestionReview(
            @RequestBody List<Long> reviewIds,
            HttpServletRequest request) {
        ThrowUtils.throwIf(reviewIds == null || reviewIds.isEmpty(), ErrorCode.PARAMS_ERROR);

        return ResultUtils.success(questionReviewService.batchApproveQuestionReview(reviewIds, request));
    }

    /**
     * 拒绝审批接口
     */
    @PostMapping("/review/reject")
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> rejectQuestionReview(
            @RequestParam Long reviewId,
            HttpServletRequest request) {
        // 参数校验
        ThrowUtils.throwIf(reviewId == null || reviewId <= 0, ErrorCode.PARAMS_ERROR);
        return ResultUtils.success(questionReviewService.rejectQuestionReview(reviewId, request));
    }

    /**
     * 批量拒绝审批接口
     */
    @PostMapping("/review/batch/reject")
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> batchRejectQuestionReview(
            @RequestBody List<Long> reviewIds,
            HttpServletRequest request) {
        ThrowUtils.throwIf(reviewIds == null || reviewIds.isEmpty(), ErrorCode.PARAMS_ERROR);

        return ResultUtils.success(questionReviewService.batchRejectQuestionReview(reviewIds, request));
    }
}
