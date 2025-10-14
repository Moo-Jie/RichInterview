package com.rich.richInterview.utils;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;

import javax.servlet.http.HttpServletRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
public class CacheUtilsTest {

    @Test
    public void testGenerateCacheKeyWithHttpServletRequest() {
        CacheUtils cacheUtils = new CacheUtils();
        
        // 创建模拟的 HttpServletRequest 对象
        HttpServletRequest request1 = new MockHttpServletRequest();
        HttpServletRequest request2 = new MockHttpServletRequest();
        
        // 测试参数：包含 HttpServletRequest 和其他参数
        Object[] args1 = {1970327273628135425L, request1};
        Object[] args2 = {1970327273628135425L, request2};
        
        // 生成缓存键
        String key1 = cacheUtils.generateCacheKey("question_hotspot_vo", args1);
        String key2 = cacheUtils.generateCacheKey("question_hotspot_vo",args2);
        
        // 验证两个缓存键应该相同（HttpServletRequest 被过滤掉）
        assertEquals(key1, key2);
        
        // 验证缓存键的格式
        String expectedKey = "question_hotspot_vo:getQuestionHotspotVOByQuestionId:1970327273628135425";
        assertEquals(expectedKey, key1);
        assertEquals(expectedKey, key2);
        
        System.out.println("生成的缓存键1: " + key1);
        System.out.println("生成的缓存键2: " + key2);
        System.out.println("缓存键一致性测试通过！");
    }
    
    @Test
    public void testGenerateCacheKeyWithoutHttpServletRequest() {
        CacheUtils cacheUtils = new CacheUtils();
        
        // 测试参数：不包含 HttpServletRequest
        Object[] args = {1970327273628135425L};
        
        // 生成缓存键
        String key = cacheUtils.generateCacheKey("question_hotspot_vo", args);
        
        // 验证缓存键的格式
        String expectedKey = "question_hotspot_vo:getQuestionHotspotVOByQuestionId:1970327273628135425";
        assertEquals(expectedKey, key);
        
        System.out.println("生成的缓存键: " + key);
        System.out.println("无HttpServletRequest参数测试通过！");
    }
}