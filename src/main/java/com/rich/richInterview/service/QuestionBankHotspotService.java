package com.rich.richInterview.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.rich.richInterview.model.dto.questionBankHotspot.QuestionBankHotspotQueryRequest;
import com.rich.richInterview.model.entity.QuestionBankHotspot;
import com.rich.richInterview.model.vo.QuestionBankHotspotVO;

import javax.servlet.http.HttpServletRequest;

/**
 * 题库热点服务
 *
 */
public interface QuestionBankHotspotService extends IService<QuestionBankHotspot> {

    /**
     * 校验数据
     *
     * @param questionBankHotspot
     * @param add 对创建的数据进行校验
     */
    void validQuestionBankHotspot(QuestionBankHotspot questionBankHotspot, boolean add);

    /**
     * 获取查询条件
     *
     * @param questionBankHotspotQueryRequest
     * @return
     */
    QueryWrapper<QuestionBankHotspot> getQueryWrapper(QuestionBankHotspotQueryRequest questionBankHotspotQueryRequest);
    
    /**
     * 获取题库热点封装
     *
     * @param questionBankHotspot
     * @param request
     * @return
     */
    QuestionBankHotspotVO getQuestionBankHotspotVO(QuestionBankHotspot questionBankHotspot, HttpServletRequest request);

    /**
     * 分页获取题库热点封装
     *
     * @param questionBankHotspotPage
     * @param request
     * @return
     */
    Page<QuestionBankHotspotVO> getQuestionBankHotspotVOPage(Page<QuestionBankHotspot> questionBankHotspotPage, HttpServletRequest request);
}
