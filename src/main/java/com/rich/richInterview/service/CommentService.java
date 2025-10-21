package com.rich.richInterview.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.rich.richInterview.model.dto.comment.CommentAddRequest;
import com.rich.richInterview.model.dto.comment.CommentQueryRequest;
import com.rich.richInterview.model.entity.Comment;
import com.rich.richInterview.model.vo.CommentVO;

import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 回答服务
 *
 */
public interface CommentService extends IService<Comment> {

    /**
     * 校验数据
     *
     * @param comment
     * @param add 对创建的数据进行校验
     */
    void validComment(Comment comment, boolean add);

    /**
     * 获取查询条件
     *
     * @param commentQueryRequest
     * @return
     */
    QueryWrapper<Comment> getQueryWrapper(CommentQueryRequest commentQueryRequest);
    
    /**
     * 获取回答封装
     *
     * @param comment
     * @param request
     * @return
     */
    CommentVO getCommentVO(Comment comment, HttpServletRequest request);

    /**
     * 分页获取回答封装
     *
     * @param commentPage
     * @param request
     * @return
     */
    Page<CommentVO> getCommentVOPage(Page<Comment> commentPage, HttpServletRequest request);

    /**
     * 创建回答
     * @param commentAddRequest
     * @param request
     * @return java.lang.Long
     * @author DuRuiChi
     * @create 2025/6/13
     **/
    Long addComment(CommentAddRequest commentAddRequest, HttpServletRequest request);

    /**
     * 删除回答
     * @param id
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/6/13
     **/
    Boolean deleteComment(Long id, HttpServletRequest request);

    /**
     *
     * 根据 题目ID 获取回答列表（封装类）
     * @param questionId
     * @param request
     * @return java.util.List<com.rich.richInterview.model.vo.CommentVO>
     * @author DuRuiChi
     * @create 2025/6/13
     **/
    List<CommentVO> getCommentVOListByQuestionId(long questionId, HttpServletRequest request);

    /**
     * 点赞回答
     * @param id
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/6/13
     **/
    Boolean starComment(Long id, HttpServletRequest request);
}
