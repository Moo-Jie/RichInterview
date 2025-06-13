package com.rich.richInterview.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rich.richInterview.common.BaseResponse;
import com.rich.richInterview.common.DeleteRequest;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.UserConstant;
import com.rich.richInterview.exception.BusinessException;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.model.dto.comment.CommentAddRequest;
import com.rich.richInterview.model.dto.comment.CommentQueryRequest;
import com.rich.richInterview.model.entity.Comment;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.model.vo.CommentVO;
import com.rich.richInterview.service.CommentService;
import com.rich.richInterview.service.UserService;
import com.rich.richInterview.utils.ResultUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 评论接口
 */
@RestController
@RequestMapping("/comment")
@Slf4j
public class CommentController {

    @Resource
    private CommentService commentService;

    @Resource
    private UserService userService;


    /**
     * 用户创建评论
     *
     * @param commentAddRequest 用户提交的评论信息
     * @param request           用户登录态
     * @return com.rich.richInterview.common.BaseResponse<java.lang.Long>
     * @author DuRuiChi
     * @create 2025/6/13
     **/
    @PostMapping("/add")
    public BaseResponse<Long> addComment(@RequestBody CommentAddRequest commentAddRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(commentAddRequest == null, ErrorCode.PARAMS_ERROR);
        return ResultUtils.success(commentService.addComment(commentAddRequest, request));
    }

    /**
     * 用户删除评论
     *
     * @param deleteRequest id
     * @param request       用户登录态
     * @return com.rich.richInterview.common.BaseResponse<java.lang.Boolean>
     * @author DuRuiChi
     * @create 2025/6/13
     **/
    @PostMapping("/delete")
    public BaseResponse<Boolean> deleteComment(@RequestBody DeleteRequest deleteRequest, HttpServletRequest request) {
        if (deleteRequest == null || deleteRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        return ResultUtils.success(commentService.deleteComment(deleteRequest.getId(), request));
    }

    /**
     * 根据 题目ID 获取评论列表（封装类）
     *
     * @param questionId 题目ID
     * @param request    用户登录态
     * @return com.rich.richInterview.common.BaseResponse<java.util.List < com.rich.richInterview.model.vo.CommentVO>>
     * @author DuRuiChi
     * @create 2025/6/13
     **/
    @GetMapping("/get/vo")
    public BaseResponse<List<CommentVO>> getCommentVOByQuestionId(long questionId, HttpServletRequest request) {
        ThrowUtils.throwIf(questionId <= 0, ErrorCode.PARAMS_ERROR);
        // 获取封装类
        return ResultUtils.success(commentService.getCommentVOListByQuestionId(questionId, request));
    }

    /**
     * 分页获取评论列表（封装类）
     *
     * @param commentQueryRequest
     * @param request
     * @return
     */
    @PostMapping("/list/page/vo")
    public BaseResponse<Page<CommentVO>> listCommentVOByPage(@RequestBody CommentQueryRequest commentQueryRequest,
                                                             HttpServletRequest request) {
        long current = commentQueryRequest.getCurrent();
        long size = commentQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        // 查询数据库
        Page<Comment> commentPage = commentService.page(new Page<>(current, size),
                commentService.getQueryWrapper(commentQueryRequest));
        // 获取封装类
        return ResultUtils.success(commentService.getCommentVOPage(commentPage, request));
    }

    /**
     * 分页获取当前登录用户创建的评论列表
     *
     * @param commentQueryRequest
     * @param request
     * @return
     */
    @PostMapping("/my/list/page/vo")
    public BaseResponse<Page<CommentVO>> listMyCommentVOByPage(@RequestBody CommentQueryRequest commentQueryRequest,
                                                               HttpServletRequest request) {
        ThrowUtils.throwIf(commentQueryRequest == null, ErrorCode.PARAMS_ERROR);
        // 补充查询条件，只查询当前登录用户的数据
        User loginUser = userService.getLoginUser(request);
        commentQueryRequest.setUserId(loginUser.getId());
        long current = commentQueryRequest.getCurrent();
        long size = commentQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        // 查询数据库
        Page<Comment> commentPage = commentService.page(new Page<>(current, size),
                commentService.getQueryWrapper(commentQueryRequest));
        // 获取封装类
        return ResultUtils.success(commentService.getCommentVOPage(commentPage, request));
    }

    /**
     * 点赞评论
     * @param idRequest 评论ID
     * @param request   用户登录态
     * @return com.rich.richInterview.common.BaseResponse<java.lang.Boolean>
     * @author DuRuiChi
     * @create 2025/6/13
     **/
    @PostMapping("/like")
    public BaseResponse<Boolean> starComment(@RequestBody DeleteRequest idRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(idRequest == null || idRequest.getId() == null, ErrorCode.PARAMS_ERROR);
        return ResultUtils.success(commentService.starComment(idRequest.getId(), request));
    }
}
