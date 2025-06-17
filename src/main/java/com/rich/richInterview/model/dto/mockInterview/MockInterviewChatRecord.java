package com.rich.richInterview.model.dto.mockInterview;

import lombok.Data;

import java.io.Serializable;

/**
 * 模拟面试聊天记录
 * @return
 * @author DuRuiChi
 * @create 2025/6/17
 **/
@Data
public class MockInterviewChatRecord implements Serializable {
    /**
     * 角色
     */
    private String role;

    /**
     * 内容
     */
    private String message;

    private static final long serialVersionUID = 1L;
}