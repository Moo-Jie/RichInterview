package com.rich.richInterview.constant;

/**
 *
 * 由于刷题签到记录的 Redission 读写 Redis 使用的是相同的 key
 * 故此处用 1.常量 key  2.拼接 key 的方法
 * @param null
 * @return
 * @author DuRuiChi
 * @create 2025/4/18
 **/
public interface RedisConstant {

    /**
     * 用户签到记录的 Redis Key 前缀常量
     */
    String USER_SIGN_IN_REDIS_KEY_PREFIX = "user:signins";

    /**
     *
     * 抽取拼接用户签到记录的 Redis Key
     * @param year
     * @param userId
     * @return java.lang.String
     * @author DuRuiChi
     * @create 2025/4/18
     **/
    static String getUserSignInRedisKey(int year, long userId) {
        return String.format("%s:%s:%s", USER_SIGN_IN_REDIS_KEY_PREFIX, year, userId);
    }

}
