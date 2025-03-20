package com.rich.richInterview.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * 全局跨域配置
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    /**
     * 跨域配置
     * @param registry
     * @return void
     * @author DuRuiChi
     * @create 2025/3/20
     **/
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // 全局覆盖处理
        registry.addMapping("/**")
                // 允许发送 Cookie
                .allowCredentials(true)
                // 可放行域名
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .exposedHeaders("*");
    }
}
