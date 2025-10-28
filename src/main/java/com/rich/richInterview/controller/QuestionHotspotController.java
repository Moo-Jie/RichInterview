package com.rich.richInterview.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import cn.dev33.satoken.annotation.SaMode;
import com.alibaba.csp.sentinel.annotation.SentinelResource;
import com.alibaba.csp.sentinel.slots.block.BlockException;
import com.alibaba.csp.sentinel.slots.block.degrade.DegradeException;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rich.richInterview.annotation.AutoCache;
import com.rich.richInterview.annotation.SentinelResourceByIP;
import com.rich.richInterview.common.BaseResponse;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.UserConstant;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.model.dto.questionHotspot.QuestionHotspotQueryRequest;
import com.rich.richInterview.model.entity.QuestionHotspot;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.model.enums.IncrementFieldEnum;
import com.rich.richInterview.model.vo.QuestionBankHotspotVO;
import com.rich.richInterview.model.vo.QuestionHotspotVO;
import com.rich.richInterview.service.QuestionHotspotService;
import com.rich.richInterview.service.UserService;
import com.rich.richInterview.utils.DetectCrawlersUtils;
import com.rich.richInterview.utils.ResultUtils;
import com.rich.richInterview.utils.SentinelUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

/**
 * 题目热点接口
 */
@RestController
@RequestMapping("/questionHotspot")
@Slf4j
public class QuestionHotspotController {

    @Resource
    private QuestionHotspotService questionHotspotService;

    @Resource
    private UserService userService;

    @Resource
    private DetectCrawlersUtils detectCrawlersUtils;


    /**
     * 热点字段递增接口（自动初始化）
     */
    @PostMapping("/increment")
    public BaseResponse<Boolean> incrementField(
            @RequestParam Long questionId,
            @RequestParam String fieldType) {
        ThrowUtils.throwIf(questionId == null, ErrorCode.PARAMS_ERROR);

        // 使用字段名查找对应的枚举
        IncrementFieldEnum field = IncrementFieldEnum.fromFieldName(fieldType);

        // 构建缓存键
        String cacheKey = questionHotspotService.buildFieldCacheKey(questionId, field);

        return ResultUtils.success(questionHotspotService.doIncrementField(questionId, field, cacheKey));
    }

    /**
     * 根据题目ID获取热点封装类
     *
     * @param questionId 题目ID
     * @param request
     * @return QuestionHotspotVO
     */
    @GetMapping("/get/vo/byQuestionId")
    @SaCheckRole(value = {UserConstant.ADMIN_ROLE, UserConstant.DEFAULT_ROLE}, mode = SaMode.OR)
    @SentinelResourceByIP(
            resourceName = "getQuestionHotspotVOByQuestionId",
            fallbackType = QuestionHotspotVO.class
    )
    public BaseResponse<QuestionHotspotVO> getQuestionHotspotVOByQuestionId(
            @RequestParam Long questionId,
            HttpServletRequest request) {
        ThrowUtils.throwIf(questionId == null || questionId <= 0, ErrorCode.PARAMS_ERROR);

        // 1.反爬虫处理，针对用户 ID 控制访问次数
        User loginUser = userService.getLoginUser(request);
        if (!loginUser.getUserRole().equals(UserConstant.ADMIN_ROLE)) {
            detectCrawlersUtils.detectCrawler(loginUser.getId());
        }

        // 2.核心业务
        loginUser.setPreviousQuestionID(questionId);
        userService.updateById(loginUser);

        // 尝试从缓存获取各个字段的值
        QuestionHotspotVO hotspotVO = questionHotspotService.getQuestionHotspotFromCache(questionId);

        if (hotspotVO != null) {
            // 从缓存获取热点数据成功
            return ResultUtils.success(hotspotVO);
        } else {
            log.info("缓存未命中，查询数据库，questionId: {}", questionId);
        }

        // 缓存未命中，查询数据库
        QuestionHotspot questionHotspot = questionHotspotService.getByQuestionId(questionId);
        ThrowUtils.throwIf(questionHotspot == null, ErrorCode.NOT_FOUND_ERROR);

        // 将数据库数据写入缓存
        questionHotspotService.cacheQuestionHotspotFields(questionHotspot);

        return ResultUtils.success(questionHotspotService.getQuestionHotspotVO(questionHotspot, request));
    }

    /**
     * 分页获取题目热点列表（仅管理员可用）
     *
     * @param questionHotspotQueryRequest
     * @return
     */
    @PostMapping("/list/page")
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<QuestionHotspot>> listQuestionHotspotByPage(@RequestBody QuestionHotspotQueryRequest questionHotspotQueryRequest) {
        long current = questionHotspotQueryRequest.getCurrent();
        long size = questionHotspotQueryRequest.getPageSize();
        Page<QuestionHotspot> questionHotspotPage = questionHotspotService.page(new Page<>(current, size),
                questionHotspotService.getQueryWrapper(questionHotspotQueryRequest));
        return ResultUtils.success(questionHotspotPage);
    }

    /**
     * 分页获取题目热点列表（封装类）
     * 保留原有缓存注解，让其自然过期
     *
     * @param questionHotspotQueryRequest
     * @return
     */
    @PostMapping("/list/page/vo")
    @SentinelResource(value = "listQuestionHotspotVOByPage",
            blockHandler = "handleBlockException",
            fallback = "handleFallback")
    @AutoCache(keyPrefix = "question_hotspot_page")
    public BaseResponse<Page<QuestionHotspotVO>> listQuestionHotspotVOByPage(
            @RequestBody QuestionHotspotQueryRequest questionHotspotQueryRequest) {
        long current = questionHotspotQueryRequest.getCurrent();
        long size = questionHotspotQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);

        Page<QuestionHotspot> questionHotspotPage = questionHotspotService.page(new Page<>(current, size),
                questionHotspotService.getQueryWrapper(questionHotspotQueryRequest));
        return ResultUtils.success(questionHotspotService.getQuestionHotspotVOPage(questionHotspotPage));
    }

    /**
     * Sintel 流控： 触发流量过大阻塞后响应的服务
     *
     * @param ex
     * @author DuRuiChi
     * @create 2025/5/27
     **/
    public BaseResponse<Page<QuestionHotspotVO>> handleBlockException(BlockException ex) {
        // 过滤普通降级操作
        if (ex instanceof DegradeException) {
            return handleFallback();
        }
        // 系统高压限流降级操作
        return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "系统压力稍大，请耐心等待哟~");
    }

    /**
     * Sintel 流控：触发异常熔断后的降级服务
     *
     * @return com.rich.richInterview.common.BaseResponse<com.baomidou.mybatisplus.extension.plugins.pagination.Page < com.rich.richInterview.model.vo.QuestionBankVO>>
     * @author DuRuiChi
     * @create 2025/5/27
     **/
    public BaseResponse<Page<QuestionHotspotVO>> handleFallback() {
        return SentinelUtils.handleFallbackPage(QuestionHotspotVO.class);
    }
}
