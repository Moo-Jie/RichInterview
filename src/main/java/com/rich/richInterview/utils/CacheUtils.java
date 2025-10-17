package com.rich.richInterview.utils;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.exception.ThrowUtils;
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
 * @create 2025/10/17
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
        // 注册 Java 8 时间模块
        this.objectMapper.registerModule(new JavaTimeModule());

        // 配置序列化特性
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        this.objectMapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

        // 配置反序列化特性 - 增强容错性
        this.objectMapper.disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES);
        this.objectMapper.disable(DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES);
        this.objectMapper.enable(DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT);
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
            log.info("设置缓存成功，key: {}, expireTime: {}秒", key, actualExpireTime);
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
        log.info("设置空值缓存，key: {}, expireTime: {}秒", key, nullCacheTime);
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
                return null;
            }

            T result = objectMapper.readValue(jsonValue, clazz);
            ThrowUtils.throwIf(result == null, ErrorCode.NOT_FOUND_ERROR, "缓存结果为空");
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
        log.info("删除缓存，key: {}", key);
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
                log.info("获取分布式锁成功，lockKey: {}", lockKey);
                return lock;
            } else {
                log.info("获取分布式锁失败，lockKey: {}", lockKey);
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
            log.info("释放分布式锁成功");
        }
    }

    /**
     * 生成缓存键
     *
     * @param prefix 前缀
     * @param args   参数
     * @return 缓存键
     */
    public String generateCacheKey(String prefix, Object[] args) {
        StringBuilder keyBuilder = new StringBuilder();

        // 添加前缀
        if (prefix != null && !prefix.trim().isEmpty()) {
            keyBuilder.append(prefix);
        }

        // 添加参数
        if (args != null && args.length > 0) {
            keyBuilder.append(":");
            boolean hasValidArgs = false;
            for (Object arg : args) {
                // 过滤掉 HttpServletRequest 类型的参数
                // TODO 其他过滤参数
                if (arg != null && arg.getClass().getName()
                        .contains("org.springframework.session.web.http.SessionRepositoryFilter$SessionRepositoryRequestWrapper")) {
                    continue;
                }

                if (hasValidArgs) {
                    keyBuilder.append("_");
                }

                if (arg != null) {
                    keyBuilder.append(generateObjectKey(arg));
                } else {
                    keyBuilder.append("null");
                }
                hasValidArgs = true;
            }
        }

        return keyBuilder.toString();
    }

    /**
     * 生成对象的缓存键表示
     * 对于复杂对象，使用 JSON 序列化来确保所有属性都被包含
     *
     * @param obj 对象
     * @return 对象的缓存键表示
     */
    private String generateObjectKey(Object obj) {
        if (obj == null) {
            return "null";
        }

        // 对于基本类型和字符串，直接使用 toString()
        if (obj instanceof String || obj instanceof Number || obj instanceof Boolean ||
                obj instanceof Character || obj.getClass().isPrimitive()) {
            return obj.toString();
        }

        // 对于复杂对象，使用 JSON 序列化来确保所有属性都被包含
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            log.warn("Failed to serialize object to JSON for cache key, falling back to toString(): {}", e.getMessage());
            return obj.toString();
        }
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

    /**
     * 根据前缀删除缓存
     * 删除所有匹配指定前缀的缓存键
     *
     * @param prefix 缓存键前缀
     * @return 删除的缓存数量
     */
    public long deleteCacheByPrefix(String prefix) {
        try {
            // 使用通配符模式匹配前缀
            String pattern = prefix + "*";
            
            // 获取所有匹配的键
            var keys = redisTemplate.keys(pattern);
            
            if (keys != null && !keys.isEmpty()) {
                // 批量删除
                Long deletedCount = redisTemplate.delete(keys);
                log.info("根据前缀删除缓存成功，前缀: {}, 删除数量: {}", prefix, deletedCount);
                return deletedCount != null ? deletedCount : 0;
            } else {
                log.info("根据前缀未找到匹配的缓存，前缀: {}", prefix);
                return 0;
            }
        } catch (Exception e) {
            log.error("根据前缀删除缓存失败，前缀: {}", prefix, e);
            return 0;
        }
    }

    /**
     * 根据多个前缀批量删除缓存
     *
     * @param prefixes 缓存键前缀数组
     * @return 总删除的缓存数量
     */
    public long deleteCacheByPrefixes(String[] prefixes) {
        if (prefixes == null || prefixes.length == 0) {
            log.warn("前缀数组为空，跳过缓存删除");
            return 0;
        }

        long totalDeleted = 0;
        for (String prefix : prefixes) {
            if (prefix != null && !prefix.trim().isEmpty()) {
                totalDeleted += deleteCacheByPrefix(prefix.trim());
            }
        }
        
        log.info("批量删除缓存完成，总删除数量: {}", totalDeleted);
        return totalDeleted;
    }
}