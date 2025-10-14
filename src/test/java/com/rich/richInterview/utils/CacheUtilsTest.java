package com.rich.richInterview.utils;

import com.rich.richInterview.model.dto.question.QuestionQueryRequest;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpServletRequest;

import javax.servlet.http.HttpServletRequest;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

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
        
        // 验证缓存键的格式（修正期望值）
        String expectedKey = "question_hotspot_vo:1970327273628135425";
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
        
        // 验证缓存键的格式（修正期望值）
        String expectedKey = "question_hotspot_vo:1970327273628135425";
        assertEquals(expectedKey, key);
        
        System.out.println("生成的缓存键: " + key);
        System.out.println("无HttpServletRequest参数测试通过！");
    }

    @Test
    public void testGenerateCacheKeyWithPageRequest() {
        CacheUtils cacheUtils = new CacheUtils();
        
        // 创建两个不同分页参数的 QuestionQueryRequest
        QuestionQueryRequest request1 = new QuestionQueryRequest();
        request1.setCurrent(1);
        request1.setPageSize(10);
        request1.setTitle("Java");
        request1.setTags(Arrays.asList("编程", "后端"));
        
        QuestionQueryRequest request2 = new QuestionQueryRequest();
        request2.setCurrent(2);  // 不同的页码
        request2.setPageSize(10);
        request2.setTitle("Java");
        request2.setTags(Arrays.asList("编程", "后端"));
        
        QuestionQueryRequest request3 = new QuestionQueryRequest();
        request3.setCurrent(1);
        request3.setPageSize(20);  // 不同的页面大小
        request3.setTitle("Java");
        request3.setTags(Arrays.asList("编程", "后端"));
        
        // 生成缓存键
        String key1 = cacheUtils.generateCacheKey("question_list", new Object[]{request1});
        String key2 = cacheUtils.generateCacheKey("question_list", new Object[]{request2});
        String key3 = cacheUtils.generateCacheKey("question_list", new Object[]{request3});
        
        // 验证不同分页参数生成的缓存键应该不同
        assertNotEquals(key1, key2, "不同页码应该生成不同的缓存键");
        assertNotEquals(key1, key3, "不同页面大小应该生成不同的缓存键");
        assertNotEquals(key2, key3, "不同分页参数应该生成不同的缓存键");
        
        // 验证缓存键包含分页信息
        assertTrue(key1.contains("\"current\":1"), "缓存键应该包含页码信息");
        assertTrue(key1.contains("\"pageSize\":10"), "缓存键应该包含页面大小信息");
        assertTrue(key2.contains("\"current\":2"), "缓存键应该包含不同的页码信息");
        assertTrue(key3.contains("\"pageSize\":20"), "缓存键应该包含不同的页面大小信息");
        
        System.out.println("分页参数缓存键1: " + key1);
        System.out.println("分页参数缓存键2: " + key2);
        System.out.println("分页参数缓存键3: " + key3);
        System.out.println("分页参数缓存键测试通过！");
    }

    @Test
    public void testGenerateCacheKeyWithSamePageRequest() {
        CacheUtils cacheUtils = new CacheUtils();
        
        // 创建两个相同参数的 QuestionQueryRequest
        QuestionQueryRequest request1 = new QuestionQueryRequest();
        request1.setCurrent(1);
        request1.setPageSize(10);
        request1.setTitle("Java");
        request1.setTags(Arrays.asList("编程", "后端"));
        
        QuestionQueryRequest request2 = new QuestionQueryRequest();
        request2.setCurrent(1);
        request2.setPageSize(10);
        request2.setTitle("Java");
        request2.setTags(Arrays.asList("编程", "后端"));
        
        // 生成缓存键
        String key1 = cacheUtils.generateCacheKey("question_list", new Object[]{request1});
        String key2 = cacheUtils.generateCacheKey("question_list", new Object[]{request2});
        
        // 验证相同参数生成的缓存键应该相同
        assertEquals(key1, key2, "相同参数应该生成相同的缓存键");
        
        System.out.println("相同参数缓存键1: " + key1);
        System.out.println("相同参数缓存键2: " + key2);
        System.out.println("相同参数缓存键测试通过！");
    }
}