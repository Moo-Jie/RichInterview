package com.rich.richInterview.manager;

import cn.hutool.core.util.StrUtil;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RScript;
import org.redisson.api.RedissonClient;
import org.redisson.client.codec.IntegerCodec;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.time.Instant;
import java.util.Collections;
import java.util.concurrent.TimeUnit;

/**
 * 基于 Redis 的计数器管理器
 * @return
 * @author DuRuiChi
 * @create 2025/6/6
 **/
@Slf4j
@Service
public class CounterManager {

    // 注入 RedissonClient 客户端对象，执行 Lua 脚本
    @Resource
    private RedissonClient redissonClient;

    /**
     * 对Redis key 进行自增，并返回计数
     * 如果key不存在，则不进行任何操作，返回-1表示key不存在
     *
     * @param key          键名
     * @return long 自增后的值，如果key不存在返回-1
     * @author DuRuiChi
     * @create 2025/6/6
     */
    public long incrCount(String key) {
        // 使用 Lua 脚本实现计数操作的原子性，避免高并发下的线程安全问题
        // Lua 脚本用法：https://www.cnblogs.com/PatrickLiu/p/8656675.html
        // 只有key存在时才进行自增，不存在时返回-1
        String luaScriptStr =
                // redis.call() 调用 Redis 命令
                // KEYS[1] 取执行 Lua 脚本时第一个键参数
                // exists() 判断键名是否存在
                "if redis.call('exists', KEYS[1]) == 1 then " +
                        // 检查值的类型，确保可以进行数值操作
                        "  local value = redis.call('get', KEYS[1]); " +
                        "  local num = tonumber(value); " +
                        "  if num then " +
                        // 如果是数值，直接使用 incr 命令
                        "    return redis.call('incr', KEYS[1]); " +
                        "  else " +
                        // 如果不是数值（如JSON字符串），先设置为数值再自增
                        "    redis.call('set', KEYS[1], 1); " +
                        "    return 1; " +
                        "  end; " +
                        "else " +
                        // key不存在时返回-1，不进行任何操作
                        "  return -1; " +
                        "end";

        // 初始化脚本对象，指定返回值类型为 IntegerCodec
        // redissonClient 为 Redisson 客户端对象
        // 调用 getScript(IntegerCodec.INSTANCE) 创建脚本执行对象，指定 IntegerCodec 键值按整数编解码
        RScript script = redissonClient.getScript(IntegerCodec.INSTANCE);
        // eval() 执行 Lua 脚本并返回结果
        Object countNum = script.eval(
                // 声明脚本模式为 读写模式
                RScript.Mode.READ_WRITE,
                // Lua 脚本字符串
                luaScriptStr,
                // 指定返回值类型为整数
                RScript.ReturnType.INTEGER,
                // 指定 Lua 脚本键参数，只传入 KEYS[1] ，即 Redis 键名
                Collections.singletonList(key));
        
        long result = (long) countNum;
        
        // 如果key不存在，记录日志
        if (result == -1) {
            log.warn("执行自增的key不存在: {}", key);
        }
        
        return result;
    }

    /**
     * 初始化计数器，并指定自定义初始值
     * 
     * @param key 键名
     * @param initialValue 初始值
     * @param expireTime 过期时间（秒）
     * @return boolean 是否设置成功
     */
    public boolean initCounter(String key, int initialValue, long expireTime) {
        try {
            // 使用 Lua 脚本确保原子性操作
            String luaScriptStr = 
                    "redis.call('set', KEYS[1], ARGV[1]); " +
                    "if ARGV[2] and tonumber(ARGV[2]) > 0 then " +
                    "  redis.call('expire', KEYS[1], ARGV[2]); " +
                    "end; " +
                    "return 1;";
            
            RScript script = redissonClient.getScript(IntegerCodec.INSTANCE);
            Object result = script.eval(
                    RScript.Mode.READ_WRITE,
                    luaScriptStr,
                    RScript.ReturnType.INTEGER,
                    Collections.singletonList(key),
                    initialValue,
                    expireTime > 0 ? expireTime : null
            );
            
            log.debug("初始化计数器成功，key: {}, initialValue: {}, expireTime: {}", key, initialValue, expireTime);
            return result != null && (long) result == 1;
        } catch (Exception e) {
            log.error("初始化计数器失败，key: {}, initialValue: {}", key, initialValue, e);
            return false;
        }
    }

    /**
     * 初始化计数器，并指定初始值为 0，带过期时间窗口
     *
     * @param key          键名
     * @param timeInterval 时间间隔
     * @param timeUnit     时间间隔单位
     * @return long
     * @author DuRuiChi
     * @create 2025/6/6
     */
    public long incrAndGetCount(String key, int timeInterval, TimeUnit timeUnit) {
        // 1. 计算过期时间的秒数
        // 将 timeInterval 按照 timeUnit 转换为秒数
        int expirationSeconds = switch (timeUnit) {
            case SECONDS -> timeInterval;
            case MINUTES -> timeInterval * 60;
            case HOURS -> timeInterval * 60 * 60;
            default -> throw new IllegalArgumentException("不支持的时间单位。请使用秒、分钟、小时。");
        };
        if (StrUtil.isBlank(key)) {
            return 0;
        }
        // 2.按照时间间隔计算时间因子，用于区分不同的时间窗口,从而方便键的命名时间戳
        long timeFactor = switch (timeUnit) {
            // Instant.now() 获取当前时间的 Instant 对象
            // getEpochSecond() 获取当前时间的秒数
            // 除以 timeInterval 得到时间因子
            case SECONDS -> Instant.now().getEpochSecond() / timeInterval;
            case MINUTES -> Instant.now().getEpochSecond() / timeInterval / 60;
            case HOURS -> Instant.now().getEpochSecond() / timeInterval / 3600;
            default -> throw new IllegalArgumentException("不支持的时间单位。请使用秒、分钟、小时。");
        };
        // 键名 + 时间因子 构建 Redis 键名
        // 含义为：ID为键名的计数器，在当前时间窗口内进行计数
        String redisKey = key + ":" + timeFactor;

        // 3.使用 Lua 脚本实现计数操作的原子性，避免高并发下的线程安全问题
        // Lua 脚本用法：https://www.cnblogs.com/PatrickLiu/p/8656675.html
        // （incr() 和 expire() 都是单线程独立操作，并发时同时容易同时判断 key 不存在，导致重复执行 set）
        String luaScriptStr =
                // redis.call() 调用 Redis 命令
                // KEYS[1]、ARGV[1] 取执行 Lua 脚本时第一个参数
                // exists() 判断键名是否存在
                "if redis.call('exists', KEYS[1]) == 1 then " +
                        // incr() 进行自增
                        "  return redis.call('incr', KEYS[1]); " + "else " +
                        // set() 初始值为 1
                        "  redis.call('set', KEYS[1], 1); " +
                        // expire() 设置过期时间
                        "  redis.call('expire', KEYS[1], ARGV[1]); " + "  return 1; " + "end";

        // 初始化脚本对象，指定返回值类型为 IntegerCodec
        // redissonClient 为 Redisson 客户端对象
        // 调用 getScript(IntegerCodec.INSTANCE) 创建脚本执行对象，指定 IntegerCodec 键值按整数编解码
        RScript script = redissonClient.getScript(IntegerCodec.INSTANCE);
        // eval() 执行 Lua 脚本并返回结果
        Object countNum = script.eval(
                // 声明脚本模式为 读写模式
                RScript.Mode.READ_WRITE,
                // Lua 脚本字符串
                luaScriptStr,
                // 指定返回值类型为整数
                RScript.ReturnType.INTEGER,
                // 指定 Lua 脚本键参数，只传入 KEYS[1] ，即 Redis 键名
                Collections.singletonList(redisKey),
                // 指定 Lua 脚本值参数，只传入 ARGV[1] ，即过期时间
                expirationSeconds);
        return (long) countNum;
    }
}














