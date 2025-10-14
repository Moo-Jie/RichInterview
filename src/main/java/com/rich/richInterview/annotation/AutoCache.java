package com.rich.richInterview.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 自动缓存注解
 * 用于标记需要自动缓存到Redis的方法
 *
 * @author DuRuiChi
 * @create 2025/1/12
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AutoCache {

    /**
     * 缓存键前缀，默认为空，使用方法名
     */
    String keyPrefix() default "";

    /**
     * 缓存过期时间（秒），默认15分钟
     */
    long expireTime() default 900;

    /**
     * 是否启用缓存穿透保护（空值缓存）
     */
    boolean enableNullCache() default true;

    /**
     * 空值缓存时间（秒），默认5分钟
     */
    long nullCacheTime() default 300;

    /**
     * 是否启用缓存击穿保护（分布式锁）
     */
    boolean enableLock() default true;

    /**
     * 分布式锁等待时间（秒）
     */
    long lockWaitTime() default 10;

    /**
     * 分布式锁租期时间（秒）
     */
    long lockLeaseTime() default 30;

    /**
     * 是否启用缓存雪崩保护（随机过期时间）
     */
    boolean enableRandomExpire() default true;

    /**
     * 随机过期时间范围（秒），在expireTime基础上随机增加0到该值的时间，防止缓存雪崩
     */
    long randomExpireRange() default 300;
}