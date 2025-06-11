package com.rich.richInterview.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import cn.dev33.satoken.annotation.SaMode;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rich.richInterview.common.BaseResponse;
import com.rich.richInterview.common.DeleteRequest;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.UserConstant;
import com.rich.richInterview.exception.BusinessException;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.model.dto.mockInterview.MockInterviewAddRequest;
import com.rich.richInterview.model.dto.mockInterview.MockInterviewEventRequest;
import com.rich.richInterview.model.dto.mockInterview.MockInterviewQueryRequest;
import com.rich.richInterview.model.entity.MockInterview;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.model.enums.MockInterviewStatusEnum;
import com.rich.richInterview.service.MockInterviewService;
import com.rich.richInterview.service.UserService;
import com.rich.richInterview.utils.ResultUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

/**
 * 模拟面试接口
 */
@RestController
@RequestMapping("/mockInterview")
@Slf4j
public class MockInterviewController {

    @Resource
    private MockInterviewService mockInterviewService;

    @Resource
    private UserService userService;


    /**
     * 创建模拟面试记录
     *
     * @param mockInterviewAddRequest
     * @param request
     * @return com.rich.richInterview.common.BaseResponse<java.lang.Long>
     * @author DuRuiChi
     * @create 2025/6/11
     **/
    @PostMapping("/add")
    @SaCheckRole(value = {UserConstant.ADMIN_ROLE, UserConstant.DEFAULT_ROLE}, mode = SaMode.OR)
    public BaseResponse<Long> addMockInterview(@RequestBody MockInterviewAddRequest mockInterviewAddRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(mockInterviewAddRequest == null, ErrorCode.PARAMS_ERROR);
        // 实体类和 DTO 进行转换
        MockInterview mockInterview = new MockInterview();
        BeanUtils.copyProperties(mockInterviewAddRequest, mockInterview);
        // 数据校验
        mockInterviewService.validMockInterview(mockInterview, true);
        // 填充默认值
        mockInterview.setStatus(MockInterviewStatusEnum.WAITING.getCode());
        User loginUser = userService.getLoginUser(request);
        mockInterview.setUserId(loginUser.getId());
        // 写入数据库
        boolean result = mockInterviewService.save(mockInterview);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        // 返回新写入的数据 id
        return ResultUtils.success(mockInterview.getId());
    }

    /**
     * 删除模拟面试记录
     *
     * @param deleteRequest
     * @param request
     * @return com.rich.richInterview.common.BaseResponse<java.lang.Boolean>
     * @author DuRuiChi
     * @create 2025/6/11
     **/
    @PostMapping("/delete")
    @SaCheckRole(value = {UserConstant.ADMIN_ROLE, UserConstant.DEFAULT_ROLE}, mode = SaMode.OR)
    public BaseResponse<Boolean> deleteMockInterview(@RequestBody DeleteRequest deleteRequest, HttpServletRequest request) {
        // 校验参数
        if (deleteRequest == null || deleteRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        // 判断是否存在
        User user = userService.getLoginUser(request);
        long id = deleteRequest.getId();
        MockInterview oldMockInterview = mockInterviewService.getById(id);
        ThrowUtils.throwIf(oldMockInterview == null, ErrorCode.NOT_FOUND_ERROR);
        // 仅本人或管理员可删除
        if (!oldMockInterview.getUserId().equals(user.getId()) && !userService.isAdmin(request)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
        // 操作数据库
        boolean result = mockInterviewService.removeById(id);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }

    /**
     * 分页获取当前登录用户的模拟面试记录列表
     *
     * @param mockInterviewQueryRequest
     * @return com.rich.richInterview.common.BaseResponse<com.baomidou.mybatisplus.extension.plugins.pagination.Page < com.rich.richInterview.model.entity.MockInterview>>
     * @author DuRuiChi
     * @create 2025/6/11
     **/
    @PostMapping("/list/page/my")
    @SaCheckRole(value = {UserConstant.ADMIN_ROLE, UserConstant.DEFAULT_ROLE}, mode = SaMode.OR)
    public BaseResponse<Page<MockInterview>> listMyMockInterviewByPage(@RequestBody MockInterviewQueryRequest mockInterviewQueryRequest, HttpServletRequest request) {
        long current = mockInterviewQueryRequest.getCurrent();
        long size = mockInterviewQueryRequest.getPageSize();
        // 只能获取当前登录用户的模拟面试记录
        User loginUser = userService.getLoginUser(request);
        mockInterviewQueryRequest.setUserId(loginUser.getId());
        // 查询数据库
        Page<MockInterview> mockInterviewPage = mockInterviewService.page(new Page<>(current, size),
                mockInterviewService.getQueryWrapper(mockInterviewQueryRequest));
        return ResultUtils.success(mockInterviewPage);
    }

    /**
     * 分页获取模拟面试记录列表（仅管理员）
     *
     * @param mockInterviewQueryRequest
     * @return com.rich.richInterview.common.BaseResponse<com.baomidou.mybatisplus.extension.plugins.pagination.Page < com.rich.richInterview.model.entity.MockInterview>>
     * @author DuRuiChi
     * @create 2025/6/11
     **/
    @PostMapping("/list/page/admin")
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<MockInterview>> listAdminMockInterviewByPage(@RequestBody MockInterviewQueryRequest mockInterviewQueryRequest) {
        long current = mockInterviewQueryRequest.getCurrent();
        long size = mockInterviewQueryRequest.getPageSize();
        // 查询数据库
        Page<MockInterview> mockInterviewPage = mockInterviewService.page(new Page<>(current, size),
                mockInterviewService.getQueryWrapper(mockInterviewQueryRequest));
        return ResultUtils.success(mockInterviewPage);
    }

    /**
     * 根据 ID 获取模拟面试记录
     *
     * @param id
     * @param request
     * @return com.rich.richInterview.common.BaseResponse<com.rich.richInterview.model.entity.MockInterview>
     * @author DuRuiChi
     * @create 2025/6/11
     **/
    @GetMapping("/{id}")
    @SaCheckRole(value = {UserConstant.ADMIN_ROLE, UserConstant.DEFAULT_ROLE}, mode = SaMode.OR)
    public BaseResponse<MockInterview> getMockInterviewById(@PathVariable Long id, HttpServletRequest request) {
        // 参数校验
        ThrowUtils.throwIf(id == null || id <= 0, ErrorCode.PARAMS_ERROR);
        // 查询数据
        MockInterview mockInterview = mockInterviewService.getById(id);
        ThrowUtils.throwIf(mockInterview == null, ErrorCode.NOT_FOUND_ERROR);
        // 权限校验：仅本人或管理员可查看
        User loginUser = userService.getLoginUser(request);
        if (!mockInterview.getUserId().equals(loginUser.getId()) && !userService.isAdmin(request)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
        return ResultUtils.success(mockInterview);
    }

    /**
     * 进行模拟面试对话事件
     *
     * @param mockInterviewEventRequest
     * @param request
     * @return com.rich.richInterview.common.BaseResponse<java.lang.String>
     * @author DuRuiChi
     * @create 2025/6/11
     **/
    @PostMapping("/cahtEvent")
    @SaCheckRole(value = {UserConstant.ADMIN_ROLE, UserConstant.DEFAULT_ROLE}, mode = SaMode.OR)
    public BaseResponse<String> conductChatEvent(MockInterviewEventRequest mockInterviewEventRequest, HttpServletRequest request) {
        // 获取当前登录用户
        User loginUser = userService.getLoginUser(request);

        String aiResponseContent = mockInterviewService.conductChatEvent(mockInterviewEventRequest, loginUser);
        return ResultUtils.success(aiResponseContent);
    }
}
