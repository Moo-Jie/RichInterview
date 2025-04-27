package com.rich.richInterview.controller;

import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import com.rich.richInterview.common.BaseResponse;
import com.rich.richInterview.common.ResultUtils;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@RequestMapping("/ai")
public class AIClientController {

    // 默认角色配置
    private String defaultRole = Role.USER.getValue();
    // 默认超时时间（毫秒）
    private int maxWaitTime = 60000;

    @PostMapping("/query")
    public BaseResponse<String> queryAI(@RequestParam String question)
            throws ApiException, NoApiKeyException, InputRequiredException {
        Generation gen = new Generation();
        Message userMsg = Message.builder()
                .role(defaultRole)
                .content("现在我要问你一个面试题，请你简明扼要地、总结性质地、在短时间内快速地回答我的问题" +
                        question +
                        "(   语气设定：回答之前，先打印：“# 你好，我是RICH！ 接下来我将帮助你理解这道题目 ：”   )" +
                        "(   格式设定：必须为Markdown格式,分级标题，需要的话附上代码块  )")
                .build();

        GenerationParam param = GenerationParam.builder()
                .apiKey("sk-7b4e977ad3f14352823fd2fcdd5b331b")
                .model("deepseek-v3")
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
}