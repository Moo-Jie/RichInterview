package com.rich.richInterview.exception;

import cn.dev33.satoken.exception.NotLoginException;
import cn.dev33.satoken.exception.NotRoleException;
import com.rich.richInterview.common.BaseResponse;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.common.ResultUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * 全局异常处理器
 *
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    /**
     * Sa-Token 权限校验异常
     * 官方异常参考：https://sa-token.cc/doc.html#/fun/not-login-scene
     * @param e
     * @return com.rich.richInterview.common.BaseResponse<?>
     * @author DuRuiChi
     * @create 2025/6/3
     **/
    @ExceptionHandler(NotRoleException.class)
    public BaseResponse<?> notRoleExceptionHandler(RuntimeException e) {
        log.error("NotRoleException", e);
        return ResultUtils.error(ErrorCode.NO_AUTH_ERROR, "您无权请求当前内容");
    }

    /**
     * Sa-Token 登录校验异常，根据不同的未登录类型返回具体提示信息
     * 官方异常参考：https://sa-token.cc/doc.html#/fun/not-login-scene
     * @param e
     * @return com.rich.richInterview.common.BaseResponse<?>
     * @author DuRuiChi
     * @create 2025/6/3
     **/
    @ExceptionHandler(NotLoginException.class)
    public BaseResponse<?> notLoginExceptionHandler(NotLoginException e) {
        String message = "监测您未登录，因为";
        switch (e.getType()) {
            case NotLoginException.NOT_TOKEN:
                message += "未提供Token";
                break;
            case NotLoginException.INVALID_TOKEN:
                message += "Token无效";
                break;
            case NotLoginException.TOKEN_TIMEOUT:
                message += "Token已过期";
                break;
            case NotLoginException.BE_REPLACED:
                message += "账号已在其他设备登录";
                break;
            case NotLoginException.KICK_OUT:
                message += "已被强制下线";
                break;
            case NotLoginException.TOKEN_FREEZE:
                message += "Token已被冻结";
                break;
            case NotLoginException.NO_PREFIX:
                message += "未按指定格式提交Token";
                break;
            default:
                message += "未知原因，请联系管理员";
        }

        log.error("认证异常[类型:{}] {}", e.getType(), message, e);
        return ResultUtils.error(ErrorCode.NOT_LOGIN_ERROR, message);
    }


    @ExceptionHandler(BusinessException.class)
    public BaseResponse<?> businessExceptionHandler(BusinessException e) {
        log.error("BusinessException", e);
        return ResultUtils.error(e.getCode(), e.getMessage());
    }

    @ExceptionHandler(RuntimeException.class)
    public BaseResponse<?> runtimeExceptionHandler(RuntimeException e) {
        log.error("RuntimeException", e);
        return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "系统错误,请联系管理员查看后台日志");
    }
}
