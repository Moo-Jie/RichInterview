package com.rich.richInterview.utils;

import cn.dev33.satoken.stp.StpUtil;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.exception.BusinessException;
import com.rich.richInterview.service.managerService.CounterManager;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.concurrent.TimeUnit;

/**
 * 基于计数器记录访问次数实现反爬虫的工具包
 *
 * @author DuRuiChi
 * @return
 * @create 2025/6/6
 **/
@Slf4j
@Service
public class DetectCrawlersUtils {
    @Resource
    private CounterManager counterManager;
    @Resource
    private UserService userService;

    /**
     * 检测爬虫    基于计数器记录访问次数实现反爬虫的工具包
     *
     * @param loginUserId 登录用户ID
     * @return void
     * @author DuRuiChi
     * @create 2025/6/6
     **/
    public void detectCrawler(long loginUserId) {
        // 触发警告的次数阈值
        final int WARN_COUNT = 30;
        // 触发封禁前警告的次数阈值
        final int BAN_WARN_OUNT = 50;
        // 触发封禁的次数阈值
        final int BAN_COUNT = 60;
        // 拼接 Redis key
        String key = String.format("user:access:%s", loginUserId);
        // 统计一分钟的窗口时间内访问次数
        // TODO 参数根据实际服务器负载调整
        long count = counterManager.incrAndGetCount(key, 1, TimeUnit.MINUTES);
        // 检测是否达到阈值
        // Ban
        if (count > BAN_COUNT) {
            // 使用 Sa-Token 包的 kickout 进行账户封禁
            StpUtil.kickout(loginUserId);
            // 修改用户状态
            User updateUser = new User();
            updateUser.setId(loginUserId);
            updateUser.setUserRole("ban");
            userService.updateById(updateUser);
            // 封号异常
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR, "访问太频繁，您已被封号--"+count);
        }
        // Warn
        else if (count == WARN_COUNT) {
            // 403 警告
            throw new BusinessException(403, "您的访问太过频繁，请稍后再试--"+count);
        }
        // BAN 前 WARN
        else if (count == BAN_WARN_OUNT) {
            // 403 警告
            throw new BusinessException(403, "您的访问过于频繁，若恶意攻击本服务器，将进行封号处理！--"+count);
        }
    }
}
