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
import com.rich.richInterview.model.dto.learnPath.LearnPathAddRequest;
import com.rich.richInterview.model.dto.learnPath.LearnPathEditRequest;
import com.rich.richInterview.model.dto.learnPath.LearnPathQueryRequest;
import com.rich.richInterview.model.dto.learnPath.LearnPathUpdateRequest;
import com.rich.richInterview.model.entity.LearnPath;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.model.vo.LearnPathVO;
import com.rich.richInterview.service.LearnPathService;
import com.rich.richInterview.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

/**
 * 学习路线关系接口
 *
 */
@RestController
@RequestMapping("/learnPath")
@Slf4j
public class LearnPathController {

    @Resource
    private LearnPathService learnPathService;

    @Resource
    private UserService userService;



    /**
     * 创建学习路线关系
     *
     * @param learnPathAddRequest
     * @param request
     * @return
     */
    @PostMapping("/add")
    public BaseResponse<Long> addLearnPath(@RequestBody LearnPathAddRequest learnPathAddRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(learnPathAddRequest == null, ErrorCode.PARAMS_ERROR);
        // todo 在此处将实体类和 DTO 进行转换
        LearnPath learnPath = new LearnPath();
        BeanUtils.copyProperties(learnPathAddRequest, learnPath);
        // 数据校验
        learnPathService.validLearnPath(learnPath, true);
        // todo 填充默认值
        User loginUser = userService.getLoginUser(request);
        learnPath.setUserId(loginUser.getId());
        // 写入数据库
        boolean result = learnPathService.save(learnPath);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        // 返回新写入的数据 id
        long newLearnPathId = learnPath.getId();
        return ResultUtils.success(newLearnPathId);
    }

    /**
     * 删除学习路线关系
     *
     * @param deleteRequest
     * @param request
     * @return
     */
    @PostMapping("/delete")
    public BaseResponse<Boolean> deleteLearnPath(@RequestBody DeleteRequest deleteRequest, HttpServletRequest request) {
        if (deleteRequest == null || deleteRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        User user = userService.getLoginUser(request);
        long id = deleteRequest.getId();
        // 判断是否存在
        LearnPath oldLearnPath = learnPathService.getById(id);
        ThrowUtils.throwIf(oldLearnPath == null, ErrorCode.NOT_FOUND_ERROR);
        // 仅本人或管理员可删除
        if (!oldLearnPath.getUserId().equals(user.getId()) && !userService.isAdmin(request)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
        // 操作数据库
        boolean result = learnPathService.removeById(id);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }

    /**
     * 更新学习路线关系（仅管理员可用）
     *
     * @param learnPathUpdateRequest
     * @return
     */
    @PostMapping("/update")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> updateLearnPath(@RequestBody LearnPathUpdateRequest learnPathUpdateRequest) {
        if (learnPathUpdateRequest == null || learnPathUpdateRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        // todo 在此处将实体类和 DTO 进行转换
        LearnPath learnPath = new LearnPath();
        BeanUtils.copyProperties(learnPathUpdateRequest, learnPath);
        // 数据校验
        learnPathService.validLearnPath(learnPath, false);
        // 判断是否存在
        long id = learnPathUpdateRequest.getId();
        LearnPath oldLearnPath = learnPathService.getById(id);
        ThrowUtils.throwIf(oldLearnPath == null, ErrorCode.NOT_FOUND_ERROR);
        // 操作数据库
        boolean result = learnPathService.updateById(learnPath);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }

    /**
     * 根据 id 获取学习路线关系（封装类）
     *
     * @param id
     * @return
     */
    @GetMapping("/get/vo")
    public BaseResponse<LearnPathVO> getLearnPathVOById(Long id, HttpServletRequest request) {
        ThrowUtils.throwIf(id <= 0, ErrorCode.PARAMS_ERROR);
        // 查询数据库
        LearnPath learnPath = learnPathService.getById(id);
        ThrowUtils.throwIf(learnPath == null, ErrorCode.NOT_FOUND_ERROR);
        // 获取封装类
        return ResultUtils.success(learnPathService.getLearnPathVO(learnPath, request));
    }

    /**
     * 分页获取学习路线关系列表（仅管理员可用）
     *
     * @param learnPathQueryRequest
     * @return
     */
    @PostMapping("/list/page")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<LearnPath>> listLearnPathByPage(@RequestBody LearnPathQueryRequest learnPathQueryRequest) {
        long current = learnPathQueryRequest.getCurrent();
        long size = learnPathQueryRequest.getPageSize();
        // 查询数据库
        Page<LearnPath> learnPathPage = learnPathService.page(new Page<>(current, size),
                learnPathService.getQueryWrapper(learnPathQueryRequest));
        return ResultUtils.success(learnPathPage);
    }

    /**
     * 分页获取学习路线关系列表（封装类）
     *
     * @param learnPathQueryRequest
     * @param request
     * @return
     */
    @PostMapping("/list/page/vo")
    public BaseResponse<Page<LearnPathVO>> listLearnPathVOByPage(@RequestBody LearnPathQueryRequest learnPathQueryRequest,
                                                               HttpServletRequest request) {
        long current = learnPathQueryRequest.getCurrent();
        long size = learnPathQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        // 查询数据库
        Page<LearnPath> learnPathPage = learnPathService.page(new Page<>(current, size),
                learnPathService.getQueryWrapper(learnPathQueryRequest));
        // 获取封装类
        return ResultUtils.success(learnPathService.getLearnPathVOPage(learnPathPage, request));
    }

    /**
     * 分页获取当前登录用户创建的学习路线关系列表
     *
     * @param learnPathQueryRequest
     * @param request
     * @return
     */
    @PostMapping("/my/list/page/vo")
    public BaseResponse<Page<LearnPathVO>> listMyLearnPathVOByPage(@RequestBody LearnPathQueryRequest learnPathQueryRequest,
                                                                 HttpServletRequest request) {
        ThrowUtils.throwIf(learnPathQueryRequest == null, ErrorCode.PARAMS_ERROR);
        // 补充查询条件，只查询当前登录用户的数据
        User loginUser = userService.getLoginUser(request);
        learnPathQueryRequest.setUserId(loginUser.getId());
        long current = learnPathQueryRequest.getCurrent();
        long size = learnPathQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        // 查询数据库
        Page<LearnPath> learnPathPage = learnPathService.page(new Page<>(current, size),
                learnPathService.getQueryWrapper(learnPathQueryRequest));
        // 获取封装类
        return ResultUtils.success(learnPathService.getLearnPathVOPage(learnPathPage, request));
    }

    /**
     * 编辑学习路线关系（给用户使用）
     *
     * @param learnPathEditRequest
     * @param request
     * @return
     */
    @PostMapping("/edit")
    public BaseResponse<Boolean> editLearnPath(@RequestBody LearnPathEditRequest learnPathEditRequest, HttpServletRequest request) {
        if (learnPathEditRequest == null || learnPathEditRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        // todo 在此处将实体类和 DTO 进行转换
        LearnPath learnPath = new LearnPath();
        BeanUtils.copyProperties(learnPathEditRequest, learnPath);
        // 数据校验
        learnPathService.validLearnPath(learnPath, false);
        User loginUser = userService.getLoginUser(request);
        // 判断是否存在
        long id = learnPathEditRequest.getId();
        LearnPath oldLearnPath = learnPathService.getById(id);
        ThrowUtils.throwIf(oldLearnPath == null, ErrorCode.NOT_FOUND_ERROR);
        // 仅本人或管理员可编辑
        if (!oldLearnPath.getUserId().equals(loginUser.getId()) && !userService.isAdmin(loginUser)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
        // 操作数据库
        boolean result = learnPathService.updateById(learnPath);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }


}
