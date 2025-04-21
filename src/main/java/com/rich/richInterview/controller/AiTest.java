package com.rich.richInterview.controller;// dashscope SDK的版本 >= 2.18.2

import java.util.Arrays;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.alibaba.dashscope.aigc.generation.Generation;
import com.alibaba.dashscope.aigc.generation.GenerationParam;
import com.alibaba.dashscope.aigc.generation.GenerationResult;
import com.alibaba.dashscope.common.Message;
import com.alibaba.dashscope.common.Role;
import com.alibaba.dashscope.exception.ApiException;
import com.alibaba.dashscope.exception.InputRequiredException;
import com.alibaba.dashscope.exception.NoApiKeyException;
import io.reactivex.Flowable;

import java.lang.System;

public class AiTest {
    // 设置日志级别为WARN
    static {
        System.setProperty("org.slf4j.simpleLogger.log.com.alibaba.dashscope", "warn");
    }
    private static final Logger logger = LoggerFactory.getLogger(AiTest.class);
    private static StringBuilder reasoningContent = new StringBuilder();
    private static StringBuilder finalContent = new StringBuilder();
    private static boolean isFirstPrint = true;

    private static void handleGenerationResult(GenerationResult message) {
        String reasoning = message.getOutput().getChoices().get(0).getMessage().getReasoningContent();
        String content = message.getOutput().getChoices().get(0).getMessage().getContent();

        if (!reasoning.isEmpty()) {
            reasoningContent.append(reasoning);
            if (isFirstPrint) {
                System.out.println("====================思考过程====================");
                isFirstPrint = false;
            }
            System.out.print(reasoning);
        }

        if (!content.isEmpty()) {
            finalContent.append(content);
            if (!isFirstPrint) {
                System.out.println("\n====================完整回复====================");
                isFirstPrint = true;
            }
            System.out.print(content);
        }
    }

    private static GenerationParam buildGenerationParam(Message userMsg) {
        return GenerationParam.builder()
                // 若没有配置环境变量，请用百炼API Key将下行替换为：.apiKey("sk-xxx")
                .apiKey(System.getenv("DASHSCOPE_API_KEY"))
                .model("deepseek-r1")
                .messages(Arrays.asList(userMsg))
                // 不可以设置为"text"
                .resultFormat(GenerationParam.ResultFormat.MESSAGE)
                .incrementalOutput(true)
                .build();
    }

    public static void streamCallWithMessage(Generation gen, Message userMsg)
            throws NoApiKeyException, ApiException, InputRequiredException {
        GenerationParam param = buildGenerationParam(userMsg);
        Flowable<GenerationResult> result = gen.streamCall(param);
        result.blockingForEach(message -> handleGenerationResult(message));
    }

    public static void main(String[] args) {
        try {
            Generation gen = new Generation();
            Message userMsg = Message.builder().role(Role.USER.getValue()).content("请问SpringBoot的核心优势是什么").build();
            streamCallWithMessage(gen, userMsg);
//             打印最终结果
//            if (reasoningContent.length() > 0) {
//                System.out.println("\n====================完整回复====================");
//                System.out.println(finalContent.toString());
//            }
        } catch (ApiException | NoApiKeyException | InputRequiredException e) {
            logger.error("An exception occurred: {}", e.getMessage());
        }
        System.exit(0);
    }
}