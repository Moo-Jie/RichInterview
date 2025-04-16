package com.rich.richInterview.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rich.richInterview.annotation.AuthCheck;
import com.rich.richInterview.common.BaseResponse;
import com.rich.richInterview.common.DeleteRequest;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.common.ResultUtils;
import com.rich.richInterview.constant.UserConstant;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.model.dto.question.QuestionAddRequest;
import com.rich.richInterview.model.dto.question.QuestionEditRequest;
import com.rich.richInterview.model.dto.question.QuestionQueryRequest;
import com.rich.richInterview.model.dto.question.QuestionUpdateRequest;
import com.rich.richInterview.model.entity.Question;
import com.rich.richInterview.model.vo.QuestionVO;
import com.rich.richInterview.service.QuestionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

/**
 * 题目接口
  *
 */
@RestController
@RequestMapping("/question")
@Slf4j
public class QuestionController {

    @Resource
    private QuestionService questionService;

    /**
     * 创建题目（仅管理员可用）
     *
     * @param questionAddRequest
     * @param request
     * @return
     */
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    @PostMapping("/add")
    public BaseResponse<Long> addQuestion(@RequestBody QuestionAddRequest questionAddRequest, HttpServletRequest request) {
        return ResultUtils.success(questionService.addQuestion(questionAddRequest, request));
    }

    /**
     * 删除题目（仅管理员可用）
     *
     * @param deleteRequest
     * @param request
     * @return
     */
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    @PostMapping("/delete")
    public BaseResponse<Boolean> deleteQuestion(@RequestBody DeleteRequest deleteRequest, HttpServletRequest request) {
        return ResultUtils.success(questionService.deleteQuestion(deleteRequest, request));
    }

    /**
     * 更新题目（仅管理员可用）
     *
     * @param questionUpdateRequest
     * @return
     */
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    @PostMapping("/update")
    public BaseResponse<Boolean> updateQuestion(@RequestBody QuestionUpdateRequest questionUpdateRequest,HttpServletRequest request) {
        return ResultUtils.success(questionService.updateQuestion(questionUpdateRequest, request));
    }

    /**
     * 根据 id 获取题目（封装类）
     *
     * @param id
     * @return
     */
    @GetMapping("/get/vo")
    public BaseResponse<QuestionVO> getQuestionVOById(long id, HttpServletRequest request) {
        // TODO 校验是否会员题目
        ThrowUtils.throwIf(id <= 0, ErrorCode.PARAMS_ERROR);
        // 查询数据库
        Question question = questionService.getById(id);
        ThrowUtils.throwIf(question == null, ErrorCode.NOT_FOUND_ERROR);
        // 获取封装类
        return ResultUtils.success(questionService.getQuestionVO(question, request));
    }

    /**
     * 分页获取题目列表（仅管理员可用）
     * @param questionQueryRequest
     * @return
     */
    @PostMapping("/list/page")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<Question>> listQuestionByPage(@RequestBody QuestionQueryRequest questionQueryRequest) {
        // 查询数据库
        Page<Question> questionPage = questionService.getQuestionPage(questionQueryRequest);
        return ResultUtils.success(questionPage);
    }

    /**
     * 分页获取题目列表（封装类）
     *
     * @param questionQueryRequest
     * @param request
     * @return
     */
    @PostMapping("/list/page/vo")
    public BaseResponse<Page<QuestionVO>> listQuestionVOByPage(@RequestBody QuestionQueryRequest questionQueryRequest,
                                                               HttpServletRequest request) {
        long size = questionQueryRequest.getPageSize();
        // TODO 安全性配置
        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        // 查询数据库
        Page<Question> questionPage = questionService.getQuestionPage(questionQueryRequest);
        // 获取封装类
        return ResultUtils.success(questionService.getQuestionVOPage(questionPage, request));
    }

    /**
     * 分页获取当前登录用户创建的题目列表
     *
     * @param questionQueryRequest
     * @param request
     * @return
     */
    @PostMapping("/my/list/page/vo")
    public BaseResponse<Page<QuestionVO>> listMyQuestionVOByPage(@RequestBody QuestionQueryRequest questionQueryRequest,
                                                                 HttpServletRequest request) {
        return ResultUtils.success(questionService.listMyQuestionVOByPage(questionQueryRequest, request));
    }

    /**
     * 编辑题目（给用户使用）
     * @param questionEditRequest
     * @param request
     * @return
     */
    @PostMapping("/edit")
    public BaseResponse<Boolean> editQuestion(@RequestBody QuestionEditRequest questionEditRequest, HttpServletRequest request) {
        return ResultUtils.success(questionService.editQuestion(questionEditRequest, request));
    }


}
