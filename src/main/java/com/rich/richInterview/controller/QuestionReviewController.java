package com.rich.richInterview.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rich.richInterview.common.BaseResponse;
import com.rich.richInterview.common.DeleteRequest;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.SourceConstant;
import com.rich.richInterview.model.entity.Question;
import com.rich.richInterview.model.enums.ReviewStatusEnum;
import com.rich.richInterview.service.QuestionService;
import com.rich.richInterview.utils.ResultUtils;
import com.rich.richInterview.constant.UserConstant;
import com.rich.richInterview.exception.BusinessException;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.model.dto.questionReview.QuestionReviewAddRequest;
import com.rich.richInterview.model.dto.questionReview.QuestionReviewQueryRequest;
import com.rich.richInterview.model.dto.questionReview.QuestionReviewUpdateRequest;
import com.rich.richInterview.model.entity.QuestionReview;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.service.QuestionReviewService;
import com.rich.richInterview.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
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

    @Resource
    private UserService userService;

    @Resource
    private QuestionService questionService;

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
        // todo 在此处将实体类和 DTO 进行转换
        QuestionReview questionReview = new QuestionReview();
        BeanUtils.copyProperties(questionReviewAddRequest, questionReview);
        // tags 的转换
        if (questionReviewAddRequest.getTags() != null) {
            questionReview.setTags(JSONUtil.toJsonStr(questionReviewAddRequest.getTags()));
        }
        // 数据校验
        questionReviewService.validQuestionReview(questionReview, true);
        // todo 填充默认值
        User loginUser = userService.getLoginUser(request);
        questionReview.setUserId(loginUser.getId());
        // 初始化为待审核
        questionReview.setReviewStatus(ReviewStatusEnum.WAITING.getCode());
        // 写入数据库
        boolean result = questionReviewService.save(questionReview);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        // 返回新写入的数据 id
        long newQuestionReviewId = questionReview.getId();
        return ResultUtils.success(newQuestionReviewId);
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
        User user = userService.getLoginUser(request);
        long id = deleteRequest.getId();
        // 判断是否存在
        QuestionReview oldQuestionReview = questionReviewService.getById(id);
        ThrowUtils.throwIf(oldQuestionReview == null, ErrorCode.NOT_FOUND_ERROR);
        // 仅本人或管理员可删除
        if (!oldQuestionReview.getUserId().equals(user.getId()) && !userService.isAdmin(request)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
        // 操作数据库
        boolean result = questionReviewService.removeById(id);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
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

        ids.forEach(id -> {
            QuestionReview questionReview = questionReviewService.getById(id);
            ThrowUtils.throwIf(questionReview == null, ErrorCode.NOT_FOUND_ERROR);

            boolean result = questionReviewService.removeById(id);
            ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        });

        return ResultUtils.success(true);
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
        // todo 在此处将实体类和 DTO 进行转换
        QuestionReview questionReview = new QuestionReview();
        BeanUtils.copyProperties(questionReviewUpdateRequest, questionReview);
        // 数据校验
        questionReviewService.validQuestionReview(questionReview, false);
        // 判断是否存在
        long id = questionReviewUpdateRequest.getId();
        QuestionReview oldQuestionReview = questionReviewService.getById(id);
        ThrowUtils.throwIf(oldQuestionReview == null, ErrorCode.NOT_FOUND_ERROR);
        // 操作数据库
        boolean result = questionReviewService.updateById(questionReview);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
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

        // 获取审批记录
        QuestionReview questionReview = questionReviewService.getById(reviewId);
        ThrowUtils.throwIf(questionReview == null, ErrorCode.NOT_FOUND_ERROR);
        ThrowUtils.throwIf(!(ReviewStatusEnum.WAITING.getCode() == questionReview.getReviewStatus()),
                ErrorCode.OPERATION_ERROR, "非待审批状态");

        // 获取当前审批人
        User reviewer = userService.getLoginUser(request);

        // 转储到题目表
        Question question = new Question();
        // 复制基础字段
        BeanUtils.copyProperties(questionReview, question);
        // 来源设置为用户提供
        question.setSource(SourceConstant.USER_PROVIDE);
        // 设置审核信息
        question.setReviewerId(reviewer.getId());
        question.setReviewStatus(ReviewStatusEnum.PASS.getCode());

        // 同步到题目表
        boolean saveResult = questionService.save(question);
        ThrowUtils.throwIf(!saveResult, ErrorCode.OPERATION_ERROR);

        // 更新审批记录状态
        QuestionReview updateEntity = new QuestionReview();
        updateEntity.setId(reviewId);
        updateEntity.setReviewStatus(ReviewStatusEnum.PASS.getCode());

        boolean updateResult = questionReviewService.updateById(updateEntity);
        ThrowUtils.throwIf(!updateResult, ErrorCode.OPERATION_ERROR);

        return ResultUtils.success(true);
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

        User reviewer = userService.getLoginUser(request);

        reviewIds.forEach(reviewId -> {
            QuestionReview questionReview = questionReviewService.getById(reviewId);
            ThrowUtils.throwIf(questionReview == null, ErrorCode.NOT_FOUND_ERROR);
            ThrowUtils.throwIf(!(ReviewStatusEnum.WAITING.getCode() == questionReview.getReviewStatus()),
                    ErrorCode.OPERATION_ERROR, "ID为" + reviewId + "的记录非待审批状态");
            // 转储到题目表
            Question question = new Question();
            // 复制基础字段
            BeanUtils.copyProperties(questionReview, question);
            // 来源设置为用户提供
            question.setSource(SourceConstant.USER_PROVIDE);
            // 设置审核信息
            question.setReviewerId(reviewer.getId());
            question.setReviewStatus(ReviewStatusEnum.PASS.getCode());
            boolean saveResult = questionService.save(question);
            ThrowUtils.throwIf(!saveResult, ErrorCode.OPERATION_ERROR);

            // 更新审批记录
            QuestionReview updateEntity = new QuestionReview();
            updateEntity.setId(reviewId);
            updateEntity.setReviewStatus(ReviewStatusEnum.PASS.getCode());

            boolean updateResult = questionReviewService.updateById(updateEntity);
            ThrowUtils.throwIf(!updateResult, ErrorCode.OPERATION_ERROR);
        });

        return ResultUtils.success(true);
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

        QuestionReview questionReview = questionReviewService.getById(reviewId);
        ThrowUtils.throwIf(questionReview == null, ErrorCode.NOT_FOUND_ERROR);
        ThrowUtils.throwIf(!(ReviewStatusEnum.WAITING.getCode() == questionReview.getReviewStatus()),
                ErrorCode.OPERATION_ERROR, "非待审批状态");

        QuestionReview updateEntity = new QuestionReview();
        updateEntity.setId(reviewId);
        updateEntity.setReviewStatus(ReviewStatusEnum.REJECT.getCode());

        boolean result = questionReviewService.updateById(updateEntity);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
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

        reviewIds.forEach(reviewId -> {
            QuestionReview questionReview = questionReviewService.getById(reviewId);
            ThrowUtils.throwIf(questionReview == null, ErrorCode.NOT_FOUND_ERROR);
            ThrowUtils.throwIf(!(ReviewStatusEnum.WAITING.getCode() == questionReview.getReviewStatus()),
                    ErrorCode.OPERATION_ERROR, "ID为"+reviewId+"的记录非待审批状态");

            QuestionReview updateEntity = new QuestionReview();
            updateEntity.setId(reviewId);
            updateEntity.setReviewStatus(ReviewStatusEnum.REJECT.getCode());

            boolean result = questionReviewService.updateById(updateEntity);
            ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        });

        return ResultUtils.success(true);
    }
}
