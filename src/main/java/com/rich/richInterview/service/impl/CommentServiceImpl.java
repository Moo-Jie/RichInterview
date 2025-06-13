package com.rich.richInterview.service.impl;

import cn.hutool.core.collection.CollUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.CommonConstant;
import com.rich.richInterview.exception.BusinessException;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.mapper.CommentMapper;
import com.rich.richInterview.model.dto.comment.CommentAddRequest;
import com.rich.richInterview.model.dto.comment.CommentQueryRequest;
import com.rich.richInterview.model.entity.Comment;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.model.enums.IncrementFieldEnum;
import com.rich.richInterview.model.vo.CommentVO;
import com.rich.richInterview.model.vo.UserVO;
import com.rich.richInterview.service.CommentService;
import com.rich.richInterview.service.QuestionHotspotService;
import com.rich.richInterview.service.UserService;
import com.rich.richInterview.utils.SqlUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 评论服务实现
 *
 */
@Service
@Slf4j
public class CommentServiceImpl extends ServiceImpl<CommentMapper, Comment> implements CommentService {

    @Resource
    private UserService userService;

    @Resource
    private QuestionHotspotService questionHotspotService;

    /**
     * 校验数据
     * @param comment
     * @param add
     * @return void
     * @author DuRuiChi
     * @create 2025/6/13
     **/
    @Override
    public void validComment(Comment comment, boolean add) {
        ThrowUtils.throwIf(comment == null, ErrorCode.PARAMS_ERROR);
        // todo 从对象中取值

        String content = comment.getContent();
        Long questionId = comment.getQuestionId();

        // 创建数据时，参数不能为空
        if (add) {
            // todo 补充校验规则
            ThrowUtils.throwIf(StringUtils.isBlank(content), ErrorCode.PARAMS_ERROR);
            ThrowUtils.throwIf(questionId == null, ErrorCode.PARAMS_ERROR);
        }
    }

    /**
     * 点赞评论
     * @param id      评论ID
     * @param request 用户登录态
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/6/13
     **/
    @Override
    public Boolean starComment(Long id, HttpServletRequest request) {
        // 校验评论存在性
        Comment comment = this.getById(id);
        ThrowUtils.throwIf(comment == null, ErrorCode.NOT_FOUND_ERROR);

        // 原子操作更新点赞数
        UpdateWrapper<Comment> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("id", id)
                .setSql("thumbNum = thumbNum + 1");
        return this.update(updateWrapper);
    }

    /**
     * 获取查询条件
     *
     * @param commentQueryRequest
     * @return
     */
    @Override
    public QueryWrapper<Comment> getQueryWrapper(CommentQueryRequest commentQueryRequest) {
        QueryWrapper<Comment> queryWrapper = new QueryWrapper<>();
        if (commentQueryRequest == null) {
            return queryWrapper;
        }
        // todo 从对象中取值
        Long id = commentQueryRequest.getId();
        String content = commentQueryRequest.getContent();
        Long userId = commentQueryRequest.getUserId();
        Long questionId = commentQueryRequest.getQuestionId();
        String sortField = commentQueryRequest.getSortField();
        String sortOrder = commentQueryRequest.getSortOrder();

        // 模糊查询
        queryWrapper.like(StringUtils.isNotBlank(content), "content", content);
        // 精确查询
        queryWrapper.eq(ObjectUtils.isNotEmpty(questionId), "questionId", questionId);
        queryWrapper.eq(ObjectUtils.isNotEmpty(id), "id", id);
        queryWrapper.eq(ObjectUtils.isNotEmpty(userId), "userId", userId);
        // 排序规则
        queryWrapper.orderBy(SqlUtils.validSortField(sortField),
                sortOrder.equals(CommonConstant.SORT_ORDER_ASC),
                sortField);
        return queryWrapper;
    }

    /**
     * 获取评论封装
     * @param comment
     * @param request
     * @return com.rich.richInterview.model.vo.CommentVO
     * @author DuRuiChi
     * @create 2025/6/13
     **/
    @Override
    public CommentVO getCommentVO(Comment comment, HttpServletRequest request) {
        // 对象转封装类
        CommentVO commentVO = CommentVO.objToVo(comment);

        // todo 根据需要为封装对象补充值

        // 关联查询用户信息
        Long userId = comment.getUserId();
        User user = null;
        if (userId != null && userId > 0) {
            user = userService.getById(userId);
        }
        UserVO userVO = userService.getUserVO(user);
        commentVO.setUser(userVO);

        return commentVO;
    }

    /**
     * 分页获取评论封装
     * @param commentPage
     * @param request
     * @return com.baomidou.mybatisplus.extension.plugins.pagination.Page<com.rich.richInterview.model.vo.CommentVO>
     * @author DuRuiChi
     * @create 2025/6/13
     **/
    @Override
    public Page<CommentVO> getCommentVOPage(Page<Comment> commentPage, HttpServletRequest request) {
        List<Comment> commentList = commentPage.getRecords();
        Page<CommentVO> commentVOPage = new Page<>(commentPage.getCurrent(), commentPage.getSize(), commentPage.getTotal());
        if (CollUtil.isEmpty(commentList)) {
            return commentVOPage;
        }
        // 对象列表 => 封装对象列表
        List<CommentVO> commentVOList = commentList.stream().map(CommentVO::objToVo).collect(Collectors.toList());

        // 联查询用户信息
        Set<Long> userIdSet = commentList.stream().map(Comment::getUserId).collect(Collectors.toSet());
        Map<Long, List<User>> userIdUserListMap = userService.listByIds(userIdSet).stream()
                .collect(Collectors.groupingBy(User::getId));
        // 填充信息
        commentVOList.forEach(commentVO -> {
            Long userId = commentVO.getUserId();
            User user = null;
            if (userIdUserListMap.containsKey(userId)) {
                user = userIdUserListMap.get(userId).get(0);
            }
            commentVO.setUser(userService.getUserVO(user));
        });


        commentVOPage.setRecords(commentVOList);
        return commentVOPage;
    }

    /**
     * 创建评论
     * @param commentAddRequest
     * @param request
     * @return java.lang.Long
     * @author DuRuiChi
     * @create 2025/6/13
     **/
    @Override
    public Long addComment(CommentAddRequest commentAddRequest, HttpServletRequest request) {
        Comment comment = new Comment();
        BeanUtils.copyProperties(commentAddRequest, comment);
        // 数据校验
        this.validComment(comment, true);
        // todo 填充默认值
        User loginUser = userService.getLoginUser(request);
        comment.setUserId(loginUser.getId());
        // 写入数据库
        boolean result = this.save(comment);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        // 同步增加题目的评论数
        questionHotspotService.incrementField(comment.getQuestionId(), IncrementFieldEnum.COMMENT_NUM);
        // 返回新写入的数据 id
        long newCommentId = comment.getId();
        return newCommentId;
    }

    /**
     * 删除评论
     * @param id
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/6/13
     **/
    @Override
    public Boolean deleteComment(Long id, HttpServletRequest request) {
        User user = userService.getLoginUser(request);
        // 判断是否存在
        Comment oldComment = this.getById(id);
        ThrowUtils.throwIf(oldComment == null, ErrorCode.NOT_FOUND_ERROR);
        // 仅本人或管理员可删除
        if (!oldComment.getUserId().equals(user.getId()) && !userService.isAdmin(request)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
        // 操作数据库
        boolean result = this.removeById(id);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        // 同步减少题目的评论数
        questionHotspotService.decrementField(oldComment.getQuestionId(), IncrementFieldEnum.COMMENT_NUM);

        return true;
    }



    /**
     *
     * 根据 题目ID 获取评论列表（封装类）
     * @param questionId
     * @param request
     * @return java.util.List<com.rich.richInterview.model.vo.CommentVO>
     * @author DuRuiChi
     * @create 2025/6/13
     **/
    @Override
    public List<CommentVO> getCommentVOListByQuestionId(long questionId, HttpServletRequest request) {
        // 查询题目评论
        QueryWrapper<Comment> commentQueryWrapper = new QueryWrapper<>();
        commentQueryWrapper.eq("questionId", questionId);
        List<Comment> commentList = this.list(commentQueryWrapper);
        if (CollUtil.isEmpty(commentList)) {
            return Collections.emptyList();
        }
        // 批量转为 VO
        return commentList.stream().map(CommentVO::objToVo).toList();
    }

}
