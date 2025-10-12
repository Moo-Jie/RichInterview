package com.rich.richInterview.utils;

import com.alibaba.csp.sentinel.slots.block.degrade.DegradeRule;
import com.alibaba.csp.sentinel.slots.block.degrade.DegradeRuleManager;
import com.alibaba.csp.sentinel.slots.block.degrade.circuitbreaker.CircuitBreakerStrategy;
import com.alibaba.csp.sentinel.slots.block.flow.param.ParamFlowRule;
import com.alibaba.csp.sentinel.slots.block.flow.param.ParamFlowRuleManager;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rich.richInterview.common.BaseResponse;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.model.vo.QuestionBankHotspotVO;
import com.rich.richInterview.model.vo.QuestionBankVO;
import com.rich.richInterview.model.vo.QuestionHotspotVO;
import com.rich.richInterview.model.vo.QuestionVO;

import java.util.*;

/**
 * Sentinel 工具类，用于处理限流和熔断相关的通用逻辑
 */
public class SentinelUtils {

    /**
     * 初始化流控和熔断规则
     *
     * @param resourceName 资源名称
     */
    public static void initFlowAndDegradeRules(String resourceName) {
        // 限流规则
        // 单 IP 查看题目列表限流规则
        ParamFlowRule rule = new ParamFlowRule(resourceName)
                // 对 IP 地址参数限流
                .setParamIdx(0)
                // 每分钟最多 60 次
                .setCount(60)
                // 规则的统计周期为 60 秒
                .setDurationInSec(60);
        ParamFlowRuleManager.loadRules(Collections.singletonList(rule));

        // 熔断规则
        // 慢调用比例
        DegradeRule slowCallRule = new DegradeRule(resourceName)
                .setGrade(CircuitBreakerStrategy.SLOW_REQUEST_RATIO.getType())
                // 慢调用比例大于 20%，触发熔断
                .setCount(0.2)
                // 熔断持续时间 60 秒
                .setTimeWindow(60)
                // 统计时长 30 秒
                .setStatIntervalMs(30 * 1000)
                // 最小请求数，小于该值的请求不会触发熔断
                .setMinRequestAmount(10)
                // 响应时间超过 3 秒
                .setSlowRatioThreshold(3);

        // 异常比例熔断规则
        DegradeRule errorRateRule = new DegradeRule(resourceName)
                .setGrade(CircuitBreakerStrategy.ERROR_RATIO.getType())
                // 异常率大于 10%
                .setCount(0.1)
                // 熔断持续时间 60 秒
                .setTimeWindow(60)
                // 统计时长 30 秒
                .setStatIntervalMs(30 * 1000)
                // 最小请求数
                .setMinRequestAmount(10);

        // 加载规则
        DegradeRuleManager.loadRules(Arrays.asList(slowCallRule, errorRateRule));
    }

    /**
     * 通用的降级处理方法 - 返回分页数据
     *
     * @param voClass 返回值类型的Class对象
     * @return BaseResponse<Page < T>> 包含降级数据的响应
     */
    public static <T> BaseResponse<Page<T>> handleFallbackPage(Class<T> voClass) {
        try {
            // 生成模拟数据
            Page<T> simulatePage = new Page<>();
            List<T> simulateList = new ArrayList<>();

            // 创建模拟对象
            T simulateVO = createSimulateVO(voClass);

            simulateList.add(simulateVO);
            simulatePage.setRecords(simulateList);

            return ResultUtils.success(simulatePage);
        } catch (Exception e) {
            // 如果反射操作失败，返回系统错误
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "系统降级处理失败");
        }
    }

    /**
     * 通用的降级处理方法 - 返回单个对象
     *
     * @param voClass 返回值类型的Class对象
     * @return BaseResponse<T> 包含降级数据的响应
     */
    public static <T> BaseResponse<T> handleFallback(Class<T> voClass) {
        try {
            // 创建模拟对象
            T simulateVO = createSimulateVO(voClass);
            return ResultUtils.success(simulateVO);
        } catch (Exception e) {
            // 如果反射操作失败，返回系统错误
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "系统降级处理失败");
        }
    }

    /**
     * 创建模拟的VO对象
     *
     * @param voClass VO类型的Class对象
     * @return 创建的模拟对象
     */
    private static <T> T createSimulateVO(Class<T> voClass) throws Exception {
        T simulateVO = voClass.newInstance();

        // 使用反射设置通用字段
        voClass.getMethod("setId", Long.class).invoke(simulateVO, 404L);
        voClass.getMethod("setTitle", String.class).invoke(simulateVO, "您的数据丢了！请检查网络或通知管理员。");

        // 针对不同的VO类型设置特定字段
        if (voClass == QuestionVO.class || voClass == QuestionHotspotVO.class) {
            voClass.getMethod("setContent", String.class).invoke(simulateVO, "您的数据丢了！请检查网络或通知管理员。");
            voClass.getMethod("setAnswer", String.class).invoke(simulateVO, "您的数据丢了！请检查网络或通知管理员。");
        } else if (voClass == QuestionBankVO.class || voClass == QuestionBankHotspotVO.class) {
            voClass.getMethod("setDescription", String.class).invoke(simulateVO, "您的题库信息暂时访问不到，请检查网络后再试试，或者联系管理员。");
        }

        voClass.getMethod("setCreateTime", Date.class).invoke(simulateVO, new Date());
        voClass.getMethod("setUpdateTime", Date.class).invoke(simulateVO, new Date());

        return simulateVO;
    }
}