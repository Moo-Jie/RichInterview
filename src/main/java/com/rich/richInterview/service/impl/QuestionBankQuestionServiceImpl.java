package com.rich.richInterview.service.impl;

import cn.hutool.core.collection.CollUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.rich.richInterview.common.DeleteRequest;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.CommonConstant;
import com.rich.richInterview.exception.BusinessException;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.mapper.QuestionBankQuestionMapper;
import com.rich.richInterview.model.dto.questionBankQuestion.QuestionBankQuestionAddRequest;
import com.rich.richInterview.model.dto.questionBankQuestion.QuestionBankQuestionQueryRequest;
import com.rich.richInterview.model.dto.questionBankQuestion.QuestionBankQuestionRemoveRequest;
import com.rich.richInterview.model.dto.questionBankQuestion.QuestionBankQuestionUpdateRequest;
import com.rich.richInterview.model.entity.Question;
import com.rich.richInterview.model.entity.QuestionBank;
import com.rich.richInterview.model.entity.QuestionBankQuestion;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.model.vo.QuestionBankQuestionVO;
import com.rich.richInterview.model.vo.UserVO;
import com.rich.richInterview.service.QuestionBankQuestionService;
import com.rich.richInterview.service.QuestionBankService;
import com.rich.richInterview.service.QuestionService;
import com.rich.richInterview.service.UserService;
import com.rich.richInterview.utils.SqlUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 题库题目关系服务实现
 *
 */
@Service
@Slf4j
public class QuestionBankQuestionServiceImpl extends ServiceImpl<QuestionBankQuestionMapper, QuestionBankQuestion> implements QuestionBankQuestionService {

    @Resource
    private UserService userService;

    @Resource
    @Lazy
    private QuestionService questionService;

    @Resource
    @Lazy
    private QuestionBankService questionBankService;

    /**
     * 校验题目与题库数据
     *
     * @param questionBankQuestion
     * @param add      对创建的数据进行校验
     */
    @Override
    public void validQuestionBankQuestion(QuestionBankQuestion questionBankQuestion, boolean add) {
        ThrowUtils.throwIf(questionBankQuestion == null, ErrorCode.PARAMS_ERROR);
        // 校验题目
        Long questionId = questionBankQuestion.getQuestionId();
        ThrowUtils.throwIf(questionId == null, ErrorCode.PARAMS_ERROR, "请填写要关联的题目");
        Question question = questionService.getById(questionId);
        ThrowUtils.throwIf(question == null, ErrorCode.NOT_FOUND_ERROR, "题目不存在");
        // 校验题库
        Long questionBankId = questionBankQuestion.getQuestionBankId();
        ThrowUtils.throwIf(questionBankId == null, ErrorCode.PARAMS_ERROR, "请填写要关联的题库");
        QuestionBank questionBank = questionBankService.getById(questionBankId);
        ThrowUtils.throwIf(questionBank == null, ErrorCode.NOT_FOUND_ERROR, "题库不存在");
    }


    /**
     * 获取查询条件
     *
     * @param questionBankQuestionQueryRequest
     * @return
     */
    @Override
    public QueryWrapper<QuestionBankQuestion> getQueryWrapper(QuestionBankQuestionQueryRequest questionBankQuestionQueryRequest) {
        QueryWrapper<QuestionBankQuestion> queryWrapper = new QueryWrapper<>();
        if (questionBankQuestionQueryRequest == null) {
            return queryWrapper;
        }
        // todo 从对象中取值
        Long id = questionBankQuestionQueryRequest.getId();
        Long notId = questionBankQuestionQueryRequest.getNotId();
        String sortField = questionBankQuestionQueryRequest.getSortField();
        String sortOrder = questionBankQuestionQueryRequest.getSortOrder();
        Long userId = questionBankQuestionQueryRequest.getUserId();
        Long questionBankId = questionBankQuestionQueryRequest.getQuestionBankId();
        Long questionId = questionBankQuestionQueryRequest.getQuestionId();

        // todo 补充需要的查询条件
        // 精确查询
        queryWrapper.ne(ObjectUtils.isNotEmpty(notId), "id", notId);
        queryWrapper.eq(ObjectUtils.isNotEmpty(id), "id", id);
        queryWrapper.eq(ObjectUtils.isNotEmpty(userId), "userId", userId);
        queryWrapper.eq(ObjectUtils.isNotEmpty(questionBankId), "questionBankId", questionBankId);
        queryWrapper.eq(ObjectUtils.isNotEmpty(questionId), "questionId", questionId);
        // 排序规则
        queryWrapper.orderBy(SqlUtils.validSortField(sortField),
                sortOrder.equals(CommonConstant.SORT_ORDER_ASC),
                sortField);
        return queryWrapper;
    }

    /**
     * 获取题库题目关系封装
     *
     * @param questionBankQuestion
     * @param request
     * @return
     */
    @Override
    public QuestionBankQuestionVO getQuestionBankQuestionVO(QuestionBankQuestion questionBankQuestion, HttpServletRequest request) {
        // 对象转封装类
        QuestionBankQuestionVO questionBankQuestionVO = QuestionBankQuestionVO.objToVo(questionBankQuestion);

        // todo 根据需要为封装对象补充值
         
        // 1. 关联查询用户信息
        Long userId = questionBankQuestion.getUserId();
        User user = null;
        if (userId != null && userId > 0) {
            user = userService.getById(userId);
        }
        UserVO userVO = userService.getUserVO(user);
        questionBankQuestionVO.setUser(userVO);
        return questionBankQuestionVO;
    }

    /**
     * 分页获取题库题目关系封装
     *
     * @param questionBankQuestionPage
     * @param request
     * @return
     */
    @Override
    public Page<QuestionBankQuestionVO> getQuestionBankQuestionVOPage(Page<QuestionBankQuestion> questionBankQuestionPage, HttpServletRequest request) {
        List<QuestionBankQuestion> questionBankQuestionList = questionBankQuestionPage.getRecords();
        Page<QuestionBankQuestionVO> questionBankQuestionVOPage = new Page<>(questionBankQuestionPage.getCurrent(),
                questionBankQuestionPage.getSize(), 
                questionBankQuestionPage.getTotal());
        if (CollUtil.isEmpty(questionBankQuestionList)) {
            return questionBankQuestionVOPage;
        }
        // 对象列表 => 封装对象列表
        List<QuestionBankQuestionVO> questionBankQuestionVOList = questionBankQuestionList.stream()
                .map(QuestionBankQuestionVO::objToVo)
                .collect(Collectors.toList());

        // todo 根据需要为封装对象补充值

        // 1.关联查询用户信息
        Set<Long> userIdSet = questionBankQuestionList.stream()
                .map(QuestionBankQuestion::getUserId)
                .collect(Collectors.toSet());
        Map<Long, List<User>> userIdUserListMap = userService.listByIds(userIdSet).stream()
                .collect(Collectors.groupingBy(User::getId));
        questionBankQuestionVOList.forEach(questionBankQuestionVO -> {
            Long userId = questionBankQuestionVO.getUserId();
            User user = null;
            if (userIdUserListMap.containsKey(userId)) {
                user = userIdUserListMap.get(userId).get(0);
            }
            questionBankQuestionVO.setUser(userService.getUserVO(user));
        });
        // 2.已登录，获取用户点赞、收藏状态(待完善)
//        Map<Long, Boolean> questionBankQuestionIdHasThumbMap = new HashMap<>();
//        Map<Long, Boolean> questionBankQuestionIdHasFavourMap = new HashMap<>();
//        User loginUser = userService.getLoginUserPermitNull(request);
//        if (loginUser != null) {
//            Set<Long> questionBankQuestionIdSet = questionBankQuestionList.stream().map(QuestionBankQuestion::getId).collect(Collectors.toSet());
//            loginUser = userService.getLoginUser(request);
//        }

        questionBankQuestionVOPage.setRecords(questionBankQuestionVOList);
        return questionBankQuestionVOPage;
    }

    /**
     * (题库ID、题目ID删除)
     * @param questionBankQuestionRemoveRequest
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    @Override
    public Boolean removeQuestionBankQuestion(QuestionBankQuestionRemoveRequest questionBankQuestionRemoveRequest, HttpServletRequest request) {
        // 校验参数
        ThrowUtils.throwIf(questionBankQuestionRemoveRequest == null, ErrorCode.PARAMS_ERROR);
        Long questionBankId = questionBankQuestionRemoveRequest.getQuestionBankId();
        Long questionId = questionBankQuestionRemoveRequest.getQuestionId();
        ThrowUtils.throwIf(questionId == null, ErrorCode.PARAMS_ERROR);
        ThrowUtils.throwIf(questionBankId == null, ErrorCode.PARAMS_ERROR);
        // 删除
        LambdaQueryWrapper<QuestionBankQuestion> lambdaQueryWrapper = Wrappers.lambdaQuery(QuestionBankQuestion.class)
                .eq(QuestionBankQuestion::getQuestionBankId, questionBankId)
                .eq(QuestionBankQuestion::getQuestionId, questionId);
        return this.remove(lambdaQueryWrapper);
    }

    /**
     * 创建题库题目关系
     * @param questionBankQuestionAddRequest
     * @param request
     * @return java.lang.Long
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    @Override
    public Long addQuestionBankQuestion(QuestionBankQuestionAddRequest questionBankQuestionAddRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(questionBankQuestionAddRequest == null, ErrorCode.PARAMS_ERROR);
        // todo 在此处将实体类和 DTO 进行转换
        QuestionBankQuestion questionBankQuestion = new QuestionBankQuestion();
        BeanUtils.copyProperties(questionBankQuestionAddRequest, questionBankQuestion);
        // 数据校验
        this.validQuestionBankQuestion(questionBankQuestion, true);
        // todo 填充默认值
        User loginUser = userService.getLoginUser(request);
        questionBankQuestion.setUserId(loginUser.getId());
        // 写入数据库
        boolean result = this.save(questionBankQuestion);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        // 返回新写入的数据 id
        long newQuestionBankQuestionId = questionBankQuestion.getId();
        return newQuestionBankQuestionId;
    }

    /**
     * 删除题库题目关系(按照ID删除，仅管理员可用)
     * @param deleteRequest
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    @Override
    public Boolean deleteQuestionBankQuestion(DeleteRequest deleteRequest, HttpServletRequest request) {
        if (deleteRequest == null || deleteRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        User user = userService.getLoginUser(request);
        long id = deleteRequest.getId();
        // 判断是否存在
        QuestionBankQuestion oldQuestionBankQuestion = this.getById(id);
        ThrowUtils.throwIf(oldQuestionBankQuestion == null, ErrorCode.NOT_FOUND_ERROR);
        // 仅本人或管理员可删除
        if (!oldQuestionBankQuestion.getUserId().equals(user.getId()) && !userService.isAdmin(request)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
        // 操作数据库
        boolean result = this.removeById(id);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return true;
    }

    /**
     * 更新题库题目关系（仅管理员可用）
     * @param questionBankQuestionUpdateRequest
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    @Override
    public Boolean updateQuestionBankQuestion(QuestionBankQuestionUpdateRequest questionBankQuestionUpdateRequest) {
        if (questionBankQuestionUpdateRequest == null || questionBankQuestionUpdateRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        // todo 在此处将实体类和 DTO 进行转换
        QuestionBankQuestion questionBankQuestion = new QuestionBankQuestion();
        BeanUtils.copyProperties(questionBankQuestionUpdateRequest, questionBankQuestion);
        // 数据校验
        this.validQuestionBankQuestion(questionBankQuestion, false);
        // 判断是否存在
        long id = questionBankQuestionUpdateRequest.getId();
        QuestionBankQuestion oldQuestionBankQuestion = this.getById(id);
        ThrowUtils.throwIf(oldQuestionBankQuestion == null, ErrorCode.NOT_FOUND_ERROR);
        // 操作数据库
        boolean result = this.updateById(questionBankQuestion);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return true;
    }

}
