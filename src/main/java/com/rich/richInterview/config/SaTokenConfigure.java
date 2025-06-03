package com.rich.richInterview.config;

import cn.dev33.satoken.interceptor.SaInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Sa-Token 官方建议的配置类，注册 Sa-Token 拦截器
 * 源：https://sa-token.cc/doc.html#/use/at-check
 *
 * @author DuRuiChi
 * @create 2025/6/2
 **/
@Configuration
public class SaTokenConfigure implements WebMvcConfigurer {
    // 注册 Sa-Token 拦截器，打开注解式鉴权功能
    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // SaInterceptor 拦截器添加到 Spring MVC 拦截器链中，设定拦截所有请求
        registry.addInterceptor(new SaInterceptor()).addPathPatterns("/**");
    }
}
