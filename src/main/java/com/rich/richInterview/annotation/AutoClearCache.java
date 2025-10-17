package com.rich.richInterview.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 自动清除缓存注解
 * 用于标记需要清除指定前缀缓存的方法（通常用于增删改操作）
 *
 * @author DuRuiChi
 * @create 2025/10/17
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AutoClearCache {

    /**
     * 需要清除的缓存前缀数组
     * 支持多个前缀，会清除所有匹配前缀的缓存键
     */
    String[] prefixes();

    /**
     * 是否在方法执行成功后才清除缓存，默认为true
     * true: 方法执行成功后清除缓存
     * false: 方法执行前清除缓存
     */
    boolean clearAfterSuccess() default true;
}