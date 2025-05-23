package com.rich.richInterview.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rich.richInterview.annotation.AuthCheck;
import com.rich.richInterview.common.BaseResponse;
import com.rich.richInterview.common.DeleteRequest;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.common.ResultUtils;
import com.rich.richInterview.constant.UserConstant;
import com.rich.richInterview.exception.BusinessException;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.model.dto.questionBankHotspot.QuestionBankHotspotAddRequest;
import com.rich.richInterview.model.dto.questionBankHotspot.QuestionBankHotspotEditRequest;
import com.rich.richInterview.model.dto.questionBankHotspot.QuestionBankHotspotQueryRequest;
import com.rich.richInterview.model.dto.questionBankHotspot.QuestionBankHotspotUpdateRequest;
import com.rich.richInterview.model.entity.QuestionBankHotspot;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.model.vo.QuestionBankHotspotVO;
import com.rich.richInterview.service.QuestionBankHotspotService;
import com.rich.richInterview.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

/**
 * 题库热点接口
 *
 */
@RestController
@RequestMapping("/questionBankHotspot")
@Slf4j
public class QuestionBankHotspotController {

    @Resource
    private QuestionBankHotspotService questionBankHotspotService;

    @Resource
    private UserService userService;



    /**
     * 创建题库热点
     *
     * @param questionBankHotspotAddRequest
     * @param request
     * @return
     */
    @PostMapping("/add")
    public BaseResponse<Long> addQuestionBankHotspot(@RequestBody QuestionBankHotspotAddRequest questionBankHotspotAddRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(questionBankHotspotAddRequest == null, ErrorCode.PARAMS_ERROR);
        // todo 在此处将实体类和 DTO 进行转换
        QuestionBankHotspot questionBankHotspot = new QuestionBankHotspot();
        BeanUtils.copyProperties(questionBankHotspotAddRequest, questionBankHotspot);
        // 数据校验
        questionBankHotspotService.validQuestionBankHotspot(questionBankHotspot, true);
        // todo 填充默认值
        User loginUser = userService.getLoginUser(request);
        // 写入数据库
        boolean result = questionBankHotspotService.save(questionBankHotspot);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        // 返回新写入的数据 id
        long newQuestionBankHotspotId = questionBankHotspot.getId();
        return ResultUtils.success(newQuestionBankHotspotId);
    }

    /**
     * 删除题库热点
     *
     * @param deleteRequest
     * @param request
     * @return
     */
    @PostMapping("/delete")
    public BaseResponse<Boolean> deleteQuestionBankHotspot(@RequestBody DeleteRequest deleteRequest, HttpServletRequest request) {
        if (deleteRequest == null || deleteRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        User user = userService.getLoginUser(request);
        long id = deleteRequest.getId();
        // 判断是否存在
        QuestionBankHotspot oldQuestionBankHotspot = questionBankHotspotService.getById(id);
        ThrowUtils.throwIf(oldQuestionBankHotspot == null, ErrorCode.NOT_FOUND_ERROR);
        // 操作数据库
        boolean result = questionBankHotspotService.removeById(id);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }

    /**
     * 更新题库热点（仅管理员可用）
     *
     * @param questionBankHotspotUpdateRequest
     * @return
     */
    @PostMapping("/update")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> updateQuestionBankHotspot(@RequestBody QuestionBankHotspotUpdateRequest questionBankHotspotUpdateRequest) {
        if (questionBankHotspotUpdateRequest == null || questionBankHotspotUpdateRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        // todo 在此处将实体类和 DTO 进行转换
        QuestionBankHotspot questionBankHotspot = new QuestionBankHotspot();
        BeanUtils.copyProperties(questionBankHotspotUpdateRequest, questionBankHotspot);
        // 数据校验
        questionBankHotspotService.validQuestionBankHotspot(questionBankHotspot, false);
        // 判断是否存在
        long id = questionBankHotspotUpdateRequest.getId();
        QuestionBankHotspot oldQuestionBankHotspot = questionBankHotspotService.getById(id);
        ThrowUtils.throwIf(oldQuestionBankHotspot == null, ErrorCode.NOT_FOUND_ERROR);
        // 操作数据库
        boolean result = questionBankHotspotService.updateById(questionBankHotspot);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }

    /**
     * 根据 id 获取题库热点（封装类）
     *
     * @param id
     * @return
     */
    @GetMapping("/get/vo")
    public BaseResponse<QuestionBankHotspotVO> getQuestionBankHotspotVOById(long id, HttpServletRequest request) {
        ThrowUtils.throwIf(id <= 0, ErrorCode.PARAMS_ERROR);
        // 查询数据库
        QuestionBankHotspot questionBankHotspot = questionBankHotspotService.getById(id);
        ThrowUtils.throwIf(questionBankHotspot == null, ErrorCode.NOT_FOUND_ERROR);
        // 获取封装类
        return ResultUtils.success(questionBankHotspotService.getQuestionBankHotspotVO(questionBankHotspot, request));
    }

    /**
     * 分页获取题库热点列表（仅管理员可用）
     *
     * @param questionBankHotspotQueryRequest
     * @return
     */
    @PostMapping("/list/page")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<QuestionBankHotspot>> listQuestionBankHotspotByPage(@RequestBody QuestionBankHotspotQueryRequest questionBankHotspotQueryRequest) {
        long current = questionBankHotspotQueryRequest.getCurrent();
        long size = questionBankHotspotQueryRequest.getPageSize();
        // 查询数据库
        Page<QuestionBankHotspot> questionBankHotspotPage = questionBankHotspotService.page(new Page<>(current, size),
                questionBankHotspotService.getQueryWrapper(questionBankHotspotQueryRequest));
        return ResultUtils.success(questionBankHotspotPage);
    }

    /**
     * 分页获取题库热点列表（封装类）
     *
     * @param questionBankHotspotQueryRequest
     * @param request
     * @return
     */
    @PostMapping("/list/page/vo")
    public BaseResponse<Page<QuestionBankHotspotVO>> listQuestionBankHotspotVOByPage(@RequestBody QuestionBankHotspotQueryRequest questionBankHotspotQueryRequest,
                                                               HttpServletRequest request) {
        long current = questionBankHotspotQueryRequest.getCurrent();
        long size = questionBankHotspotQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        // 查询数据库
        Page<QuestionBankHotspot> questionBankHotspotPage = questionBankHotspotService.page(new Page<>(current, size),
                questionBankHotspotService.getQueryWrapper(questionBankHotspotQueryRequest));
        // 获取封装类
        return ResultUtils.success(questionBankHotspotService.getQuestionBankHotspotVOPage(questionBankHotspotPage, request));
    }

    /**
     * 分页获取当前登录用户创建的题库热点列表
     *
     * @param questionBankHotspotQueryRequest
     * @param request
     * @return
     */
    @PostMapping("/my/list/page/vo")
    public BaseResponse<Page<QuestionBankHotspotVO>> listMyQuestionBankHotspotVOByPage(@RequestBody QuestionBankHotspotQueryRequest questionBankHotspotQueryRequest,
                                                                 HttpServletRequest request) {
        ThrowUtils.throwIf(questionBankHotspotQueryRequest == null, ErrorCode.PARAMS_ERROR);
        // 补充查询条件，只查询当前登录用户的数据
        User loginUser = userService.getLoginUser(request);
        questionBankHotspotQueryRequest.setUserId(loginUser.getId());
        long current = questionBankHotspotQueryRequest.getCurrent();
        long size = questionBankHotspotQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        // 查询数据库
        Page<QuestionBankHotspot> questionBankHotspotPage = questionBankHotspotService.page(new Page<>(current, size),
                questionBankHotspotService.getQueryWrapper(questionBankHotspotQueryRequest));
        // 获取封装类
        return ResultUtils.success(questionBankHotspotService.getQuestionBankHotspotVOPage(questionBankHotspotPage, request));
    }

    /**
     * 编辑题库热点（给用户使用）
     *
     * @param questionBankHotspotEditRequest
     * @param request
     * @return
     */
    @PostMapping("/edit")
    public BaseResponse<Boolean> editQuestionBankHotspot(@RequestBody QuestionBankHotspotEditRequest questionBankHotspotEditRequest, HttpServletRequest request) {
        if (questionBankHotspotEditRequest == null || questionBankHotspotEditRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        // todo 在此处将实体类和 DTO 进行转换
        QuestionBankHotspot questionBankHotspot = new QuestionBankHotspot();
        BeanUtils.copyProperties(questionBankHotspotEditRequest, questionBankHotspot);
        // 数据校验
        questionBankHotspotService.validQuestionBankHotspot(questionBankHotspot, false);
        User loginUser = userService.getLoginUser(request);
        // 判断是否存在
        long id = questionBankHotspotEditRequest.getId();
        QuestionBankHotspot oldQuestionBankHotspot = questionBankHotspotService.getById(id);
        ThrowUtils.throwIf(oldQuestionBankHotspot == null, ErrorCode.NOT_FOUND_ERROR);
        // 操作数据库
        boolean result = questionBankHotspotService.updateById(questionBankHotspot);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }


}
