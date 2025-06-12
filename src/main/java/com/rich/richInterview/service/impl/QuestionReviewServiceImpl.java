package com.rich.richInterview.service.impl;

import cn.hutool.core.collection.CollUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.CommonConstant;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.mapper.QuestionReviewMapper;
import com.rich.richInterview.model.dto.questionReview.QuestionReviewQueryRequest;
import com.rich.richInterview.model.entity.QuestionReview;
import com.rich.richInterview.service.QuestionBankQuestionService;
import com.rich.richInterview.service.QuestionReviewService;
import com.rich.richInterview.service.UserService;
import com.rich.richInterview.utils.SqlUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**
 * 题目审批服务实现
 *
 */
@Service
@Slf4j
public class QuestionReviewServiceImpl extends ServiceImpl<QuestionReviewMapper, QuestionReview> implements QuestionReviewService {

    /**
     * 校验数据
     *
     * @param questionReview
     * @param add      对创建的数据进行校验
     */
    @Override
    public void validQuestionReview(QuestionReview questionReview, boolean add) {
        ThrowUtils.throwIf(questionReview == null, ErrorCode.PARAMS_ERROR);
        // todo 从对象中取值
        String title = questionReview.getTitle();
        String content = questionReview.getContent();
        String tags = questionReview.getTags();
        String answer = questionReview.getAnswer();

        // 创建数据时，参数不能为空
        if (add) {
            // todo 补充校验规则rich_interview
            ThrowUtils.throwIf(StringUtils.isBlank(title), ErrorCode.PARAMS_ERROR);
            ThrowUtils.throwIf(StringUtils.isBlank(content), ErrorCode.PARAMS_ERROR);
            ThrowUtils.throwIf(StringUtils.isBlank(tags), ErrorCode.PARAMS_ERROR);
            ThrowUtils.throwIf(StringUtils.isBlank(answer), ErrorCode.PARAMS_ERROR);
        }
        // 修改数据时，有参数则校验
        // todo 补充校验规则
        if (StringUtils.isNotBlank(title)) {
            ThrowUtils.throwIf(title.length() > 80, ErrorCode.PARAMS_ERROR, "标题过长");
        }
        if (StringUtils.isNotBlank(content)) {
            ThrowUtils.throwIf(title.length() > 10240, ErrorCode.PARAMS_ERROR, "题目内容过长");
        }
        if (StringUtils.isNotBlank(answer)) {
            ThrowUtils.throwIf(answer.length() > 102400, ErrorCode.PARAMS_ERROR, "答案过长");
        }
        if (StringUtils.isNotBlank(tags)) {
            ThrowUtils.throwIf(tags.length() > 256, ErrorCode.PARAMS_ERROR, "标签过长");
        }
    }

    /**
     * 获取查询条件
     *
     * @param questionReviewQueryRequest
     * @return
     */
    @Override
    public QueryWrapper<QuestionReview> getQueryWrapper(QuestionReviewQueryRequest questionReviewQueryRequest) {
        QueryWrapper<QuestionReview> queryWrapper = new QueryWrapper<>();
        if (questionReviewQueryRequest == null) {
            return queryWrapper;
        }
        // todo 从对象中取值question_review
        Long id = questionReviewQueryRequest.getId();
        Long notId = questionReviewQueryRequest.getNotId();
        String title = questionReviewQueryRequest.getTitle();
        String content = questionReviewQueryRequest.getContent();
        String searchText = questionReviewQueryRequest.getSearchText();
        String sortField = questionReviewQueryRequest.getSortField();
        String sortOrder = questionReviewQueryRequest.getSortOrder();
        List<String> tagList = questionReviewQueryRequest.getTags();
        Long userId = questionReviewQueryRequest.getUserId();
        String answer = questionReviewQueryRequest.getAnswer();

        // todo 补充需要的查询条件
        // 从多字段中搜索
        if (StringUtils.isNotBlank(searchText)) {
            // 需要拼接查询条件
            queryWrapper.and(qw -> qw.like("title", searchText)
                            .or().like("tags", searchText)
//                    .or().like("content", searchText)
//                    .or().like("answer", searchText)
            );
        }
        // 精确查询
        queryWrapper.ne(ObjectUtils.isNotEmpty(notId), "id", notId);
        queryWrapper.eq(ObjectUtils.isNotEmpty(id), "id", id);
        queryWrapper.eq(ObjectUtils.isNotEmpty(userId), "userId", userId);
        // JSON 数组查询
        if (CollUtil.isNotEmpty(tagList)) {
            for (String tag : tagList) {
                queryWrapper.like("tags", "\"" + tag + "\"");
            }
        }
        // 模糊查询
        queryWrapper.like(StringUtils.isNotBlank(title), "title", title);
        queryWrapper.like(StringUtils.isNotBlank(content), "content", content);
        queryWrapper.like(StringUtils.isNotBlank(answer), "answer", answer);
        // 排序规则
        queryWrapper.orderBy(SqlUtils.validSortField(sortField),
                sortOrder.equals(CommonConstant.SORT_ORDER_ASC),
                sortField);
        return queryWrapper;
    }
}
