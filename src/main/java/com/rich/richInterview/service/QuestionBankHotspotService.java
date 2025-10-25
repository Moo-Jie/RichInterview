package com.rich.richInterview.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.rich.richInterview.model.dto.questionBankHotspot.QuestionBankHotspotQueryRequest;
import com.rich.richInterview.model.entity.QuestionBankHotspot;
import com.rich.richInterview.model.enums.IncrementFieldEnum;
import com.rich.richInterview.model.vo.QuestionBankHotspotVO;

import javax.servlet.http.HttpServletRequest;

/**
 * 题库热点服务
 */
public interface QuestionBankHotspotService extends IService<QuestionBankHotspot> {

    /**
     * 校验数据
     *
     * @param questionBankHotspot
     * @param add                 对创建的数据进行校验
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

    /**
     * 根据题库 id 获取题库热点信息，不存在时初始化
     *
     * @param questionBankId
     * @return
     */
    QuestionBankHotspot getByQuestionBankId(Long questionBankId);

    /**
     * 构建字段缓存键
     *
     * @param questionBankId
     * @param field
     * @return
     * @author DuRuiChi
     * @create 2025/5/27
     **/
    String buildFieldCacheKey(Long questionBankId, IncrementFieldEnum field);

    /**
     * 从缓存获取题库热点数据
     * 适配新的数值存储格式（非JSON格式）
     */
    QuestionBankHotspotVO getQuestionBankHotspotFromCache(Long questionBankId);

    /**
     * 将题库热点数据缓存到Redis
     * 使用 CounterManager 初始化计数器，确保数据类型兼容性
     */
    void cacheQuestionBankHotspotFields(QuestionBankHotspot questionBankHotspot);

    /**
     * 执行字段增量
     *
     * @param questionBankId     题库 id
     * @param field              字段枚举
     * @param cacheKey           缓存键
     * @return java.lang.Boolean
     **/
    Boolean doIncrementField(Long questionBankId, IncrementFieldEnum field, String cacheKey);
}
