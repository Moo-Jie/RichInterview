package com.rich.richInterview.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rich.richInterview.common.BaseResponse;
import com.rich.richInterview.common.DeleteRequest;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.exception.BusinessException;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.model.dto.comment.CommentAddRequest;
import com.rich.richInterview.model.dto.comment.CommentQueryRequest;
import com.rich.richInterview.model.entity.Comment;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.model.vo.CommentVO;
import com.rich.richInterview.service.CommentService;
import com.rich.richInterview.service.UserService;
import com.rich.richInterview.utils.CacheLockExecutor;
import com.rich.richInterview.utils.CacheUtils;
import com.rich.richInterview.utils.ResultUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 回答接口
 */
@RestController
@RequestMapping("/comment")
@Slf4j
public class CommentController {
    @Resource
    private CommentService commentService;

    @Resource
    private UserService userService;

    @Autowired
    private CacheUtils cacheUtils;

    @Autowired
    private CacheLockExecutor cacheLockExecutor;

    /**
     * 用户创建回答
     * （创建回答后，按题目ID删除缓存键）
     *
     * @param commentAddRequest 用户提交的回答信息
     * @param request           用户登录态
     * @return com.rich.richInterview.common.BaseResponse<java.lang.Long>
     * @author DuRuiChi
     * @create 2025/6/13
     **/
    @PostMapping("/add")
    public BaseResponse<Long> addComment(@RequestBody CommentAddRequest commentAddRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(commentAddRequest == null, ErrorCode.PARAMS_ERROR);
        Long id = commentService.addComment(commentAddRequest, request);
        ThrowUtils.throwIf(id == null || id <= 0, ErrorCode.OPERATION_ERROR);
        // 删除指定题目ID的缓存键
        cacheUtils.deleteCacheByPrefixes(new String[]{commentService.generateCacheKeyByQuestionId(commentAddRequest.getQuestionId())});
        // 删除指定用户ID的缓存键（暂未使用用户回答列表相关接口）
//        cacheUtils.deleteCacheByPrefixes(new String[]{commentService.generateCacheKeyByUserId(userService.getLoginUser(request).getId())});
        return ResultUtils.success(id);
    }

    /**
     * 用户删除回答
     * （删除回答后，按题目ID删除缓存键）
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
        boolean result = commentService.deleteComment(deleteRequest.getId(), request);
        // 删除指定题目 ID 的缓存键
        cacheUtils.deleteCacheByPrefixes(new String[]{commentService.generateCacheKeyByQuestionId(commentService.getById(deleteRequest.getId()).getQuestionId())});
        // 删除指定用户ID的缓存键（暂未使用用户回答列表相关接口）
//        cacheUtils.deleteCacheByPrefixes(new String[]{commentService.generateCacheKeyByUserId(userService.getLoginUser(request).getId())});
        return ResultUtils.success(result);
    }

    /**
     * 根据 题目ID 获取回答列表（封装类）
     * (通过 questionId 缓存回答列表，当删除、更新回答时删除缓存键）
     *
     * @param questionId 题目ID
     * @param request    用户登录态
     * @return com.rich.richInterview.common.BaseResponse<java.util.List < com.rich.richInterview.model.vo.CommentVO>>
     * @author DuRuiChi
     * @create 2025/6/13
     **/
    @GetMapping("/get/vo")
    public BaseResponse<List<CommentVO>> getCommentVOByQuestionId(long questionId, HttpServletRequest request) throws Exception {
        ThrowUtils.throwIf(questionId <= 0, ErrorCode.PARAMS_ERROR);
        // 拼接缓存键
        String cacheKey = commentService.generateCacheKeyByQuestionId(questionId);
        // 分布式锁缓存执行器：双重检查缓存 + 分布式锁 + 降级回填缓存
        List<CommentVO> result = cacheLockExecutor.executeWithCache(cacheKey, List.class,
                // 数据库操作
                () -> commentService.getCommentVOListByQuestionId(questionId, request));
        return ResultUtils.success(result);
    }

    /**
     * 分页获取回答列表（封装类）
     *
     * @param commentQueryRequest
     * @param request
     * @return
     */
    @PostMapping("/list/page/vo")
    public BaseResponse<Page<CommentVO>> listCommentVOByPage(@RequestBody CommentQueryRequest commentQueryRequest, HttpServletRequest request) throws Exception {
        long current = commentQueryRequest.getCurrent();
        long size = commentQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        // 拼接缓存键
        String cacheKey;
        if (commentQueryRequest.getQuestionId() != null && commentQueryRequest.getQuestionId() > 0) {
            // 若为指定题目ID查询，按题目ID缓存，当删除、更新时删除缓存键
            cacheKey = commentService.generateCacheKeyByQuestionId(commentQueryRequest.getQuestionId()) + "page";
        } else {
            // 若为普通分页查询，按参数缓存，自然过期防止频繁更新缓存
            cacheKey = "comment_page" + "_" + commentQueryRequest;
        }
        // 分布式锁缓存执行器：双重检查缓存 + 分布式锁 + 降级回填缓存
        Page<Comment> commentPage = cacheLockExecutor.executeWithCache(cacheKey, Page.class,
                // 数据库操作
                () -> commentService.page(new Page<>(current, size), commentService.getQueryWrapper(commentQueryRequest)));
        // 获取封装类
        return ResultUtils.success(commentService.getCommentVOPage(commentPage, request));
    }

    /**
     * 根据 用户ID 分页获取回答列表（封装类）
     * (通过 userId 缓存回答列表，当删除、更新回答时删除缓存键）
     *
     * @param commentQueryRequest
     * @param request
     * @return
     */
    @PostMapping("/my/list/page/vo")
    public BaseResponse<Page<CommentVO>> listMyCommentVOByPage(@RequestBody CommentQueryRequest commentQueryRequest, HttpServletRequest request) throws Exception {
        ThrowUtils.throwIf(commentQueryRequest == null, ErrorCode.PARAMS_ERROR);
        // 补充查询条件，只查询当前登录用户的数据
        User loginUser = userService.getLoginUser(request);
        commentQueryRequest.setUserId(loginUser.getId());
        long current = commentQueryRequest.getCurrent();
        long size = commentQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        // 拼接缓存键
        String cacheKey = commentService.generateCacheKeyByUserId(loginUser.getId());
        // 分布式锁缓存执行器：双重检查缓存 + 分布式锁 + 降级回填缓存
        Page<Comment> commentPage = cacheLockExecutor.executeWithCache(cacheKey, Page.class,
                // 数据库操作
                () -> commentService.page(new Page<>(current, size), commentService.getQueryWrapper(commentQueryRequest)));
        // 获取封装类
        return ResultUtils.success(commentService.getCommentVOPage(commentPage, request));
    }

    /**
     * 点赞回答
     * （点赞回答后，按题目ID删除缓存键）
     *
     * @param idRequest 回答ID
     * @return com.rich.richInterview.common.BaseResponse<java.lang.Boolean>
     * @author DuRuiChi
     * @create 2025/6/13
     **/
    @PostMapping("/like")
    public BaseResponse<Boolean> starComment(@RequestBody DeleteRequest idRequest) {
        ThrowUtils.throwIf(idRequest == null || idRequest.getId() == null, ErrorCode.PARAMS_ERROR);
        Long questionId = commentService.starComment(idRequest.getId());
        // 删除指定题目ID的缓存键
        cacheUtils.deleteCacheByPrefixes(new String[]{commentService.generateCacheKeyByQuestionId(questionId)});
        return ResultUtils.success(true);
    }
}
