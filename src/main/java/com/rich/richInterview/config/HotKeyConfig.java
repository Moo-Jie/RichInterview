package com.rich.richInterview.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;
// 不使用改热点探测服务注销即可
// import org.springframework.context.annotation.Bean;
// import com.jd.platform.hotkey.client.ClientStarter;

@Configuration
@ConfigurationProperties(prefix = "hotkey")
@Data
public class HotKeyConfig {

    /**
     * Etcd 服务器地址
     */
    private String etcdServer ;

    /**
     * 应用名称
     */
    private String appName ;

    /**
     * 本地缓存最大数量
     */
    private int caffeineSize ;

    /**
     * 批量推送 key 的间隔时间
     */
    private long pushPeriod;

    /**
     * 初始化 hotkey
     * （不使用改热点探测服务注销即可）
     */
//    @Bean
//    public void initHotkey() {
//        ClientStarter.Builder builder = new ClientStarter.Builder();
//        ClientStarter starter = builder.setAppName(appName)
//                .setCaffeineSize(caffeineSize)
//                .setPushPeriod(pushPeriod)
//                .setEtcdServer(etcdServer)
//                .build();
//        starter.startPipeline();
//    }
}
