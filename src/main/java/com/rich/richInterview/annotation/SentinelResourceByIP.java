package com.rich.richInterview.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Sentinel 流量控制注解
 * 用于标记需要进行 IP 限流的方法
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface SentinelResourceByIP {

    /**
     * 资源名称，默认为方法名
     */
    String resourceName() default "";

    /**
     * 降级时返回的数据类型，用于生成降级响应
     */
    Class<?> fallbackType() default Object.class;

    /**
     * 是否启用降级处理，默认为 true
     */
    boolean enableFallback() default true;

    /**
     * 限流提示信息
     */
    String flowMessage() default "您访问过于频繁，系统压力稍大，请耐心等待哟~";
}