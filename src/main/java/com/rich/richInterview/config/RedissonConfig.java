package com.rich.richInterview.config;

import lombok.Data;
import org.redisson.Redisson;
import org.redisson.api.RedissonClient;
import org.redisson.config.Config;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "spring.redis")
@Data
/**
 *
 * Redisson 配置类
 * @param null
 * @return
 * @author DuRuiChi
 * @create 2025/4/18
 **/
public class RedissonConfig {

    private String host;

    private Integer port;

    private Integer database;

    private String password;

    @Bean
    public RedissonClient redissonClient() {
        Config config = new Config();
        config.useSingleServer()
                .setAddress("redis://" + host + ":" + port)
                .setDatabase(database)
                .setPassword(password)
                // 连接池配置
                .setConnectionPoolSize(64)
                .setConnectionMinimumIdleSize(10)
                // 连接超时配置
                .setConnectTimeout(10000)
                .setTimeout(3000)
                // 重试配置
                .setRetryAttempts(3)
                .setRetryInterval(1500)
                // 心跳检测
                .setPingConnectionInterval(30000);
        return Redisson.create(config);
    }
}
