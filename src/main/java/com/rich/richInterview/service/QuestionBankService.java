package com.rich.richInterview.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.rich.richInterview.common.DeleteRequest;
import com.rich.richInterview.model.dto.questionBank.QuestionBankAddRequest;
import com.rich.richInterview.model.dto.questionBank.QuestionBankEditRequest;
import com.rich.richInterview.model.dto.questionBank.QuestionBankQueryRequest;
import com.rich.richInterview.model.dto.questionBank.QuestionBankUpdateRequest;
import com.rich.richInterview.model.entity.QuestionBank;
import com.rich.richInterview.model.vo.QuestionBankVO;

import javax.servlet.http.HttpServletRequest;

/**
 * 题库服务
 *
 */
public interface QuestionBankService extends IService<QuestionBank> {

    /**
     * 校验数据
     *
     * @param questionBank
     * @param add 对创建的数据进行校验
     */
    void validQuestionBank(QuestionBank questionBank, boolean add);

    /**
     * 获取查询条件
     *
     * @param questionBankQueryRequest
     * @return
     */
    QueryWrapper<QuestionBank> getQueryWrapper(QuestionBankQueryRequest questionBankQueryRequest);
    
    /**
     * 获取题库封装
     *
     * @param questionBank
     * @param request
     * @return
     */
    QuestionBankVO getQuestionBankVO(QuestionBank questionBank, HttpServletRequest request);

    /**
     * 分页获取题库封装类
     *
     * @param questionBankPage
     * @param request
     * @return
     */
    Page<QuestionBankVO> getQuestionBankVOPage(Page<QuestionBank> questionBankPage, HttpServletRequest request);

    /**
     * 创建题库(仅管理员权限)
     * @param questionBankAddRequest
     * @param request
     * @return java.lang.Long
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    Long addQuestionBank(QuestionBankAddRequest questionBankAddRequest, HttpServletRequest request);

    /**
     * 删除题库(仅管理员权限)
     *
     * @param deleteRequest
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    Boolean deleteQuestionBank(DeleteRequest deleteRequest, HttpServletRequest request);

    /**
     * 更新题库(仅管理员权限)
     * @param questionBankUpdateRequest
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    Boolean updateQuestionBank(QuestionBankUpdateRequest questionBankUpdateRequest);

    /**
     * 根据 id 获取题库详情（封装类）
     * @param questionBankQueryRequest
     * @param request
     * @return com.rich.richInterview.model.vo.QuestionBankVO
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    QuestionBankVO getQuestionBankVOById(QuestionBankQueryRequest questionBankQueryRequest, HttpServletRequest request);

    /**
     *
     * 编辑题库（给用户使用）
     * @param questionBankEditRequest
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    Boolean editQuestionBank(QuestionBankEditRequest questionBankEditRequest, HttpServletRequest request);
}
