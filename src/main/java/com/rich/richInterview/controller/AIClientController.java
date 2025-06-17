package com.rich.richInterview.controller;

import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import com.rich.richInterview.common.BaseResponse;
import com.rich.richInterview.utils.ResultUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

/**
 * AI 辅助构建答题文档接口
 *
 * @author DuRuiChi
 * @return
 * @create 2025/6/16
 **/
@RestController
@RequestMapping("/ai")
public class AIClientController {
    /**
     * API_KEY
     **/
    static final String API_KEY = "sk-7b4e977ad3f14352823fd2fcdd5b331b";

    /**
     * 使用的 AI 大模型
     **/
    static final String AI_Model = "deepseek-v3";

    /**
     * 角色预设上下文
     **/
    private String defaultRole = "你是一个专业知识丰富的面试者，擅长回答各式各样的面试题，现在你要为一个面试者解答问题。" +
            "(  语气设定：回答之前，先打印：“# 你好，我是RICH！ 接下来我将帮助你理解这道题目 ：”   )" +
            "(  格式设定：必须为Markdown格式，注意分级标题)";

    /**
     * 最大响应时间
     **/
    private int maxWaitTime = 60000;

    /**
     * AI 辅助构建答题文档接口
     *
     * @param question
     * @return com.rich.richInterview.common.BaseResponse<java.lang.String>
     * @author DuRuiChi
     * @create 2025/6/16
     **/
    @PostMapping("/query")
    public BaseResponse<String> queryAI(@RequestParam String question)
            throws ApiException, NoApiKeyException, InputRequiredException {
        Generation gen = new Generation();
        Message userMsg = Message.builder()
                .role(defaultRole)
                // 构建用户消息
                .content("现在我要问你一个面试题，请你以面试者的身份简明扼要地、总结性地、在短时间内快速地回答我的问题 " +
                        question)
                .build();

        GenerationParam param = GenerationParam.builder()
                .apiKey(API_KEY)
                .model(AI_Model)
                .messages(Arrays.asList(userMsg))
                .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                .build();

        return ResultUtils.success(gen.call(param).getOutput().getChoices().get(0).getMessage().getContent());
    }

    // 配置默认角色
    @PutMapping("/config/role")
    public void setDefaultRole(@RequestParam String role) {
        this.defaultRole = role;
    }

    // 配置最大响应时间
    @PutMapping("/config/timeout")
    public void setMaxWaitTime(@RequestParam int milliseconds) {
        this.maxWaitTime = milliseconds;
    }

    public int getMaxWaitTime() {
        return maxWaitTime;
    }
}