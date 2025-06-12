package com.rich.richInterview.service.impl;

import cn.hutool.core.collection.CollUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.CommonConstant;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.mapper.QuestionBankHotspotMapper;
import com.rich.richInterview.model.dto.questionBankHotspot.QuestionBankHotspotQueryRequest;
import com.rich.richInterview.model.entity.QuestionBank;
import com.rich.richInterview.model.entity.QuestionBankHotspot;
import com.rich.richInterview.model.enums.IncrementFieldEnum;
import com.rich.richInterview.model.vo.QuestionBankHotspotVO;
import com.rich.richInterview.service.QuestionBankHotspotService;
import com.rich.richInterview.service.QuestionBankService;
import com.rich.richInterview.utils.SqlUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 题库热点服务实现
 */
@Service
@Slf4j
public class QuestionBankHotspotServiceImpl extends ServiceImpl<QuestionBankHotspotMapper, QuestionBankHotspot> implements QuestionBankHotspotService {

    @Resource
    private QuestionBankService questionBankService;

    /**
     * 校验数据
     *
     * @param questionBankHotspot
     * @param add                 对创建的数据进行校验
     */
    @Override
    public void validQuestionBankHotspot(QuestionBankHotspot questionBankHotspot, boolean add) {
        ThrowUtils.throwIf(questionBankHotspot == null, ErrorCode.PARAMS_ERROR);
    }

    /**
     * 获取查询条件
     *
     * @param questionBankHotspotQueryRequest
     * @return
     */
    @Override
    public QueryWrapper<QuestionBankHotspot> getQueryWrapper(QuestionBankHotspotQueryRequest questionBankHotspotQueryRequest) {
        QueryWrapper<QuestionBankHotspot> queryWrapper = new QueryWrapper<>();
        if (questionBankHotspotQueryRequest == null) {
            return queryWrapper;
        }
        // todo 从对象中取值
        Long questionBankId = questionBankHotspotQueryRequest.getQuestionBankId();
        Integer viewNum = questionBankHotspotQueryRequest.getViewNum();
        Integer starNum = questionBankHotspotQueryRequest.getStarNum();
        Integer forwardNum = questionBankHotspotQueryRequest.getForwardNum();
        Integer collectNum = questionBankHotspotQueryRequest.getCollectNum();
        Integer commentNum = questionBankHotspotQueryRequest.getCommentNum();
        String sortField = questionBankHotspotQueryRequest.getSortField();
        String sortOrder = questionBankHotspotQueryRequest.getSortOrder();

        // 精确查询
        queryWrapper.ne(ObjectUtils.isNotEmpty(questionBankId), "questionBankId", questionBankId);
        queryWrapper.eq(ObjectUtils.isNotEmpty(viewNum), "viewNum", viewNum);
        queryWrapper.eq(ObjectUtils.isNotEmpty(starNum), "userId", starNum);
        queryWrapper.eq(ObjectUtils.isNotEmpty(forwardNum), "forwardNum", forwardNum);
        queryWrapper.eq(ObjectUtils.isNotEmpty(collectNum), "collectNum", collectNum);
        queryWrapper.eq(ObjectUtils.isNotEmpty(commentNum), "commentNum", commentNum);

        // 排序规则
        queryWrapper.orderBy(SqlUtils.validSortField(sortField),
                sortOrder.equals(CommonConstant.SORT_ORDER_ASC),
                sortField);
        return queryWrapper;
    }

    /**
     * 获取题库热点封装
     *
     * @param questionBankHotspot
     * @param request
     * @return
     */
    @Override
    public QuestionBankHotspotVO getQuestionBankHotspotVO(QuestionBankHotspot questionBankHotspot, HttpServletRequest request) {
        // 对象转封装类
        QuestionBankHotspotVO questionBankHotspotVO = QuestionBankHotspotVO.objToVo(questionBankHotspot);
        // 补充设置题库信息
        QuestionBank questionBank = questionBankService.getById(questionBankHotspotVO.getQuestionBankId());
        questionBankHotspotVO.setTitle(questionBank.getTitle());
        questionBankHotspotVO.setDescription(questionBank.getDescription());
        return questionBankHotspotVO;
    }

    /**
     * 分页获取题库热点封装
     *
     * @param questionBankHotspotPage
     * @param request
     * @return
     */
    @Override
    public Page<QuestionBankHotspotVO> getQuestionBankHotspotVOPage(Page<QuestionBankHotspot> questionBankHotspotPage, HttpServletRequest request) {
        List<QuestionBankHotspot> questionBankHotspotList = questionBankHotspotPage.getRecords();
        Page<QuestionBankHotspotVO> questionBankHotspotVOPage = new Page<>(questionBankHotspotPage.getCurrent(), questionBankHotspotPage.getSize(), questionBankHotspotPage.getTotal());
        if (CollUtil.isEmpty(questionBankHotspotList)) {
            return questionBankHotspotVOPage;
        }
        // 对象列表 => 封装对象列表
        List<QuestionBankHotspotVO> questionBankHotspotVOList = questionBankHotspotList
                .stream()
                .map(QuestionBankHotspotVO::objToVo)
                .collect(Collectors.toList());
        questionBankHotspotVOList.forEach(questionBankHotspotVO -> {
            // 设置题库信息
            QuestionBank questionBank = questionBankService.getById(questionBankHotspotVO.getQuestionBankId());
            questionBankHotspotVO.setTitle(questionBank.getTitle());
            questionBankHotspotVO.setDescription(questionBank.getDescription());
        });

        // 封装对象列表 => 封装对象分页
        questionBankHotspotVOPage.setRecords(questionBankHotspotVOList);
        return questionBankHotspotVOPage;
    }

    /**
     * 热点字段递增接口（自动初始化）
     *
     * @param questionBankId
     * @param field
     * @return boolean
     * @author DuRuiChi
     * @create 2025/5/25
     **/
    @Override
    public boolean incrementField(Long questionBankId, IncrementFieldEnum field) {
        // 参数校验
        ThrowUtils.throwIf(questionBankId == null || field == null, ErrorCode.PARAMS_ERROR);
        // 题库合法
        QuestionBank q = questionBankService.getById(questionBankId);
        ThrowUtils.throwIf(q == null, ErrorCode.NOT_FOUND_ERROR);
        // 题库是否已被记录在热点表
        QueryWrapper<QuestionBankHotspot> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq(ObjectUtils.isNotEmpty(q.getId()), "questionBankId", questionBankId);
        QuestionBankHotspot questionBankHotspot = this.getOne(queryWrapper);

        // 原子操作
        if (questionBankHotspot == null) {
            // 若不存在则插入
            try {
                QuestionBankHotspot newRecord = new QuestionBankHotspot();
                newRecord.setQuestionBankId(questionBankId);
                newRecord.setViewNum(0);
                newRecord.setStarNum(0);
                newRecord.setForwardNum(0);
                newRecord.setCollectNum(0);
                newRecord.setCommentNum(0);
                this.save(newRecord);
            } catch (DuplicateKeyException ignored) {
                // 忽略重复键异常，并停止本次保存，防止前端因 SSR 和 CSR 渲染差异而并发插入
            }
        }
        UpdateWrapper<QuestionBankHotspot> updateWrapper = new UpdateWrapper<>();
        updateWrapper.eq("questionBankId", questionBankId)
                .setSql(field.getFieldName() + " = " + field.getFieldName() + " + 1");
        return this.update(updateWrapper);
    }

    /**
     * 根据题库 id 获取题库热点信息，不存在时初始化
     *
     * @param questionBankId
     * @return
     */
    @Override
    public QuestionBankHotspot getByQuestionBankId(Long questionBankId) {
        QueryWrapper<QuestionBankHotspot> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("questionBankId", questionBankId);
        QuestionBankHotspot hotspot = this.getOne(queryWrapper);

        // 不存在时初始化热点数据
        if (hotspot == null) {
            try {
                // 尝试原子性插入
                hotspot = new QuestionBankHotspot();
                hotspot.setQuestionBankId(questionBankId);
                hotspot.setViewNum(0);
                hotspot.setStarNum(0);
                hotspot.setForwardNum(0);
                hotspot.setCollectNum(0);
                hotspot.setCommentNum(0);
                this.save(hotspot);
            } catch (DuplicateKeyException e) {
                // 重新查询，防止前端因 SSR 和 CSR 渲染差异而并发插入
                return this.getOne(queryWrapper);
            }
        }
        return hotspot;
    }

}
