package com.rich.richInterview.service.impl;

import com.rich.richInterview.constant.RedisConstant;
import com.rich.richInterview.service.UserService;
import org.junit.jupiter.api.Test;
import org.redisson.api.RBitSet;
import org.redisson.api.RedissonClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
class UserServiceImplTest {

    @Autowired
    private RedissonClient redissonClient;

    @Autowired
    private UserService userService;

    /**
     * 随机模拟指定用户在当年的签到天数，并校验读取结果。
     */
    @Test
    void simulateRandomSignIns() {
//         long userId = Long.parseLong("1916407199693844483");
        long userId = Long.parseLong("1970810399001309186");
        int signDays = Integer.parseInt("188");

        int currentYear = LocalDate.now().getYear();
        String key = RedisConstant.getUserSignInRedisKey(currentYear, userId);

        // 清空该用户当年的签到记录
        RBitSet bitSet = redissonClient.getBitSet(key);
        bitSet.delete();

        int yearLength = LocalDate.now().getDayOfYear();
        if (signDays > yearLength) {
            signDays = yearLength;
        }

        // 生成随机不重复的天数（1..yearLength）
        Set<Integer> randomDays = ThreadLocalRandom.current()
                .ints(1, yearLength + 1)
                .distinct()
                .limit(signDays)
                .boxed()
                .collect(Collectors.toSet());

        // 写入签到位图
        randomDays.forEach(d -> bitSet.set(d, true));

        // 验证读取的签到记录
        List<Integer> actualDays = userService.getUserSignInRecord(userId, currentYear);
        assertEquals(signDays, actualDays.size(), "签到天数不匹配");
        assertTrue(actualDays.containsAll(randomDays), "Redis记录与模拟的天数不一致");

        // 输出结果便于查看
        System.out.println("用户ID: " + userId);
        System.out.println("年份: " + currentYear);
        System.out.println("模拟签到天数: " + signDays);
        List<String> dates = randomDays.stream()
                .sorted()
                .map(d -> LocalDate.ofYearDay(currentYear, d).toString())
                .collect(Collectors.toList());
        System.out.println("随机签到日期: " + dates);
    }

    private long resolveUserId() {
        String idProp = System.getProperty("test.userId");
        if (idProp != null && !idProp.isBlank()) {
            return Long.parseLong(idProp.trim());
        }
        return 123L; // 默认用户ID，可按需修改
    }

    private int resolveSignDaysCount() {
        String dayProp = System.getProperty("test.days");
        if (dayProp != null && !dayProp.isBlank()) {
            return Integer.parseInt(dayProp.trim());
        }
        return 30; // 默认模拟签到天数，可按需修改
    }
}