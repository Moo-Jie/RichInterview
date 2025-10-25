package com.rich.richInterview.aspect;

import com.alibaba.csp.sentinel.Entry;
import com.alibaba.csp.sentinel.EntryType;
import com.alibaba.csp.sentinel.SphU;
import com.alibaba.csp.sentinel.Tracer;
import com.alibaba.csp.sentinel.slots.block.BlockException;
import com.alibaba.csp.sentinel.slots.block.degrade.DegradeException;
import com.rich.richInterview.annotation.SentinelResourceByIP;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.utils.ResultUtils;
import com.rich.richInterview.utils.SentinelUtils;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;

/**
 * Sentinel 流量控制切面
 * 处理 @SentinelResourceByIP 注解的方法，实现基于 IP 的限流功能
 *
 * @author DuRuiChi
 * @create 2025/01/01
 */
@Aspect
@Component
@Slf4j
public class SentinelResourceByIPAspect {

    /**
     * 环绕通知，处理 @SentinelResourceByIP 注解的方法
     *
     * @param joinPoint 切入点，用于执行原方法
     * @param SentinelResourceByIP 限流注解，包含限流配置信息
     * @return 原方法的执行结果或限流/降级响应
     */
    @Around("@annotation(SentinelResourceByIP)")
    public Object around(ProceedingJoinPoint joinPoint, SentinelResourceByIP SentinelResourceByIP) {
        // 获取方法信息
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        
        // 获取资源名称，默认为方法名
        String resourceName = SentinelResourceByIP.resourceName();
        if (resourceName.isEmpty()) {
            resourceName = method.getName();
        }
        
        // 获取用户 IP
        String remoteAddr = getClientIpAddress();
        if (remoteAddr == null || remoteAddr.isEmpty()) {
            remoteAddr = "unknown";
        }
        
        // 初始化流控和降级规则
        initFlowAndDegradeRules(resourceName);

        // 文档：https://sentinelguard.io/zh-cn/docs/parameter-flow-control.html
        Entry entry = null;
        try {
            // 开启限流入口，设定资源名、限流入口类型、参数个数、参数值
            entry = SphU.entry(resourceName, EntryType.IN, 1, remoteAddr);
            
            // 执行后续方法
            return joinPoint.proceed();
            
        } catch (Throwable ex) {
            // 当限流时，抛出 BlockException
            if (!BlockException.isBlockException(ex)) {
                // 普通业务异常处理
                Tracer.trace(ex);
                return ResultUtils.error(ErrorCode.SYSTEM_ERROR, ex.getMessage());
            }
            
            // 降级后逻辑
            if (ex instanceof DegradeException) {
                if (SentinelResourceByIP.enableFallback()) {
                    return SentinelUtils.handleFallback(SentinelResourceByIP.fallbackType());
                }
            }
            
            // 限流后逻辑
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, SentinelResourceByIP.flowMessage());
            
        } finally {
            if (entry != null) {
                // 退出流控
                entry.exit(1, remoteAddr);
            }
        }
    }
    
    /**
     * 获取客户端 IP 地址
     *
     * @return 客户端 IP 地址
     */
    private String getClientIpAddress() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return "unknown";
        }
        
        HttpServletRequest request = attributes.getRequest();
        return request.getRemoteAddr();
    }
    
    /**
     * 初始化流控和降级规则
     *
     * @param resourceName 资源名称
     */
    private void initFlowAndDegradeRules(String resourceName) {
        try {
            SentinelUtils.initFlowAndDegradeRules(resourceName);
            log.debug("初始化流控和降级规则成功，资源名称: {}", resourceName);
        } catch (Exception e) {
            log.warn("初始化流控和降级规则失败，资源名称: {}, 错误: {}", resourceName, e.getMessage());
        }
    }
}