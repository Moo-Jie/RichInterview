package com.rich.richInterview.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rich.richInterview.annotation.AuthCheck;
import com.rich.richInterview.common.BaseResponse;
import com.rich.richInterview.common.DeleteRequest;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.common.ResultUtils;
import com.rich.richInterview.constant.IncrementField;
import com.rich.richInterview.constant.UserConstant;
import com.rich.richInterview.exception.BusinessException;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.model.dto.questionHotspot.QuestionHotspotAddRequest;
import com.rich.richInterview.model.dto.questionHotspot.QuestionHotspotEditRequest;
import com.rich.richInterview.model.dto.questionHotspot.QuestionHotspotQueryRequest;
import com.rich.richInterview.model.dto.questionHotspot.QuestionHotspotUpdateRequest;
import com.rich.richInterview.model.entity.QuestionHotspot;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.model.vo.QuestionHotspotVO;
import com.rich.richInterview.service.QuestionHotspotService;
import com.rich.richInterview.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
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

    /**
     * 热点字段递增接口（自动初始化）
     */
    @PostMapping("/increment")
    public BaseResponse<Boolean> incrementField(
            @RequestParam Long questionId,
            @RequestParam String fieldType) {
        ThrowUtils.throwIf(questionId == null, ErrorCode.PARAMS_ERROR);

        // 使用字段名查找对应的枚举
        IncrementField field = IncrementField.fromFieldName(fieldType);

        boolean result = questionHotspotService.incrementField(questionId, field);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }

    /**
     * 根据题目ID获取热点封装类
     * @param questionId 题目ID
     * @param request
     * @return QuestionHotspotVO
     */
    @GetMapping("/get/vo/byQuestionId")
    public BaseResponse<QuestionHotspotVO> getQuestionHotspotVOByQuestionId(
            @RequestParam Long questionId,
            HttpServletRequest request) {
        ThrowUtils.throwIf(questionId == null || questionId <= 0, ErrorCode.PARAMS_ERROR);

        // 通过题目ID查询热点记录
        QuestionHotspot questionHotspot = questionHotspotService.getByQuestionId(questionId);
        ThrowUtils.throwIf(questionHotspot == null, ErrorCode.NOT_FOUND_ERROR);

        return ResultUtils.success(questionHotspotService.getQuestionHotspotVO(questionHotspot, request));
    }

    /**
     * 更新题目热点（仅管理员可用）
     *
     * @param questionHotspotUpdateRequest
     * @return
     */
    @PostMapping("/update")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> updateQuestionHotspot(@RequestBody QuestionHotspotUpdateRequest questionHotspotUpdateRequest) {
        if (questionHotspotUpdateRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        // todo 在此处将实体类和 DTO 进行转换
        QuestionHotspot questionHotspot = new QuestionHotspot();
        BeanUtils.copyProperties(questionHotspotUpdateRequest, questionHotspot);
        // 数据校验
        questionHotspotService.validQuestionHotspot(questionHotspot, false);
        // 操作数据库
        boolean result = questionHotspotService.updateById(questionHotspot);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }

    /**
     * 分页获取题目热点列表（仅管理员可用）
     *
     * @param questionHotspotQueryRequest
     * @return
     */
    @PostMapping("/list/page")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<QuestionHotspot>> listQuestionHotspotByPage(@RequestBody QuestionHotspotQueryRequest questionHotspotQueryRequest) {
        long current = questionHotspotQueryRequest.getCurrent();
        long size = questionHotspotQueryRequest.getPageSize();
        // 查询数据库
        Page<QuestionHotspot> questionHotspotPage = questionHotspotService.page(new Page<>(current, size),
                questionHotspotService.getQueryWrapper(questionHotspotQueryRequest));
        return ResultUtils.success(questionHotspotPage);
    }

    /**
     * 分页获取题目热点列表（封装类）
     *
     * @param questionHotspotQueryRequest
     * @param request
     * @return
     */
    @PostMapping("/list/page/vo")
    public BaseResponse<Page<QuestionHotspotVO>> listQuestionHotspotVOByPage(@RequestBody QuestionHotspotQueryRequest questionHotspotQueryRequest,
                                                                             HttpServletRequest request) {
        long current = questionHotspotQueryRequest.getCurrent();
        long size = questionHotspotQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        // 查询数据库
        Page<QuestionHotspot> questionHotspotPage = questionHotspotService.page(new Page<>(current, size),
                questionHotspotService.getQueryWrapper(questionHotspotQueryRequest));
        // 获取封装类
        return ResultUtils.success(questionHotspotService.getQuestionHotspotVOPage(questionHotspotPage, request));
    }
}
