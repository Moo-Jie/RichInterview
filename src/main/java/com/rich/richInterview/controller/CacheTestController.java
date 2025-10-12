package com.rich.richInterview.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.rich.richInterview.common.BaseResponse;
import com.rich.richInterview.constant.UserConstant;
import com.rich.richInterview.utils.CacheManager;
import com.rich.richInterview.utils.ResultUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

/**
 * 缓存测试控制器
 * 用于测试和管理缓存功能（仅管理员可用）
 *
 * @author DuRuiChi
 * @create 2025/1/12
 */
@RestController
@RequestMapping("/cache")
@Slf4j
@SaCheckRole(UserConstant.ADMIN_ROLE)
public class CacheTestController {

    @Autowired
    private CacheManager cacheManager;

    /**
     * 获取缓存统计信息
     *
     * @return 缓存统计信息
     */
    @GetMapping("/stats")
    public BaseResponse<String> getCacheStats() {
        String stats = cacheManager.getCacheStats();
        return ResultUtils.success(stats);
    }

    /**
     * 清理指定前缀的缓存
     *
     * @param prefix 缓存前缀
     * @return 清理的缓存数量
     */
    @DeleteMapping("/clear/prefix")
    public BaseResponse<Long> clearCacheByPrefix(@RequestParam String prefix) {
        long clearedCount = cacheManager.clearCacheByPrefix(prefix);
        return ResultUtils.success(clearedCount);
    }

    /**
     * 清理指定题目的相关缓存
     *
     * @param questionId 题目ID
     * @return 清理的缓存数量
     */
    @DeleteMapping("/clear/question")
    public BaseResponse<Long> clearQuestionCache(@RequestParam Long questionId) {
        long clearedCount = cacheManager.clearQuestionCache(questionId);
        return ResultUtils.success(clearedCount);
    }

    /**
     * 清理所有缓存
     *
     * @return 清理的缓存数量
     */
    @DeleteMapping("/clear/all")
    public BaseResponse<Long> clearAllCache() {
        long clearedCount = cacheManager.clearAllCache();
        return ResultUtils.success(clearedCount);
    }
}