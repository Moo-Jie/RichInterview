package com.rich.richInterview.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Random;
import java.util.concurrent.TimeUnit;

/**
 * 缓存工具类
 * 提供Redis缓存的基础操作，包含防护机制
 *
 * @author DuRuiChi
 * @create 2025/1/12
 */
@Component
@Slf4j
public class CacheUtils {

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Autowired
    private RedissonClient redissonClient;

    private final ObjectMapper objectMapper;
    private final Random random = new Random();

    // 空值标识
    private static final String NULL_VALUE = "NULL_CACHE_VALUE";

    public CacheUtils() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    /**
     * 设置缓存
     *
     * @param key                缓存键
     * @param value              缓存值
     * @param expireTime         过期时间（秒）
     * @param enableRandomExpire 是否启用随机过期时间
     * @param randomExpireRange  随机过期时间范围（秒）
     */
    public void setCache(String key, Object value, long expireTime, boolean enableRandomExpire, long randomExpireRange) {
        try {
            String jsonValue = objectMapper.writeValueAsString(value);

            // 计算实际过期时间
            long actualExpireTime = expireTime;
            if (enableRandomExpire && randomExpireRange > 0) {
                actualExpireTime += random.nextInt((int) randomExpireRange);
            }

            redisTemplate.opsForValue().set(key, jsonValue, actualExpireTime, TimeUnit.SECONDS);
            log.debug("设置缓存成功，key: {}, expireTime: {}秒", key, actualExpireTime);
        } catch (JsonProcessingException e) {
            log.error("缓存序列化失败，key: {}", key, e);
        }
    }

    /**
     * 设置空值缓存（防止缓存穿透）
     *
     * @param key           缓存键
     * @param nullCacheTime 空值缓存时间（秒）
     */
    public void setNullCache(String key, long nullCacheTime) {
        redisTemplate.opsForValue().set(key, NULL_VALUE, nullCacheTime, TimeUnit.SECONDS);
        log.debug("设置空值缓存，key: {}, expireTime: {}秒", key, nullCacheTime);
    }

    /**
     * 获取缓存
     *
     * @param key   缓存键
     * @param clazz 目标类型
     * @return 缓存值，如果不存在或是空值缓存则返回null
     */
    public <T> T getCache(String key, Class<T> clazz) {
        try {
            Object value = redisTemplate.opsForValue().get(key);
            if (value == null) {
                return null;
            }

            String jsonValue = value.toString();

            // 检查是否是空值缓存
            if (NULL_VALUE.equals(jsonValue)) {
                log.debug("命中空值缓存，key: {}", key);
                return null;
            }

            T result = objectMapper.readValue(jsonValue, clazz);
            log.debug("缓存命中，key: {}", key);
            return result;
        } catch (Exception e) {
            log.error("缓存反序列化失败，key: {}", key, e);
            // 删除损坏的缓存
            deleteCache(key);
            return null;
        }
    }

    /**
     * 删除缓存
     *
     * @param key 缓存键
     */
    public void deleteCache(String key) {
        redisTemplate.delete(key);
        log.debug("删除缓存，key: {}", key);
    }

    /**
     * 检查缓存是否存在
     *
     * @param key 缓存键
     * @return 是否存在
     */
    public boolean hasCache(String key) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }

    /**
     * 获取分布式锁
     *
     * @param lockKey   锁键
     * @param waitTime  等待时间（秒）
     * @param leaseTime 租期时间（秒）
     * @return 锁对象
     */
    public RLock getLock(String lockKey, long waitTime, long leaseTime) {
        RLock lock = redissonClient.getLock(lockKey);
        try {
            boolean acquired = lock.tryLock(waitTime, leaseTime, TimeUnit.SECONDS);
            if (acquired) {
                log.debug("获取分布式锁成功，lockKey: {}", lockKey);
                return lock;
            } else {
                log.debug("获取分布式锁失败，lockKey: {}", lockKey);
                return null;
            }
        } catch (InterruptedException e) {
            log.error("获取分布式锁被中断，lockKey: {}", lockKey, e);
            Thread.currentThread().interrupt();
            return null;
        }
    }

    /**
     * 释放分布式锁
     *
     * @param lock 锁对象
     */
    public void releaseLock(RLock lock) {
        if (lock != null && lock.isHeldByCurrentThread()) {
            lock.unlock();
            log.debug("释放分布式锁成功");
        }
    }

    /**
     * 生成缓存键
     *
     * @param prefix     前缀
     * @param methodName 方法名
     * @param args       参数
     * @return 缓存键
     */
    public String generateCacheKey(String prefix, String methodName, Object[] args) {
        StringBuilder keyBuilder = new StringBuilder();

        // 添加前缀
        if (prefix != null && !prefix.trim().isEmpty()) {
            keyBuilder.append(prefix).append(":");
        }

        // 添加方法名
        keyBuilder.append(methodName);

        // 添加参数
        if (args != null && args.length > 0) {
            keyBuilder.append(":");
            for (int i = 0; i < args.length; i++) {
                if (i > 0) {
                    keyBuilder.append("_");
                }
                if (args[i] != null) {
                    keyBuilder.append(args[i].toString());
                } else {
                    keyBuilder.append("null");
                }
            }
        }

        return keyBuilder.toString();
    }

    /**
     * 生成锁键
     *
     * @param cacheKey 缓存键
     * @return 锁键
     */
    public String generateLockKey(String cacheKey) {
        return "lock:" + cacheKey;
    }
}