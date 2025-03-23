package com.rich.richInterview.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.rich.richInterview.common.DeleteRequest;
import com.rich.richInterview.model.dto.questionBankQuestion.QuestionBankQuestionAddRequest;
import com.rich.richInterview.model.dto.questionBankQuestion.QuestionBankQuestionQueryRequest;
import com.rich.richInterview.model.dto.questionBankQuestion.QuestionBankQuestionRemoveRequest;
import com.rich.richInterview.model.dto.questionBankQuestion.QuestionBankQuestionUpdateRequest;
import com.rich.richInterview.model.entity.QuestionBankQuestion;
import com.rich.richInterview.model.vo.QuestionBankQuestionVO;

import javax.servlet.http.HttpServletRequest;

/**
 * 题库题目关系服务
 *
 */
public interface QuestionBankQuestionService extends IService<QuestionBankQuestion> {

    /**
     * 校验数据
     *
     * @param questionBankQuestion
     * @param add 对创建的数据进行校验
     */
    void validQuestionBankQuestion(QuestionBankQuestion questionBankQuestion, boolean add);

    /**
     * 获取查询条件
     *
     * @param questionBankQuestionQueryRequest
     * @return
     */
    QueryWrapper<QuestionBankQuestion> getQueryWrapper(QuestionBankQuestionQueryRequest questionBankQuestionQueryRequest);
    
    /**
     * 获取题库题目关系封装
     *
     * @param questionBankQuestion
     * @param request
     * @return
     */
    QuestionBankQuestionVO getQuestionBankQuestionVO(QuestionBankQuestion questionBankQuestion, HttpServletRequest request);

    /**
     * 分页获取题库题目关系封装
     *
     * @param questionBankQuestionPage
     * @param request
     * @return
     */
    Page<QuestionBankQuestionVO> getQuestionBankQuestionVOPage(Page<QuestionBankQuestion> questionBankQuestionPage, HttpServletRequest request);

    /**
     * (题库ID、题目ID删除)
     * @param questionBankQuestionRemoveRequest
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    Boolean removeQuestionBankQuestion(QuestionBankQuestionRemoveRequest questionBankQuestionRemoveRequest, HttpServletRequest request);

    /**
     * 
     * 创建题库题目关系
     * @param questionBankQuestionAddRequest
     * @param request
     * @return java.lang.Long
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    Long addQuestionBankQuestion(QuestionBankQuestionAddRequest questionBankQuestionAddRequest, HttpServletRequest request);

    /**
     * 删除题库题目关系(按照ID删除，仅管理员可用)
     * @param deleteRequest
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    Boolean deleteQuestionBankQuestion(DeleteRequest deleteRequest, HttpServletRequest request);

    /**
     * 更新题库题目关系（仅管理员可用）
     * @param questionBankQuestionUpdateRequest
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    Boolean updateQuestionBankQuestion(QuestionBankQuestionUpdateRequest questionBankQuestionUpdateRequest);
}
