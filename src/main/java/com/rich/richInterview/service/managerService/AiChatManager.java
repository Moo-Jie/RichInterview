package com.rich.richInterview.service.managerService;

import cn.hutool.core.collection.CollUtil;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.exception.BusinessException;
import com.rich.richInterview.model.dto.mockInterview.MockInterviewChatRecord;
import com.volcengine.StringUtil;
import com.volcengine.ark.runtime.model.completion.chat.ChatCompletionChoice;
import com.volcengine.ark.runtime.model.completion.chat.ChatCompletionRequest;
import com.volcengine.ark.runtime.model.completion.chat.ChatMessage;
import com.volcengine.ark.runtime.model.completion.chat.ChatMessageRole;
import com.volcengine.ark.runtime.service.ArkService;
import org.apache.commons.lang.StringUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;

/**
 * ai 调用管理器，提供了单、多轮对话的方法
 *
 * @author DuRuiChi
 * @return
 * @create 2025/6/16
 **/
@Service
public class AiChatManager {
    @Resource
    private ArkService arkService;

    /**
     * 使用的 AI 大模型
     **/
    static final String AI_MODEL = "deepseek-v3-250324";

    /**
     * 默认系统
     **/
    static final String DEFAULT_SYS_PROMPT = "你是一个专业的面试助手，擅长解答各种各样的面试题，回答全面、凝练、易懂。";


    /**
     * 通过预设上下文，调用 ai 服务, 返回响应内容 (单轮对话、默认预设)
     *
     * @param userPrompt 用户输入的上下文
     * @return java.lang.String
     * @author DuRuiChi
     * @create 2025/6/17
     **/
    public String aiChat(String userPrompt) {
        return aiChat(userPrompt, DEFAULT_SYS_PROMPT);
    }

    /**
     * 通过预设上下文，调用 ai 服务, 返回响应内容(单轮对话)
     *
     * @param userPrompt 用户输入的上下文
     * @param sysPrompt  系统预设的上下文
     * @return java.lang.String
     * @author DuRuiChi
     * @create 2025/6/17
     **/
    public String aiChat(String userPrompt, String sysPrompt) {
        System.out.println("\n----- standard request -----");
        // 构造消息列表（单条信息）
        final List<ChatMessage> messages = new ArrayList<>();
        final ChatMessage systemMessage = ChatMessage.builder().role(ChatMessageRole.SYSTEM).content(sysPrompt).build();
        final ChatMessage userMessage = ChatMessage.builder().role(ChatMessageRole.USER).content(userPrompt).build();
        messages.add(systemMessage);
        messages.add(userMessage);

        return aiChat(messages);
    }

    /**
     * 通过预设上下文，调用 ai 服务, 返回响应内容(多轮对话)
     *
     * @return java.lang.String
     * @author DuRuiChi
     * @create 2025/6/17
     **/
    public String aiChat(List<ChatMessage> messages) {
        System.out.println("\n----- standard request -----");
        // 构造 ai 请求参数
        ChatCompletionRequest chatCompletionRequest = ChatCompletionRequest.builder()
                // 指定您创建的方舟推理接入点 ID，此处已帮您修改为您的推理接入点 ID
                .model(AI_MODEL)
                .messages(messages)
                .build();

        // 通过预设参数调用 ai 接口服务，获取响应内容
        try {
            List<ChatCompletionChoice> choices = arkService.createChatCompletion(chatCompletionRequest).getChoices();
            if (CollUtil.isNotEmpty(choices)) {
                return (String) choices.get(0).getMessage().getContent();
            } else {
                throw new BusinessException(ErrorCode.OPERATION_ERROR, "ai 响应内容为空");
            }
        } catch (Exception e) {
            throw new RuntimeException("ai 服务调用异常");
        }
    }

    /**
     * 将火山 SDK 内封装的对话消息列表 ChatMessage ， 转换本系统的对话消息列表 MockInterviewChatRecord，用于存储到数据库中
     *
     * @param messages
     * @return java.util.List<com.rich.richInterview.model.dto.mockInterview.MockInterviewChatRecord>
     * @author DuRuiChi
     * @create 2025/6/17
     **/
    public static List<MockInterviewChatRecord> chatMessageToMockInterviewChatRecord(List<ChatMessage> messages) {
        return messages.stream().map(message -> {
            // 将 ChatMessage 转换为 MockInterviewChatRecord, 只保存 role 和 message 字段,从而实现简化后方便存储到数据库中
            MockInterviewChatRecord mockInterviewChatRecord = new MockInterviewChatRecord();
            mockInterviewChatRecord.setRole(message.getRole().value());
            mockInterviewChatRecord.setMessage(message.getContent().toString());
            return mockInterviewChatRecord;
        }).toList();
    }

    /**
     * 将本系统的对话消息列表 MockInterviewChatRecord，转换为火山 SDK 内封装的对话消息列表 ChatMessage，用于调用 ai 服务
     *
     * @param mockInterviewChatRecords
     * @return java.util.List<com.volcengine.ark.runtime.model.completion.chat.ChatMessage>
     * @author DuRuiChi
     * @create 2025/6/17
     **/
    public static List<ChatMessage> mockInterviewChatRecordToChatMessage(List<MockInterviewChatRecord> mockInterviewChatRecords) {
        return mockInterviewChatRecords.stream().map(mockInterviewChatRecord -> {
            ChatMessage chatMessage = ChatMessage.builder()
                    .role(ChatMessageRole.valueOf(StringUtils.upperCase(mockInterviewChatRecord.getRole())))
                    .content(mockInterviewChatRecord.getMessage()).build();
            return chatMessage;
        }).toList();
    }
}
