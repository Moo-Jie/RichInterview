package com.rich.richInterview.service.impl;

import cn.hutool.core.collection.CollUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.CommonConstant;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.mapper.QuestionBankHotspotMapper;
import com.rich.richInterview.model.dto.questionBankHotspot.QuestionBankHotspotQueryRequest;
import com.rich.richInterview.model.entity.QuestionBankHotspot;
import com.rich.richInterview.model.vo.QuestionBankHotspotVO;
import com.rich.richInterview.service.QuestionBankHotspotService;
import com.rich.richInterview.service.UserService;
import com.rich.richInterview.utils.SqlUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 题库热点服务实现
 *
 */
@Service
@Slf4j
public class QuestionBankHotspotServiceImpl extends ServiceImpl<QuestionBankHotspotMapper, QuestionBankHotspot> implements QuestionBankHotspotService {

    @Resource
    private UserService userService;

    /**
     * 校验数据
     *
     * @param questionBankHotspot
     * @param add      对创建的数据进行校验
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
        Long id = questionBankHotspotQueryRequest.getId();
        Long notId = questionBankHotspotQueryRequest.getNotId();
        String title = questionBankHotspotQueryRequest.getTitle();
        String content = questionBankHotspotQueryRequest.getContent();
        String searchText = questionBankHotspotQueryRequest.getSearchText();
        String sortField = questionBankHotspotQueryRequest.getSortField();
        String sortOrder = questionBankHotspotQueryRequest.getSortOrder();
        List<String> tagList = questionBankHotspotQueryRequest.getTags();
        Long userId = questionBankHotspotQueryRequest.getUserId();
        // todo 补充需要的查询条件
        // 从多字段中搜索
        if (StringUtils.isNotBlank(searchText)) {
            // 需要拼接查询条件
            queryWrapper.and(qw -> qw.like("title", searchText).or().like("content", searchText));
        }
        // 模糊查询
        queryWrapper.like(StringUtils.isNotBlank(title), "title", title);
        queryWrapper.like(StringUtils.isNotBlank(content), "content", content);
        // JSON 数组查询
        if (CollUtil.isNotEmpty(tagList)) {
            for (String tag : tagList) {
                queryWrapper.like("tags", "\"" + tag + "\"");
            }
        }
        // 精确查询
        queryWrapper.ne(ObjectUtils.isNotEmpty(notId), "id", notId);
        queryWrapper.eq(ObjectUtils.isNotEmpty(id), "id", id);
        queryWrapper.eq(ObjectUtils.isNotEmpty(userId), "userId", userId);
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
        return QuestionBankHotspotVO.objToVo(questionBankHotspot);
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
        List<QuestionBankHotspotVO> questionBankHotspotVOList = questionBankHotspotList.stream().map(QuestionBankHotspotVO::objToVo).collect(Collectors.toList());

        questionBankHotspotVOPage.setRecords(questionBankHotspotVOList);
        return questionBankHotspotVOPage;
    }

}
