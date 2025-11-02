package com.rich.richInterview.utils;

import com.rich.richInterview.model.ThrowingSupplier;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.function.Supplier;

/**
 * 分布式锁 + 双重检查缓存 执行器
 * 将通用的按缓存键加锁、查询、写缓存的逻辑抽取为工具类
 *
 * @author DuRuiChi
 * @create 2025/10/18
 */
@Component
@Slf4j
public class CacheLockExecutor {

    /**
     * 缓存过期时间（秒），默认15分钟
     */
    private static final long EXPIRE_TIME = 900;

    /**
     * 是否启用缓存穿透保护（空值缓存）
     */
    private static final boolean ENABLE_NULL_CACHE = true;

    /**
     * 空值缓存时间（秒），默认5分钟
     */
    private static final long NULL_CACHE_TIME = 300L;

    /**
     * 是否启用随机过期时间，防止缓存雪崩
     */
    private static final boolean ENABLE_RANDOM_EXPIRE = true;

    /**
     * 随机过期时间范围（秒），在expireTime基础上随机增加0到该值的时间，防止缓存雪崩
     */
    private static final long RANDOM_EXPIRE_RANGE = 300;

    /**
     * 分布式锁等待时间（秒）
     */
    private static final long LOCK_WAIT_TIME = 10;

    /**
     * 分布式锁租期时间（秒）
     */
    private static final long LOCK_LEASE_TIME = 30;

    @Autowired
    private CacheUtils cacheUtils;

    /**
     * 执行带分布式锁和双重检查缓存的查询，并将结果写入缓存(默认参数)
     *
     * @param cacheKey 缓存键
     * @param clazz    反序列化的类型
     * @param action   使用可抛异常的执行逻辑
     * @param <T>      返回类型
     * @return 查询或缓存的结果
     * @throws Exception 执行逻辑抛出的异常
     */
    public <T> T executeWithCache(String cacheKey, Class<T> clazz, ThrowingSupplier<T> action) throws Exception {
        return executeWithCache(
                cacheKey,
                clazz,
                action,
                EXPIRE_TIME,
                ENABLE_NULL_CACHE,
                NULL_CACHE_TIME,
                ENABLE_RANDOM_EXPIRE,
                RANDOM_EXPIRE_RANGE,
                LOCK_WAIT_TIME,
                LOCK_LEASE_TIME
        );
    }

    /**
     * 使用可抛异常的执行逻辑（lambda/匿名内部类），支持自定义参数
     *
     * @param cacheKey           缓存键
     * @param clazz              反序列化的类型
     * @param action             计算结果的执行逻辑（可抛异常）
     * @param expireTime         缓存过期时间（秒）
     * @param enableNullCache    是否启用空值缓存以防穿透
     * @param nullCacheTime      空值缓存时间（秒）
     * @param enableRandomExpire 是否启用随机过期
     * @param randomExpireRange  随机过期范围（秒）
     * @param lockWaitTime       分布式锁等待时间（秒）
     * @param lockLeaseTime      分布式锁租期时间（秒）
     * @param <T>                返回类型
     * @return 查询或缓存的结果
     * @throws Exception 执行逻辑抛出的异常
     */
    public <T> T executeWithCache(
            String cacheKey,
            Class<T> clazz,
            ThrowingSupplier<T> action,
            long expireTime,
            boolean enableNullCache,
            long nullCacheTime,
            boolean enableRandomExpire,
            long randomExpireRange,
            long lockWaitTime,
            long lockLeaseTime
    ) throws Exception {
        // 1. 先读缓存（第一次检查）
        T cached = cacheUtils.getCache(cacheKey, clazz);
        if (cached != null) {
            return cached;
        }

        String lockKey = cacheUtils.generateLockKey(cacheKey);
        RLock lock = null;
        try {
            // 2. 尝试获取锁
            lock = cacheUtils.getLock(lockKey, lockWaitTime, lockLeaseTime);

            if (lock != null) {
                // 3. 加锁成功后再次读缓存（第二次检查）
                cached = cacheUtils.getCache(cacheKey, clazz);
                if (cached != null) {
                    log.info("缓存命中，缓存键: {}", cacheKey);
                    return cached;
                }

                // 4. 缓存未命中，执行外部传入逻辑
                log.info("缓存设置成功，缓存键: {}", cacheKey);
                T result = action.get();

                // 5. 写入缓存或写入空值缓存
                writeCache(cacheKey, result, expireTime, enableNullCache, nullCacheTime, enableRandomExpire, randomExpireRange);
                return result;
            } else {
                // 获取锁失败，直接执行逻辑并回填缓存（降级处理）
                T result = action.get();
                writeCache(cacheKey, result, expireTime, enableNullCache, nullCacheTime, enableRandomExpire, randomExpireRange);
                return result;
            }
        } finally {
            cacheUtils.releaseLock(lock);
        }
    }

    /**
     * 写入缓存或空值缓存（预防缓存穿透）
     *
     * @param cacheKey          缓存键
     * @param result            查询结果
     * @param expireTime        缓存过期时间（秒）
     * @param enableNullCache   是否启用空值缓存以防穿透
     * @param nullCacheTime     空值缓存时间（秒）
     * @param randomExpireRange 随机过期范围（秒）
     * @param <T>               返回类型
     */
    private <T> void writeCache(String cacheKey,
                                T result,
                                long expireTime,
                                boolean enableNullCache,
                                long nullCacheTime,
                                boolean enableRandomExpire,
                                long randomExpireRange) {
        // null 或空集合时，写空值缓存以防穿透
        boolean isEmptyCollection = (result instanceof Collection) && ((Collection<?>) result).isEmpty();
        if (result == null || isEmptyCollection) {
            if (enableNullCache) {
                cacheUtils.setNullCache(cacheKey, nullCacheTime);
            } else {
                log.info("结果为空且未开启空值缓存，不写入缓存，key: {}", cacheKey);
            }
            return;
        }

        // 正常写入缓存（带随机过期）
        cacheUtils.setCache(cacheKey, result, expireTime, enableRandomExpire, randomExpireRange);
    }
}