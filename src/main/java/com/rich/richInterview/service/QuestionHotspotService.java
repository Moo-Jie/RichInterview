package com.rich.richInterview.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.rich.richInterview.model.dto.questionHotspot.QuestionHotspotQueryRequest;
import com.rich.richInterview.model.entity.QuestionHotspot;
import com.rich.richInterview.model.enums.IncrementFieldEnum;
import com.rich.richInterview.model.vo.QuestionHotspotVO;

import javax.servlet.http.HttpServletRequest;

/**
 * 题目热点服务
 */
public interface QuestionHotspotService extends IService<QuestionHotspot> {

    /**
     * 校验数据
     *
     * @param questionHotspot
     * @param add             对创建的数据进行校验
     */
    void validQuestionHotspot(QuestionHotspot questionHotspot, boolean add);

    /**
     * 获取查询条件
     *
     * @param questionHotspotQueryRequest
     * @return
     */
    QueryWrapper<QuestionHotspot> getQueryWrapper(QuestionHotspotQueryRequest questionHotspotQueryRequest);

    /**
     * 获取题目热点封装
     *
     * @param questionHotspot
     * @param request
     * @return
     */
    QuestionHotspotVO getQuestionHotspotVO(QuestionHotspot questionHotspot, HttpServletRequest request);

    /**
     * 热点字段递增接口（自动初始化）
     *
     * @param questionId
     * @param field
     * @return boolean
     * @author DuRuiChi
     * @create 2025/5/22
     **/
    boolean incrementField(Long questionId, IncrementFieldEnum field);

    /**
     * 分页获取题目热点封装
     *
     * @param questionHotspotPage
     * @param request
     * @return
     */
    Page<QuestionHotspotVO> getQuestionHotspotVOPage(Page<QuestionHotspot> questionHotspotPage, HttpServletRequest request);

    /**
     * 根据题目 id 获取题库热点信息，不存在时初始化
     *
     * @param questionId
     * @return
     */
    QuestionHotspot getByQuestionId(Long questionId);

    /**
     * 热点字段递减接口（自动初始化）
     *
     * @param questionId
     * @param field
     * @return boolean
     * @author DuRuiChi
     * @create 2025/5/22
     **/
    boolean decrementField(Long questionId, IncrementFieldEnum field);
}
