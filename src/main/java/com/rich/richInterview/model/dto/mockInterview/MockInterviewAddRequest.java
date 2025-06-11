package com.rich.richInterview.model.dto.mockInterview;

import lombok.Data;

import java.io.Serializable;
import java.util.List;

/**
 * 创建模拟面试请求 (用户填写的用于创建 AI 对话的初始化信息)
 */
@Data
public class MockInterviewAddRequest implements Serializable {

    /**
     * 工作年限
     */
    private String workExperience;

    /**
     * 工作岗位
     */
    private String jobPosition;

    /**
     * 面试难度
     */
    private String difficulty;

    private static final long serialVersionUID = 1L;
}