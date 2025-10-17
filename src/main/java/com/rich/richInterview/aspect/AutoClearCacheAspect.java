package com.rich.richInterview.aspect;

import com.rich.richInterview.annotation.AutoClearCache;
import com.rich.richInterview.utils.CacheUtils;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * 自动清除缓存切面
 * 处理 @AutoClearCache 注解的方法，实现自动清除指定前缀的缓存功能
 *
 * @author DuRuiChi
 * @create 2025/10/17
 */
@Aspect
@Component
@Slf4j
public class AutoClearCacheAspect {

    @Autowired
    private CacheUtils cacheUtils;

    /**
     * 环绕通知，处理 @AutoClearCache 注解的方法
     *
     * @param joinPoint      切入点，用于执行原方法
     * @param autoClearCache 自动清除缓存注解，包含缓存清除配置信息
     * @return java.lang.Object  原方法的执行结果
     */
    @Around("@annotation(autoClearCache)")
    public Object around(ProceedingJoinPoint joinPoint, AutoClearCache autoClearCache) throws Throwable {
        String[] prefixes = autoClearCache.prefixes();
        boolean clearAfterSuccess = autoClearCache.clearAfterSuccess();

        log.info("开始处理缓存清除, 前缀: {}, 执行后清除: {}", String.join(",", prefixes), clearAfterSuccess);

        // 如果配置为方法执行前清除缓存
        if (!clearAfterSuccess) {
            clearCacheByPrefixes(prefixes);
        }

        try {
            // 执行原方法
            Object result = joinPoint.proceed();

            // 如果配置为方法执行成功后清除缓存（默认）
            if (clearAfterSuccess) {
                clearCacheByPrefixes(prefixes);
            }

            return result;
        } catch (Exception e) {
            // 如果方法执行失败且配置为执行后清除，则不清除缓存
            log.error("清除缓存失败, 前缀: {}", String.join(",", prefixes), e);
            throw e;
        }
    }

    /**
     * 根据前缀清除缓存
     *
     * @param prefixes 缓存前缀数组
     */
    private void clearCacheByPrefixes(String[] prefixes) {
        try {
            cacheUtils.deleteCacheByPrefixes(prefixes);
        } catch (Exception e) {
            // 缓存清除失败不影响业务逻辑，只记录日志
            log.error("清除缓存失败, 前缀: {}", String.join(",", prefixes), e);
        }
    }
}