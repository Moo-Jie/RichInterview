package com.rich.richInterview.config;

import com.volcengine.ark.runtime.service.ArkService;
import lombok.Data;
import okhttp3.ConnectionPool;
import okhttp3.Dispatcher;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * 火山方舟 AI SDK 配置类
 * @return
 * @author DuRuiChi
 * @create 2025/6/16
 **/
@Configuration
@ConfigurationProperties(prefix = "huoshanai")
@Data
public class HuoShanAiConfig {
    /**
     * API-KEY
     */
    private String apikey;

    /**
     * 初始化 ArkService ， 用于调用 AI 模型服务
     * @return com.volcengine.ark.runtime.service.ArkService
     * @author DuRuiChi
     * @create 2025/6/16
     **/
    @Bean
    public ArkService initArkService() {
        String baseUrl = "https://ark.cn-beijing.volces.com/api/v3";
        ConnectionPool connectionPool = new ConnectionPool(5, 1, TimeUnit.SECONDS);
        Dispatcher dispatcher = new Dispatcher();
        return ArkService.builder().dispatcher(dispatcher).connectionPool(connectionPool).baseUrl(baseUrl).apiKey(apikey).build();
    }
}
