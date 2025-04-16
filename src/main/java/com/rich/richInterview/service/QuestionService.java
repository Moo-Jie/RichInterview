package com.rich.richInterview.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.rich.richInterview.common.DeleteRequest;
import com.rich.richInterview.model.dto.question.QuestionAddRequest;
import com.rich.richInterview.model.dto.question.QuestionEditRequest;
import com.rich.richInterview.model.dto.question.QuestionQueryRequest;
import com.rich.richInterview.model.dto.question.QuestionUpdateRequest;
import com.rich.richInterview.model.entity.Question;
import com.rich.richInterview.model.vo.QuestionVO;

import javax.servlet.http.HttpServletRequest;

/**
 * 题目服务
 *
 */
public interface QuestionService extends IService<Question> {

    /**
     * 校验数据
     *
     * @param question
     * @param add 对创建的数据进行校验
     */
    void validQuestion(Question question, boolean add);

    /**
     * 获取查询条件
     *
     * @param questionQueryRequest
     * @return
     */
    QueryWrapper<Question> getQueryWrapper(QuestionQueryRequest questionQueryRequest);
    
    /**
     * 获取题目封装类
     *
     * @param question
     * @param request
     * @return
     */
    QuestionVO getQuestionVO(Question question, HttpServletRequest request);

    /**
     * 分页获取题目封装类
     *
     * @param questionPage
     * @param request
     * @return
     */
    Page<QuestionVO> getQuestionVOPage(Page<Question> questionPage, HttpServletRequest request);

    /**
     * 分页获取题目列表（仅管理员可用）
     *
     * @return void
     * @author DuRuiChi
     * @create 2025/3/22
     **/
    Page<Question> getQuestionPage(QuestionQueryRequest questionQueryRequest);

    /**
     * 添加题目（仅管理员可用）
     * @param questionAddRequest
     * @param request
     * @return java.lang.Long
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    Long addQuestion(QuestionAddRequest questionAddRequest, HttpServletRequest request);

    /**
     * 删除题目（仅管理员可用）
     * @param deleteRequest
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    Boolean deleteQuestion(DeleteRequest deleteRequest, HttpServletRequest request);

    /**
     * 更新题目（仅管理员可用）
     * @param questionUpdateRequest
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    Boolean updateQuestion(QuestionUpdateRequest questionUpdateRequest,HttpServletRequest request);

    /**
     * 分页获取当前登录用户创建的题目列表
     * @param questionQueryRequest
     * @param request
     * @return com.baomidou.mybatisplus.extension.plugins.pagination.Page<com.rich.richInterview.model.vo.QuestionVO>
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    Page<QuestionVO> listMyQuestionVOByPage(QuestionQueryRequest questionQueryRequest, HttpServletRequest request);

    /**
     * 编辑题目（给用户使用）
     * @param questionEditRequest
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    Boolean editQuestion(QuestionEditRequest questionEditRequest, HttpServletRequest request);
}
