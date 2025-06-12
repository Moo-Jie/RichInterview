package com.rich.richInterview.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.CommonConstant;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.mapper.MockInterviewMapper;
import com.rich.richInterview.model.dto.mockInterview.MockInterviewEventRequest;
import com.rich.richInterview.model.dto.mockInterview.MockInterviewQueryRequest;
import com.rich.richInterview.model.entity.MockInterview;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.service.MockInterviewService;
import com.rich.richInterview.service.UserService;
import com.rich.richInterview.utils.SqlUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;

/**
 * 模拟面试服务实现
 */
@Service
@Slf4j
public class MockInterviewServiceImpl extends ServiceImpl<MockInterviewMapper, MockInterview> implements MockInterviewService {

    @Resource
    private UserService userService;

    /**
     * 校验数据
     *
     * @param mockInterview
     * @param add           对创建的数据进行校验
     */
    @Override
    public void validMockInterview(MockInterview mockInterview, boolean add) {
        ThrowUtils.throwIf(mockInterview == null, ErrorCode.PARAMS_ERROR);
        // todo 从对象中取值
        Long id = mockInterview.getId();
        String workExperience = mockInterview.getWorkExperience();
        String jobPosition = mockInterview.getJobPosition();
        String difficulty = mockInterview.getDifficulty();
        Integer status = mockInterview.getStatus();

        // 创建数据时，参数不能为空
        if (add) {
            // todo 补充校验规则
            ThrowUtils.throwIf(StringUtils.isBlank(workExperience), ErrorCode.PARAMS_ERROR);
            ThrowUtils.throwIf(StringUtils.isBlank(jobPosition), ErrorCode.PARAMS_ERROR);
            ThrowUtils.throwIf(StringUtils.isBlank(difficulty), ErrorCode.PARAMS_ERROR);
        }
    }

    /**
     * 获取查询条件
     *
     * @param mockInterviewQueryRequest
     * @return
     */
    @Override
    public QueryWrapper<MockInterview> getQueryWrapper(MockInterviewQueryRequest mockInterviewQueryRequest) {
        QueryWrapper<MockInterview> queryWrapper = new QueryWrapper<>();
        if (mockInterviewQueryRequest == null) {
            return queryWrapper;
        }
        // todo 从对象中取值
        Long id = mockInterviewQueryRequest.getId();
        String workExperience = mockInterviewQueryRequest.getWorkExperience();
        String jobPosition = mockInterviewQueryRequest.getJobPosition();
        String difficulty = mockInterviewQueryRequest.getDifficulty();
        Long userId = mockInterviewQueryRequest.getUserId();
        String sortField = mockInterviewQueryRequest.getSortField();
        String sortOrder = mockInterviewQueryRequest.getSortOrder();

        // todo 补充需要的查询条件
        // 模糊查询
        queryWrapper.like(StringUtils.isNotBlank(workExperience), "workExperience", workExperience);
        queryWrapper.like(StringUtils.isNotBlank(jobPosition), "jobPosition", jobPosition);
        queryWrapper.like(StringUtils.isNotBlank(difficulty), "difficulty", difficulty);
        queryWrapper.like(StringUtils.isNotBlank(jobPosition), "jobPosition", jobPosition);
        // 精确查询
        queryWrapper.eq(ObjectUtils.isNotEmpty(id), "id", id);
        queryWrapper.eq(ObjectUtils.isNotEmpty(userId), "userId", userId);
        // 排序规则
        queryWrapper.orderBy(SqlUtils.validSortField(sortField),
                sortOrder.equals(CommonConstant.SORT_ORDER_ASC),
                sortField);
        return queryWrapper;
    }

    /**
     * 进行模拟面试对话事件  TODO
     *
     * @param mockInterviewEventRequest
     * @param loginUser
     * @return java.lang.String
     * @author DuRuiChi
     * @create 2025/6/11
     **/
    @Override
    public String conductChatEvent(MockInterviewEventRequest mockInterviewEventRequest, User loginUser) {
        return "";
    }
}
