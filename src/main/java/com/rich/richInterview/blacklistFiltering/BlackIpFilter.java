package com.rich.richInterview.blacklistFiltering;

import com.rich.richInterview.utils.NetUtils;

import javax.servlet.*;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

/**
 * 黑名单 IP 过滤器，基于布隆过滤器实现高效拦截（自定义原始 Filter）
 *
 * @WebFilter ：
 * urlPatterns = "/*" 拦截所有请求
 * filterName 指定过滤器名称用于Spring识别
 */
@WebFilter(urlPatterns = "/*", filterName = "blackIpFilter")
public class BlackIpFilter implements Filter {

    /**
     * 过滤器核心方法，实现IP黑名单校验逻辑
     *
     * @param servletRequest  请求对象，可获取请求信息
     * @param servletResponse 响应对象，用于返回拦截信息
     * @param filterChain     过滤器链，用于继续处理合法请求
     */
    @Override
    public void doFilter(ServletRequest servletRequest, ServletResponse servletResponse, FilterChain filterChain) throws IOException, ServletException {

        // 通过 NetUtils 获取客户端请求 IP（同时考虑代理转发场景）
        String ipAddress = NetUtils.getIpAddress((HttpServletRequest) servletRequest);
        // 布隆过滤器判断 ip 是否在黑名单，实现高效查询（有哈希冲突导致误封误放风险）
        if (BlacklistFilteringUtils.isBlackIp(ipAddress)) {
            // 设置响应内容类型为JSON格式
            servletResponse.setContentType("text/json;charset=UTF-8");
            // 直接拦截黑名单 IP ，响应 errorCode
            servletResponse.getWriter().write("{\"errorCode\":\"-1\",\"errorMsg\":\"您已被管理员封禁，请遵守社区规则，等待解封\"}");
            return;
        }
        // IP合法时，放行请求到后续处理流程
        filterChain.doFilter(servletRequest, servletResponse);
    }

}
