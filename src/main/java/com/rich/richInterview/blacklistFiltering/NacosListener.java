package com.rich.richInterview.blacklistFiltering;

import com.alibaba.nacos.api.annotation.NacosInjected;
import com.alibaba.nacos.api.config.ConfigService;
import com.alibaba.nacos.api.config.listener.Listener;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.validation.constraints.NotNull;
import java.util.concurrent.Executor;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 自动  InitializingBean 的 Nacos 监听接口，用于监听 Nacos 配置的变化并维护 IP 黑名单
 *
 * @author DuRuiChi
 * @return
 * @create 2025/5/29
 **/
@Slf4j
@Component
public class NacosListener implements InitializingBean {
    // 注入 Nacos 封装好的配置服务，封装了一些常用的配置操作方法，如获取配置、监听配置等
    @NacosInjected
    private ConfigService configService;

    // 从配置文件中注入 Nacos 链接参数
    @Value("${nacos.config.data-id}")
    private String dataId;

    @Value("${nacos.config.group}")
    private String group;

    /**
     * Spring 容器注入完成后，自动开启监听
     *
     * @return void
     * @author DuRuiChi
     * @create 2025/5/29
     **/
    @Override
    public void afterPropertiesSet() throws Exception {
        log.info("启动 nacos 黑名单过滤监听服务");

        // 通过 configService ，传入配置信息与 Nacos 链接，并使用匿名内部类注册自定义监听器
        String config = configService.getConfigAndSignListener(dataId, group, 3000L, new Listener() {
            final ThreadFactory threadFactory = new ThreadFactory() {
                // 线程池序号生成器，用于线程命名
                private final AtomicInteger poolNumber = new AtomicInteger(1);

                @Override
                public Thread newThread(@NotNull Runnable r) {
                    Thread thread = new Thread(r);
                    // 命名规则：refresh-ThreadPool + 自增编号
                    thread.setName("refresh-ThreadPool" + poolNumber.getAndIncrement());
                    return thread;
                }
            };

            // 创建单个线程池，用于异步处理黑名单变化的逻辑
            final ExecutorService executorService = Executors.newFixedThreadPool(1, threadFactory);


            // receiveConfigInfo 和 getExecutor 是 Nacos 的 Listener 接口定义的抽象方法
            // 实现抽象方法：自动把创建好的线程池用于当前监听器
            @Override
            public Executor getExecutor() {
                return executorService;
            }

            // 实现抽象方法：监听后续黑名单变化，配置变更时触发
            @Override
            public void receiveConfigInfo(String configInfo) {
                log.info("监听到配置信息变化：{}", configInfo);
                // 根据配置信息内的 IP 直接重构黑名单，并不比遍历插入要慢，同时节省了系统资源
                BlacklistFilteringUtils.rebuildBlackIpList(configInfo);
            }
        });
        // 初始化黑名单（系统启动时执行）
        BlacklistFilteringUtils.rebuildBlackIpList(config);
    }
}
