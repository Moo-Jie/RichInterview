package com.rich.richInterview.utils;

import cn.hutool.core.util.StrUtil;
import cn.hutool.http.Header;
import cn.hutool.http.useragent.UserAgent;
import cn.hutool.http.useragent.UserAgentUtil;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.exception.ThrowUtils;

import javax.servlet.http.HttpServletRequest;

/**
 * 用于 Sa-Token 登录设备相关的工具类
 *
 * @author DuRuiChi
 * @return
 * @create 2025/6/3
 **/
public class SaTokenLoginDeviceUtils {
    /**
     * 通过请求头获取用户设备
     *
     * @param request
     * @return java.lang.String
     * @author DuRuiChi
     * @create 2025/6/3
     **/
    public static String getUserDevice(HttpServletRequest request) {
        // 从请求头中获取 User-Agent
        // User-Agent ：https://blog.csdn.net/Yuppie001/article/details/135132582
        String userAgentStr = request.getHeader(Header.USER_AGENT.toString());
        // 判断设备类型
        // pc 端登录
        String device = "pc";
        if (isMiniProgram(userAgentStr)) {
            // 小程序登录
            device = "smallProgram";
        } else if (isPad(userAgentStr)) {
            // Pad 端登录
            device = "pad";
        } else {
            // 移动端登录
            // 通过 Hutool 工具包解析出 UserAgent 对象并判断是否为移动端
            UserAgent userAgent = UserAgentUtil.parse(userAgentStr);
            ThrowUtils.throwIf(userAgent == null, ErrorCode.OPERATION_ERROR, "UserAgent 解析失败，您的请求非法！");
            if (userAgent.isMobile()) {
                // 判断是否为手机端
                device = "mobile";
            }
        }
        return device;
    }

    /**
     * 判断是否是小程序
     *
     * @param userAgentStr
     * @return boolean
     * @author DuRuiChi
     * @create 2025/6/3
     **/
    private static boolean isMiniProgram(String userAgentStr) {
        // 判断微信内置浏览器：通过检查userAgent字符串中的 MicroMessenger 标识确定
        // 判断是否为小程序：通过检查userAgent字符串中的 MiniProgram 标识确定
        // 参考：https://zhidao.baidu.com/question/886540376273006132.html
        return StrUtil.containsIgnoreCase(userAgentStr, "MicroMessenger")
                && StrUtil.containsIgnoreCase(userAgentStr, "MiniProgram");
    }

    /**
     * 判断是否为平板设备
     * 支持 iOS（如 iPad）和 Android 平板的检测
     **/
    private static boolean isPad(String userAgentStr) {
        // 1.是否为 iPad
        // 参考：https://ask.csdn.net/questions/8294519
        return StrUtil.containsIgnoreCase(userAgentStr, "iPad")
                // 2.或者是否为 Android 平板,是安卓机但不是手机
                // 参考：https://blog.csdn.net/chinese_cabbage0/article/details/135956721
                || (StrUtil.containsIgnoreCase(userAgentStr, "Android")
                && !StrUtil.containsIgnoreCase(userAgentStr, "Mobile"));
    }
}
