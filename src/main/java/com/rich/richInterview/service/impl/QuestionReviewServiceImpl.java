package com.rich.richInterview.service.impl;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.CommonConstant;
import com.rich.richInterview.constant.SourceConstant;
import com.rich.richInterview.exception.BusinessException;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.mapper.QuestionReviewMapper;
import com.rich.richInterview.model.dto.questionReview.QuestionReviewAddRequest;
import com.rich.richInterview.model.dto.questionReview.QuestionReviewQueryRequest;
import com.rich.richInterview.model.dto.questionReview.QuestionReviewUpdateRequest;
import com.rich.richInterview.model.entity.Question;
import com.rich.richInterview.model.entity.QuestionReview;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.model.enums.ReviewStatusEnum;
import com.rich.richInterview.service.QuestionReviewService;
import com.rich.richInterview.service.QuestionService;
import com.rich.richInterview.service.UserService;
import com.rich.richInterview.utils.SqlUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.List;

/**
 * 题目审批服务实现
 *
 */
@Service
@Slf4j
public class QuestionReviewServiceImpl extends ServiceImpl<QuestionReviewMapper, QuestionReview> implements QuestionReviewService {


    @Resource
    private UserService userService;

    @Resource
    private QuestionService questionService;

    /**
     *
     * 校验数据
     * @param questionReview
     * @param add
     * @return void
     * @author DuRuiChi
     * @create 2025/6/12
     **/
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
     *
     * 获取查询条件
     * @param questionReviewQueryRequest
     * @return com.baomidou.mybatisplus.core.conditions.query.QueryWrapper<com.rich.richInterview.model.entity.QuestionReview>
     * @author DuRuiChi
     * @create 2025/6/12
     **/
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

    /**
     * 添加题目审批
     * @param questionReviewAddRequest
     * @param request
     * @return java.lang.Long
     * @author DuRuiChi
     * @create 2025/6/12
     **/
    @Override
    public Long addQuestionReview(QuestionReviewAddRequest questionReviewAddRequest, HttpServletRequest request) {
        // todo 在此处将实体类和 DTO 进行转换
        QuestionReview questionReview = new QuestionReview();
        BeanUtils.copyProperties(questionReviewAddRequest, questionReview);
        // tags 的转换
        if (questionReviewAddRequest.getTags() != null) {
            questionReview.setTags(JSONUtil.toJsonStr(questionReviewAddRequest.getTags()));
        }
        // 数据校验
        this.validQuestionReview(questionReview, true);
        // todo 填充默认值
        User loginUser = userService.getLoginUser(request);
        questionReview.setUserId(loginUser.getId());
        // 初始化为待审核
        questionReview.setReviewStatus(ReviewStatusEnum.WAITING.getCode());
        // 写入数据库
        boolean result = this.save(questionReview);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        // 返回新写入的数据 id
        return questionReview.getId();
    }

    /**
     *
     * 删除题目审批
     * @param id
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/6/12
     **/
    @Override
    public Boolean deleteQuestionReview(Long id, HttpServletRequest request) {
        User user = userService.getLoginUser(request);
        // 判断是否存在
        QuestionReview oldQuestionReview = this.getById(id);
        ThrowUtils.throwIf(oldQuestionReview == null, ErrorCode.NOT_FOUND_ERROR);
        // 仅本人或管理员可删除
        if (!oldQuestionReview.getUserId().equals(user.getId()) && !userService.isAdmin(request)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
        // 操作数据库
        boolean result = this.removeById(id);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return true;
    }

    /**
     *
     *  批量删除题目审批
     * @param ids
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/6/12
     **/
    @Override
    public Boolean batchDeleteQuestionReview(List<Long> ids, HttpServletRequest request) {
        ids.forEach(id -> {
            QuestionReview questionReview = this.getById(id);
            ThrowUtils.throwIf(questionReview == null, ErrorCode.NOT_FOUND_ERROR);

            boolean result = this.removeById(id);
            ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        });
        return true;
    }

    /**
     *
     *  更新题目审批
     * @param questionReviewUpdateRequest
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/6/12
     **/
    @Override
    public Boolean updateQuestionReview(QuestionReviewUpdateRequest questionReviewUpdateRequest) {
        // todo 在此处将实体类和 DTO 进行转换
        QuestionReview questionReview = new QuestionReview();
        BeanUtils.copyProperties(questionReviewUpdateRequest, questionReview);
        // 数据校验
        this.validQuestionReview(questionReview, false);
        // 判断是否存在
        long id = questionReviewUpdateRequest.getId();
        QuestionReview oldQuestionReview = this.getById(id);
        ThrowUtils.throwIf(oldQuestionReview == null, ErrorCode.NOT_FOUND_ERROR);
        // 操作数据库
        boolean result = this.updateById(questionReview);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);

        return true;
    }

    /**
     *
     * 通过审批
     * @param reviewId
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/6/12
     **/
    @Override
    public Boolean approveQuestionReview(Long reviewId, HttpServletRequest request) {
        // 获取审批记录
        QuestionReview questionReview = this.getById(reviewId);
        ThrowUtils.throwIf(questionReview == null, ErrorCode.NOT_FOUND_ERROR);
        ThrowUtils.throwIf(!(ReviewStatusEnum.WAITING.getCode() == questionReview.getReviewStatus()),
                ErrorCode.OPERATION_ERROR, "非待审批状态");

        // 获取当前审批人
        User reviewer = userService.getLoginUser(request);

        // 转储到题目表
        Question question = new Question();
        // 复制基础字段
        BeanUtils.copyProperties(questionReview, question);
        // 来源设置为用户提供
        question.setSource(SourceConstant.USER_PROVIDE);
        // 设置审核信息
        question.setReviewerId(reviewer.getId());
        question.setReviewStatus(ReviewStatusEnum.PASS.getCode());

        // 同步到题目表
        boolean saveResult = questionService.save(question);
        ThrowUtils.throwIf(!saveResult, ErrorCode.OPERATION_ERROR);

        // 更新审批记录状态
        QuestionReview updateEntity = new QuestionReview();
        updateEntity.setId(reviewId);
        updateEntity.setReviewStatus(ReviewStatusEnum.PASS.getCode());

        boolean updateResult = this.updateById(updateEntity);
        ThrowUtils.throwIf(!updateResult, ErrorCode.OPERATION_ERROR);

        return true;
    }

    /**
     *
     *  批量通过审批
     * @param reviewIds
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/6/12
     **/
    @Override
    public Boolean batchApproveQuestionReview(List<Long> reviewIds, HttpServletRequest request) {
        User reviewer = userService.getLoginUser(request);

        reviewIds.forEach(reviewId -> {
            QuestionReview questionReview = this.getById(reviewId);
            ThrowUtils.throwIf(questionReview == null, ErrorCode.NOT_FOUND_ERROR);
            ThrowUtils.throwIf(!(ReviewStatusEnum.WAITING.getCode() == questionReview.getReviewStatus()),
                    ErrorCode.OPERATION_ERROR, "ID为" + reviewId + "的记录非待审批状态");
            // 转储到题目表
            Question question = new Question();
            // 复制基础字段
            BeanUtils.copyProperties(questionReview, question);
            // 来源设置为用户提供
            question.setSource(SourceConstant.USER_PROVIDE);
            // 设置审核信息
            question.setReviewerId(reviewer.getId());
            question.setReviewStatus(ReviewStatusEnum.PASS.getCode());
            boolean saveResult = questionService.save(question);
            ThrowUtils.throwIf(!saveResult, ErrorCode.OPERATION_ERROR);

            // 更新审批记录
            QuestionReview updateEntity = new QuestionReview();
            updateEntity.setId(reviewId);
            updateEntity.setReviewStatus(ReviewStatusEnum.PASS.getCode());

            boolean updateResult = this.updateById(updateEntity);
            ThrowUtils.throwIf(!updateResult, ErrorCode.OPERATION_ERROR);
        });

        return true;
    }

    /**
     *
     *  拒绝审批
     * @param reviewId
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/6/12
     **/
    @Override
    public Boolean rejectQuestionReview(Long reviewId, HttpServletRequest request) {
        QuestionReview questionReview = this.getById(reviewId);
        ThrowUtils.throwIf(questionReview == null, ErrorCode.NOT_FOUND_ERROR);
        ThrowUtils.throwIf(!(ReviewStatusEnum.WAITING.getCode() == questionReview.getReviewStatus()),
                ErrorCode.OPERATION_ERROR, "非待审批状态");

        QuestionReview updateEntity = new QuestionReview();
        updateEntity.setId(reviewId);
        updateEntity.setReviewStatus(ReviewStatusEnum.REJECT.getCode());

        boolean result = this.updateById(updateEntity);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);

        return true;
    }

    /**
     *
     *  批量拒绝审批
     * @param reviewIds
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/6/12
     **/
    @Override
    public Boolean batchRejectQuestionReview(List<Long> reviewIds, HttpServletRequest request) {
        reviewIds.forEach(reviewId -> {
            QuestionReview questionReview = this.getById(reviewId);
            ThrowUtils.throwIf(questionReview == null, ErrorCode.NOT_FOUND_ERROR);
            ThrowUtils.throwIf(!(ReviewStatusEnum.WAITING.getCode() == questionReview.getReviewStatus()),
                    ErrorCode.OPERATION_ERROR, "ID为"+reviewId+"的记录非待审批状态");

            QuestionReview updateEntity = new QuestionReview();
            updateEntity.setId(reviewId);
            updateEntity.setReviewStatus(ReviewStatusEnum.REJECT.getCode());

            boolean result = this.updateById(updateEntity);
            ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        });

        return true;
    }
}
