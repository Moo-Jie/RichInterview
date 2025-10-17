package com.rich.richInterview.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.alibaba.csp.sentinel.annotation.SentinelResource;
import com.alibaba.csp.sentinel.slots.block.BlockException;
import com.alibaba.csp.sentinel.slots.block.degrade.DegradeException;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rich.richInterview.annotation.AutoCache;
import com.rich.richInterview.annotation.AutoClearCache;
import com.rich.richInterview.common.BaseResponse;
import com.rich.richInterview.common.DeleteRequest;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.UserConstant;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.model.dto.questionBank.QuestionBankAddRequest;
import com.rich.richInterview.model.dto.questionBank.QuestionBankEditRequest;
import com.rich.richInterview.model.dto.questionBank.QuestionBankQueryRequest;
import com.rich.richInterview.model.dto.questionBank.QuestionBankUpdateRequest;
import com.rich.richInterview.model.entity.QuestionBank;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.model.vo.QuestionBankVO;
import com.rich.richInterview.service.QuestionBankService;
import com.rich.richInterview.service.UserService;
import com.rich.richInterview.utils.ResultUtils;
import com.rich.richInterview.utils.SentinelUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;


/**
 * 题库接口
 */
@RestController
@RequestMapping("/questionBank")
@Slf4j
public class QuestionBankController {

    @Resource
    private QuestionBankService questionBankService;

    @Resource
    private UserService userService;


    /**
     * 创建题库(仅管理员权限)
     *
     * @param questionBankAddRequest
     * @param request
     * @return
     */
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    @PostMapping("/add")
    @AutoClearCache(prefixes = {"question_bank_page", "question_bank_vo", "question_bank_hotspot_page", "question_bank_hotspot_vo"})
    public BaseResponse<Long> addQuestionBank(@RequestBody QuestionBankAddRequest questionBankAddRequest, HttpServletRequest request) {
        return ResultUtils.success(questionBankService.addQuestionBank(questionBankAddRequest, request));
    }

    /**
     * 删除题库(仅管理员权限)
     *
     * @param deleteRequest
     * @param request
     * @return
     */
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    @PostMapping("/delete")
    @AutoClearCache(prefixes = {"question_bank_page", "question_bank_vo", "question_bank_hotspot_page", "question_bank_hotspot_vo"})
    public BaseResponse<Boolean> deleteQuestionBank(@RequestBody DeleteRequest deleteRequest, HttpServletRequest request) {
        return ResultUtils.success(questionBankService.deleteQuestionBank(deleteRequest, request));
    }

    /**
     * 更新题库(仅管理员权限)
     *
     * @param questionBankUpdateRequest
     * @return
     */
    @PostMapping("/update")
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    @AutoClearCache(prefixes = {"question_bank_page", "question_bank_vo", "question_bank_hotspot_page", "question_bank_hotspot_vo"})
    public BaseResponse<Boolean> updateQuestionBank(@RequestBody QuestionBankUpdateRequest questionBankUpdateRequest) {
        return ResultUtils.success(questionBankService.updateQuestionBank(questionBankUpdateRequest));
    }

    /**
     * 根据 id 获取题库详情（封装类）
     *
     * @param questionBankQueryRequest
     * @param request
     * @return
     */
    @GetMapping("/get/vo")
    // 对 ID 查询降低缓存时间
    @AutoCache(
            keyPrefix = "question_bank_vo",
            expireTime = 120,  // 设置缓存过期时间为 2 分钟
            nullCacheTime = 60,  // 设置空缓存过期时间为 1 分钟
            randomExpireRange = 30  // 设置随机过期范围为 0.5 分钟
    )
    @SentinelResource(value = "getQuestionBankVOById",
            blockHandler = "handleBlockException",
            fallback = "handleFallback")
    public BaseResponse<QuestionBankVO> getQuestionBankVOById(QuestionBankQueryRequest questionBankQueryRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(questionBankQueryRequest == null, ErrorCode.PARAMS_ERROR);
        Long id = questionBankQueryRequest.getId();
        ThrowUtils.throwIf(id <= 0, ErrorCode.PARAMS_ERROR);

        // 查询数据库
        QuestionBankVO questionBankVO = questionBankService.getQuestionBankVOById(questionBankQueryRequest, request);

        // 获取封装类
        return ResultUtils.success(questionBankVO);

    }

    /**
     * 分页获取题库列表（仅管理员可用）
     *
     * @param questionBankQueryRequest
     * @return
     */
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    @PostMapping("/list/page")
    public BaseResponse<Page<QuestionBank>> listQuestionBankByPage(@RequestBody QuestionBankQueryRequest questionBankQueryRequest) {
        long current = questionBankQueryRequest.getCurrent();
        long size = questionBankQueryRequest.getPageSize();
        // 查询数据库
        Page<QuestionBank> questionBankPage = questionBankService.page(new Page<>(current, size),
                questionBankService.getQueryWrapper(questionBankQueryRequest));
        return ResultUtils.success(questionBankPage);
    }

    /**
     * 分页获取题库列表（封装类）
     * 源：https://sentinelguard.io/zh-cn/docs/annotation-support.html
     *
     * @param questionBankQueryRequest
     * @param request
     * @return com.rich.richInterview.common.BaseResponse<com.baomidou.mybatisplus.extension.plugins.pagination.Page < com.rich.richInterview.model.vo.QuestionBankVO>>
     * @author DuRuiChi
     * @create 2025/5/27
     **/
    @PostMapping("/list/page/vo")
    @SentinelResource(value = "listQuestionBankVOByPage",
            blockHandler = "handleBlockException",
            fallback = "handleFallback")
    @AutoCache(keyPrefix = "question_bank_page")
    public BaseResponse<Page<QuestionBankVO>> listQuestionBankVOByPage(@RequestBody QuestionBankQueryRequest questionBankQueryRequest,
                                                                       HttpServletRequest request) {

        long current = questionBankQueryRequest.getCurrent();
        long size = questionBankQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 1000, ErrorCode.PARAMS_ERROR);
        // 查询数据库
        Page<QuestionBank> questionBankPage = questionBankService.page(new Page<>(current, size),
                questionBankService.getQueryWrapper(questionBankQueryRequest));
        // 获取封装类
        return ResultUtils.success(questionBankService.getQuestionBankVOPage(questionBankPage, request));
    }


    /**
     * Sintel 流控：触发异常熔断后的降级服务
     *
     * @param questionBankQueryRequest
     * @param request
     * @param ex
     * @return com.rich.richInterview.common.BaseResponse<com.baomidou.mybatisplus.extension.plugins.pagination.Page < com.rich.richInterview.model.vo.QuestionBankVO>>
     * @author DuRuiChi
     * @create 2025/5/27
     **/
    public BaseResponse<Page<QuestionBankVO>> handleFallback(@RequestBody QuestionBankQueryRequest questionBankQueryRequest, HttpServletRequest request, Throwable ex) {
        return SentinelUtils.handleFallbackPage(QuestionBankVO.class);
    }

    /**
     * 限流规则
     *
     * @return void
     * @author DuRuiChi
     * @create 2025/5/27
     **/
    @PostConstruct
    private void initFlowRules() {
        SentinelUtils.initFlowAndDegradeRules("listQuestionBankVOByPage");
    }

    /**
     * Sintel 流控： 触发流量过大阻塞后响应的服务
     *
     * @param questionBankQueryRequest
     * @param request
     * @param ex
     * @author DuRuiChi
     * @create 2025/5/27
     **/
    public BaseResponse<Page<QuestionBankVO>> handleBlockException(@RequestBody QuestionBankQueryRequest questionBankQueryRequest,
                                                                   HttpServletRequest request, BlockException ex) {
        // 过滤普通降级操作
        if (ex instanceof DegradeException) {
            return handleFallback(questionBankQueryRequest, request, ex);
        }
        // 系统高压限流降级操作
        return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "系统压力稍大，请耐心等待哟~");
    }

    /**
     * 分页获取当前登录用户创建的题库列表
     *
     * @param questionBankQueryRequest
     * @param request
     * @return
     */
    @PostMapping("/my/list/page/vo")
    public BaseResponse<Page<QuestionBankVO>> listMyQuestionBankVOByPage(@RequestBody QuestionBankQueryRequest questionBankQueryRequest,
                                                                         HttpServletRequest request) {
        ThrowUtils.throwIf(questionBankQueryRequest == null, ErrorCode.PARAMS_ERROR);
        // 补充查询条件，只查询当前登录用户的数据
        User loginUser = userService.getLoginUser(request);
        questionBankQueryRequest.setUserId(loginUser.getId());
        long current = questionBankQueryRequest.getCurrent();
        long size = questionBankQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        // 查询数据库
        Page<QuestionBank> questionBankPage = questionBankService.page(new Page<>(current, size),
                questionBankService.getQueryWrapper(questionBankQueryRequest));
        // 获取封装类
        return ResultUtils.success(questionBankService.getQuestionBankVOPage(questionBankPage, request));
    }

    /**
     * 编辑题库（给用户使用）
     *
     * @param questionBankEditRequest
     * @param request
     * @return
     */
    @PostMapping("/edit")
    @AutoClearCache(prefixes = {"question_bank_page", "question_bank_vo", "question_bank_hotspot_page", "question_bank_hotspot_vo"})
    public BaseResponse<Boolean> editQuestionBank(@RequestBody QuestionBankEditRequest questionBankEditRequest, HttpServletRequest request) {
        return ResultUtils.success(questionBankService.editQuestionBank(questionBankEditRequest, request));
    }
}
