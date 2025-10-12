package com.rich.richInterview.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * 缓存管理器
 * 提供缓存的管理功能，如清理特定前缀的缓存
 * 
 * @author DuRuiChi
 * @create 2025/1/12
 */
@Component
@Slf4j
public class CacheManager {
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    /**
     * 清理指定前缀的所有缓存
     * 
     * @param keyPrefix 缓存键前缀
     * @return 清理的缓存数量
     */
    public long clearCacheByPrefix(String keyPrefix) {
        try {
            String pattern = keyPrefix + "*";
            Set<String> keys = redisTemplate.keys(pattern);
            
            if (keys != null && !keys.isEmpty()) {
                Long deletedCount = redisTemplate.delete(keys);
                log.info("清理缓存完成，前缀: {}, 清理数量: {}", keyPrefix, deletedCount);
                return deletedCount != null ? deletedCount : 0;
            } else {
                log.info("未找到匹配的缓存，前缀: {}", keyPrefix);
                return 0;
            }
        } catch (Exception e) {
            log.error("清理缓存失败，前缀: {}", keyPrefix, e);
            return 0;
        }
    }
    
    /**
     * 清理题目相关的所有缓存
     * 
     * @param questionId 题目ID
     * @return 清理的缓存数量
     */
    public long clearQuestionCache(Long questionId) {
        long totalCleared = 0;
        
        // 清理题目详情缓存
        totalCleared += clearCacheByPrefix("question_vo:getQuestionVOById:" + questionId);
        
        // 清理题目热点缓存
        totalCleared += clearCacheByPrefix("question_hotspot_vo:getQuestionHotspotVOByQuestionId:" + questionId);
        
        // 清理分页缓存（这个比较复杂，因为参数组合很多，建议清理整个前缀）
        totalCleared += clearCacheByPrefix("question_hotspot_page:");
        
        log.info("清理题目相关缓存完成，题目ID: {}, 总清理数量: {}", questionId, totalCleared);
        return totalCleared;
    }
    
    /**
     * 清理所有缓存
     * 
     * @return 清理的缓存数量
     */
    public long clearAllCache() {
        long totalCleared = 0;
        
        totalCleared += clearCacheByPrefix("question_vo:");
        totalCleared += clearCacheByPrefix("question_hotspot_vo:");
        totalCleared += clearCacheByPrefix("question_hotspot_page:");
        
        log.info("清理所有缓存完成，总清理数量: {}", totalCleared);
        return totalCleared;
    }
    
    /**
     * 获取缓存统计信息
     * 
     * @return 缓存统计信息
     */
    public String getCacheStats() {
        try {
            long questionVoCount = getCacheCount("question_vo:*");
            long questionHotspotVoCount = getCacheCount("question_hotspot_vo:*");
            long questionHotspotPageCount = getCacheCount("question_hotspot_page:*");
            
            return String.format(
                "缓存统计 - 题目详情: %d, 题目热点: %d, 热点分页: %d, 总计: %d",
                questionVoCount,
                questionHotspotVoCount,
                questionHotspotPageCount,
                questionVoCount + questionHotspotVoCount + questionHotspotPageCount
            );
        } catch (Exception e) {
            log.error("获取缓存统计信息失败", e);
            return "获取缓存统计信息失败: " + e.getMessage();
        }
    }
    
    /**
     * 获取指定模式的缓存数量
     * 
     * @param pattern 缓存键模式
     * @return 缓存数量
     */
    private long getCacheCount(String pattern) {
        Set<String> keys = redisTemplate.keys(pattern);
        return keys != null ? keys.size() : 0;
    }
}