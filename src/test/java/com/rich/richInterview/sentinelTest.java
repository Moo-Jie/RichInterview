package com.rich.richInterview;

import com.alibaba.csp.sentinel.Entry;
import com.alibaba.csp.sentinel.SphU;
import com.alibaba.csp.sentinel.slots.block.BlockException;
import com.alibaba.csp.sentinel.slots.block.RuleConstant;
import com.alibaba.csp.sentinel.slots.block.flow.FlowRule;
import com.alibaba.csp.sentinel.slots.block.flow.FlowRuleManager;
import org.springframework.boot.test.context.SpringBootTest;

import javax.annotation.PostConstruct;
import java.util.ArrayList;
import java.util.List;

/**
 * sentinelTest
 * 源：https://sentinelguard.io/zh-cn/docs/quick-start.html
 * @author DuRuiChi
 * @return
 * @create 2025/5/27
 **/
@SpringBootTest
public class sentinelTest {

    public static void main(String[] args) {
        initFlowRules();
        // 配置规则.
        while (true) {
            // 1.5.0 版本开始可以直接利用 try-with-resources 特性
            try (Entry entry = SphU.entry("HelloWorld")) {
                // 被保护的逻辑
                System.out.println("hello world");
            } catch (BlockException ex) {
                // 处理被流控的逻辑
                System.out.println("blocked!");
            }
        }
    }

    private static void initFlowRules(){
        // 配置规则
        List<FlowRule> rules = new ArrayList<>(FlowRuleManager.getRules());
        // 配置流控规则
        FlowRule rule = new FlowRule();
        // set limit resource name to HelloWorld.
        rule.setResource("HelloWorld");
        // set limit apply to method resource type.
        rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
        // Set limit QPS to 20.
        rule.setCount(20);
        // 配置流控规则
        rules.add(rule);
        // 加载配置好的规则
        FlowRuleManager.loadRules(rules);
    }
}
