package com.rich.richInterview.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.IService;
import com.rich.richInterview.model.dto.mockInterview.MockInterviewEventRequest;
import com.rich.richInterview.model.dto.mockInterview.MockInterviewQueryRequest;
import com.rich.richInterview.model.entity.MockInterview;
import com.rich.richInterview.model.entity.User;

/**
 * 模拟面试服务
 *
 */
public interface MockInterviewService extends IService<MockInterview> {

    /**
     * 校验数据
     *
     * @param mockInterview
     * @param add 对创建的数据进行校验
     */
    void validMockInterview(MockInterview mockInterview, boolean add);

    /**
     * 获取查询条件
     *
     * @param mockInterviewQueryRequest
     * @return
     */
    QueryWrapper<MockInterview> getQueryWrapper(MockInterviewQueryRequest mockInterviewQueryRequest);

    /**
     * 进行模拟面试对话事件
     *
     * @param mockInterviewEventRequest
     * @param loginUser
     * @return
     */
    String conductChatEvent(MockInterviewEventRequest mockInterviewEventRequest, User loginUser);
}
