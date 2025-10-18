package com.rich.richInterview.job.cycle;

import cn.hutool.core.collection.CollUtil;
import com.rich.richInterview.model.entity.QuestionHotspot;
import com.rich.richInterview.model.enums.IncrementFieldEnum;
import com.rich.richInterview.service.QuestionHotspotService;
import com.rich.richInterview.utils.CacheUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * 定时同步热点缓存数据到数据库
 * 每5分钟执行一次，将缓存中的热点数据同步到数据库
 * 
 * @author DuRuiChi
 * @create 2025/1/17
 */
@Component
@Slf4j
public class SyncHotspotCacheToDb {

    @Resource
    private RedisTemplate<String, Object> redisTemplate;

    @Resource
    private QuestionHotspotService questionHotspotService;

    @Resource
    private CacheUtils cacheUtils;

    /**
     * 热点缓存前缀
     */
    private static final String HOTSPOT_CACHE_PREFIX = "question_hotspot:";

    /**
     * 每5分钟执行一次同步任务
     */
    @Scheduled(fixedRate = 5 * 60 * 1000)
    public void syncHotspotCacheToDatabase() {
        log.info("开始执行热点缓存数据同步任务");
        
        try {
            // 获取所有热点缓存的key
            Set<String> cacheKeys = redisTemplate.keys(HOTSPOT_CACHE_PREFIX + "*");
            
            if (CollUtil.isEmpty(cacheKeys)) {
                log.info("没有找到需要同步的热点缓存数据");
                return;
            }

            log.info("找到 {} 个热点缓存key需要同步", cacheKeys.size());
            
            int successCount = 0;
            int failCount = 0;
            
            // 遍历所有缓存key进行同步
            for (String cacheKey : cacheKeys) {
                try {
                    if (syncSingleHotspotCache(cacheKey)) {
                        successCount++;
                    } else {
                        failCount++;
                    }
                } catch (Exception e) {
                    log.error("同步缓存key: {} 时发生异常", cacheKey, e);
                    failCount++;
                }
            }
            
            log.info("热点缓存数据同步完成，成功: {}, 失败: {}", successCount, failCount);
            
        } catch (Exception e) {
            log.error("执行热点缓存数据同步任务时发生异常", e);
        }
    }

    /**
     * 同步单个热点缓存数据到数据库
     * 
     * @param cacheKey 缓存key
     * @return 是否同步成功
     */
    private boolean syncSingleHotspotCache(String cacheKey) {
        try {
            // 解析缓存key获取questionId和字段名
            // 格式: question_hotspot:questionId:fieldName
            String[] keyParts = cacheKey.split(":");
            if (keyParts.length != 3) {
                log.warn("缓存key格式不正确: {}", cacheKey);
                return false;
            }
            
            Long questionId = Long.parseLong(keyParts[1]);
            String fieldName = keyParts[2];
            
            // 验证字段名是否合法
            try {
                IncrementFieldEnum.validateField(fieldName);
            } catch (Exception e) {
                log.warn("字段名不合法: {}", fieldName);
                return false;
            }
            
            // 获取缓存中的值
            Object cacheValue = cacheUtils.getCache(cacheKey,Integer.class);
            if (cacheValue == null) {
                log.debug("缓存key: {} 的值为空，跳过同步", cacheKey);
                return true;
            }
            
            Integer currentValue;
            try {
                currentValue = Integer.parseInt(cacheValue.toString());
            } catch (NumberFormatException e) {
                log.warn("缓存值格式不正确: {}, key: {}", cacheValue, cacheKey);
                return false;
            }
            
            // 获取数据库中的当前值
            QuestionHotspot dbHotspot = questionHotspotService.getByQuestionId(questionId);
            if (dbHotspot == null) {
                log.warn("数据库中不存在questionId: {} 的热点数据", questionId);
                return false;
            }
            
            // 获取数据库中对应字段的当前值
            Integer dbValue = getFieldValue(dbHotspot, fieldName);
            if (dbValue == null) {
                log.warn("无法获取数据库中字段 {} 的值", fieldName);
                return false;
            }
            
            // 如果缓存值大于数据库值，说明有新的增量需要同步
            if (currentValue > dbValue) {
                // 更新数据库中的值
                boolean updateResult = updateDatabaseField(questionId, fieldName, currentValue);
                if (updateResult) {
                    log.debug("成功同步缓存数据到数据库: questionId={}, field={}, value={}", 
                            questionId, fieldName, currentValue);
                    return true;
                } else {
                    log.warn("同步缓存数据到数据库失败: questionId={}, field={}, value={}", 
                            questionId, fieldName, currentValue);
                    return false;
                }
            } else {
                log.debug("缓存值({})不大于数据库值({})，无需同步: questionId={}, field={}", 
                        currentValue, dbValue, questionId, fieldName);
                return true;
            }
            
        } catch (Exception e) {
            log.error("同步单个热点缓存数据时发生异常: {}", cacheKey, e);
            return false;
        }
    }

    /**
     * 获取热点对象中指定字段的值
     * 
     * @param hotspot 热点对象
     * @param fieldName 字段名
     * @return 字段值
     */
    private Integer getFieldValue(QuestionHotspot hotspot, String fieldName) {
        switch (fieldName) {
            case "viewNum":
                return hotspot.getViewNum();
            case "starNum":
                return hotspot.getStarNum();
            case "forwardNum":
                return hotspot.getForwardNum();
            case "collectNum":
                return hotspot.getCollectNum();
            case "commentNum":
                return hotspot.getCommentNum();
            default:
                return null;
        }
    }

    /**
     * 更新数据库中指定字段的值
     * 
     * @param questionId 题目ID
     * @param fieldName 字段名
     * @param newValue 新值
     * @return 是否更新成功
     */
    private boolean updateDatabaseField(Long questionId, String fieldName, Integer newValue) {
        try {
            // 获取当前热点数据
            QuestionHotspot hotspot = questionHotspotService.getByQuestionId(questionId);
            if (hotspot == null) {
                return false;
            }
            
            // 设置新值
            switch (fieldName) {
                case "viewNum":
                    hotspot.setViewNum(newValue);
                    break;
                case "starNum":
                    hotspot.setStarNum(newValue);
                    break;
                case "forwardNum":
                    hotspot.setForwardNum(newValue);
                    break;
                case "collectNum":
                    hotspot.setCollectNum(newValue);
                    break;
                case "commentNum":
                    hotspot.setCommentNum(newValue);
                    break;
                default:
                    return false;
            }
            
            // 更新数据库
            return questionHotspotService.updateById(hotspot);
            
        } catch (Exception e) {
            log.error("更新数据库字段时发生异常: questionId={}, field={}, value={}", 
                    questionId, fieldName, newValue, e);
            return false;
        }
    }
}