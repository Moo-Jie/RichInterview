package com.rich.richInterview.aspect;

import com.rich.richInterview.annotation.AutoCache;
import com.rich.richInterview.utils.CacheUtils;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.redisson.api.RLock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * 自动缓存切面
 * 处理 @AutoCache 注解的方法，实现自动缓存功能（包含缓存雪崩、击穿、穿透的防护机制）
 *
 * @author DuRuiChi
 * @create 2025/10/12
 */
@Aspect
@Component
@Slf4j
public class AutoCacheAspect {

    @Autowired
    private CacheUtils cacheUtils;

    /**
     * 环绕通知，处理 @AutoCache 注解的方法
     *
     * @param joinPoint 切入点，用于执行原方法
     * @param autoCache 自动缓存注解，包含缓存配置信息
     * @return java.lang.Object  原方法的执行结果
     */
    @Around("@annotation(autoCache)")
    public Object around(ProceedingJoinPoint joinPoint, AutoCache autoCache) throws Throwable {
        // 获取方法信息
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Object[] args = joinPoint.getArgs();

        // 通过拼接方法名和参数生成缓存键
        String cacheKey = cacheUtils.generateCacheKey(
                autoCache.keyPrefix(),
                args
        );

        // 获取返回值类型
        Class<?> returnType = signature.getReturnType();

        log.info("开始处理缓存, 缓存键: {}", cacheKey);

        // 1. 尝试从缓存获取数据
        Object cachedResult = cacheUtils.getCache(cacheKey, returnType);

        // 双重检查（Double-Checked）避免并发环境下重复执行后续方法并缓存结果

        // 第一次检查缓存是否命中
        if (cachedResult != null) {
            log.info("缓存命中，直接返回，缓存键: {}", cacheKey);
            return cachedResult;
        }

        // 2. 缓存未命中，检查是否启用分布式锁（防止缓存击穿）
        if (autoCache.enableLock()) {
            return handleWithLock(joinPoint, autoCache, cacheKey, returnType);
        } else {
            return handleWithoutLock(joinPoint, autoCache, cacheKey);
        }
    }

    /**
     * 使用分布式锁处理缓存（防止缓存击穿）
     *
     * @param joinPoint  切入点，用于执行原方法
     * @param autoCache  自动缓存注解，包含缓存配置信息
     * @param cacheKey   缓存键，用于唯一标识缓存数据
     * @param returnType 方法的返回值类型，用于指定缓存数据的反序列化类型
     * @return java.lang.Object  原方法的执行结果
     */
    private Object handleWithLock(ProceedingJoinPoint joinPoint, AutoCache autoCache,
                                  String cacheKey, Class<?> returnType) throws Throwable {
        String lockKey = cacheUtils.generateLockKey(cacheKey);
        RLock lock = null;

        try {
            // 创建分布式锁（设定唯一锁键，避免不同参数的方法之间的锁冲突，保证分布式环境下锁的唯一性）
            lock = cacheUtils.getLock(lockKey, autoCache.lockWaitTime(), autoCache.lockLeaseTime());

            // 检查锁是否获取成功
            if (lock != null) {
                // 第二次检查缓存是否命中，防止有其他线程已经在锁创建之前缓存了结果
                Object cachedResult = cacheUtils.getCache(cacheKey, returnType);
                if (cachedResult != null) {
                    log.info("双重检查缓存命中，缓存键: {}", cacheKey);
                    return cachedResult;
                }
                // 执行后续方法并缓存结果
                return executeAndCache(joinPoint, autoCache, cacheKey);
            } else {
                // 获取锁失败，直接执行原方法（降级策略）
                log.warn("获取分布式锁失败，直接执行方法，缓存键: {}", cacheKey);
                return joinPoint.proceed();
            }
        } finally {
            // 释放锁
            cacheUtils.releaseLock(lock);
        }
    }

    /**
     * 不使用分布式锁处理缓存
     *
     * @param joinPoint 切入点，用于执行原方法
     * @param autoCache 自动缓存注解，包含缓存配置信息
     * @param cacheKey  缓存键，用于唯一标识缓存数据
     * @return java.lang.Object  原方法的执行结果
     */
    private Object handleWithoutLock(ProceedingJoinPoint joinPoint, AutoCache autoCache,
                                     String cacheKey) throws Throwable {
        return executeAndCache(joinPoint, autoCache, cacheKey);
    }

    /**
     * 未命中缓存，执行后续方法并缓存结果
     *
     * @param joinPoint 切入点，用于执行原方法
     * @param autoCache 自动缓存注解，包含缓存配置信息
     * @param cacheKey  缓存键，用于唯一标识缓存数据
     * @return java.lang.Object  原方法的执行结果
     **/
    private Object executeAndCache(ProceedingJoinPoint joinPoint, AutoCache autoCache,
                                   String cacheKey) throws Throwable {
        try {
            // 执行原方法
            Object result = joinPoint.proceed();

            if (result != null) {
                // 缓存非空结果
                cacheUtils.setCache(
                        cacheKey,
                        result,
                        autoCache.expireTime(),
                        autoCache.enableRandomExpire(),
                        autoCache.randomExpireRange()
                );
                log.info("缓存设置成功，缓存键: {}", cacheKey);
            } else if (autoCache.enableNullCache()) {
                // 缓存空结果（防止缓存穿透）
                cacheUtils.setNullCache(cacheKey, autoCache.nullCacheTime());
                log.info("设置空值缓存，缓存键: {}", cacheKey);
            }

            return result;
        } catch (Exception e) {
            log.error("执行方法失败，方法: {}, 缓存键: {}", joinPoint.getSignature().getName(), cacheKey, e);
            throw e;
        }
    }
}