package com.rich.richInterview.blacklistFiltering;

import cn.hutool.bloomfilter.BitMapBloomFilter;
import cn.hutool.core.collection.CollectionUtil;
import cn.hutool.core.util.StrUtil;
import lombok.extern.slf4j.Slf4j;
import org.yaml.snakeyaml.Yaml;

import java.util.List;
import java.util.Map;

/**
 * IP 黑名单操作逻辑的组件，封装了创建、重构、判断 等方法
 *
 * @author DuRuiChi
 * @create 2025/5/29
 **/
@Slf4j
public class BlacklistFilteringUtils {
    // 使用 Hutool 包自带的 bloom filter 布隆过滤器
    private static BitMapBloomFilter bloomFilter;

    /**
     * 判断 ip 是否在黑名单内
     *
     * @param ip
     * @return boolean
     * @author DuRuiChi
     * @create 2025/5/29
     **/
    public static boolean isBlackIp(String ip) {
        // 布隆过滤器判断 ip 是否在黑名单，实现高效查询（有哈希冲突导致误封误放风险）
        return bloomFilter.contains(ip);
    }

    /**
     * 当移除黑名单等场景时，因为布隆过滤器的特性，故需要重构 ip 黑名单
     *
     * @param configInfo
     * @return void
     * @author DuRuiChi
     * @create 2025/5/29
     **/
    public static void rebuildBlackIpList(String configInfo) {
        // 如果配置信息为空，默认使用空对象
        if (StrUtil.isBlank(configInfo)) {
            configInfo = "{}";
        }
        // 约定 nacos 控制台使用 yaml 格式进行配置
        Yaml yaml = new Yaml();
        // 此处解析 nacos 控制台发来的 yaml 配置为 Map 对象
        Map map = yaml.loadAs(configInfo, Map.class);
        // 约定 nacos 控制台配置文件内黑名单对象名称为 blackIpList
        List<String> blackIpList = (List<String>) map.get("blackIpList");
        // 使用布隆过滤器重构 ip 黑名单，加锁防止并发
        synchronized (BlacklistFilteringUtils.class) {
            if (CollectionUtil.isNotEmpty(blackIpList)) {
                // TODO 过高的对象可能会导致内存溢出，过低会导致哈希冲突误判，需要综合调整
                BitMapBloomFilter bitMapBloomFilter = new BitMapBloomFilter(1000);
                for (String ip : blackIpList) {
                    bitMapBloomFilter.add(ip);
                }
                bloomFilter = bitMapBloomFilter;
            } else {
                // 如果黑名单为空，默认使用 100 个空对象，从而防止空指针异常
                bloomFilter = new BitMapBloomFilter(100);
            }
        }
    }
}
