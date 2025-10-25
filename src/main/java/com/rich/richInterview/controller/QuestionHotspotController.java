package com.rich.richInterview.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import cn.dev33.satoken.annotation.SaMode;
import com.alibaba.csp.sentinel.Entry;
import com.alibaba.csp.sentinel.EntryType;
import com.alibaba.csp.sentinel.SphU;
import com.alibaba.csp.sentinel.Tracer;
import com.alibaba.csp.sentinel.slots.block.BlockException;
import com.alibaba.csp.sentinel.slots.block.degrade.DegradeException;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rich.richInterview.annotation.AutoCache;
import com.rich.richInterview.common.BaseResponse;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.UserConstant;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.manager.CounterManager;
import com.rich.richInterview.model.dto.questionHotspot.QuestionHotspotQueryRequest;
import com.rich.richInterview.model.entity.QuestionHotspot;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.model.enums.IncrementFieldEnum;
import com.rich.richInterview.model.vo.QuestionHotspotVO;
import com.rich.richInterview.service.QuestionHotspotService;
import com.rich.richInterview.service.UserService;
import com.rich.richInterview.utils.CacheUtils;
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
    public BaseResponse<QuestionHotspotVO> getQuestionHotspotVOByQuestionId(
            @RequestParam Long questionId,
            HttpServletRequest request) {
        ThrowUtils.throwIf(questionId == null || questionId <= 0, ErrorCode.PARAMS_ERROR);

        // 1.反爬虫处理，针对用户 ID 控制访问次数
        User loginUser = userService.getLoginUser(request);
        if (!loginUser.getUserRole().equals(UserConstant.ADMIN_ROLE)) {
            detectCrawlersUtils.detectCrawler(loginUser.getId());
        }

        // 获取用户 IP
        String remoteAddr = request.getRemoteAddr();
        Entry entry = null;
        questionHotspotService.initFlowAndDegradeRules("getQuestionHotspotVOByQuestionId");

        try {
            // 开启限流入口，设定资源名、限流入口类型、参数个数、参数值
            entry = SphU.entry("getQuestionHotspotVOByQuestionId", EntryType.IN, 1, remoteAddr);

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

        } catch (Throwable ex) {
            if (!BlockException.isBlockException(ex)) {
                Tracer.trace(ex);
                return ResultUtils.error(ErrorCode.SYSTEM_ERROR, ex.getMessage());
            }
            if (ex instanceof DegradeException) {
                return SentinelUtils.handleFallback(QuestionHotspotVO.class);
            }
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "您访问过于频繁，系统压力稍大，请耐心等待哟~");
        } finally {
            if (entry != null) {
                entry.exit(1, remoteAddr);
            }
        }
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
     * @param request
     * @return
     */
    @PostMapping("/list/page/vo")
    @AutoCache(keyPrefix = "question_hotspot_page")
    public BaseResponse<Page<QuestionHotspotVO>> listQuestionHotspotVOByPage(@RequestBody QuestionHotspotQueryRequest questionHotspotQueryRequest,
                                                                             HttpServletRequest request) {
        long current = questionHotspotQueryRequest.getCurrent();
        long size = questionHotspotQueryRequest.getPageSize();

        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        String remoteAddr = request.getRemoteAddr();
        Entry entry = null;
        questionHotspotService.initFlowAndDegradeRules("listQuestionHotspotVOByPage");

        try {
            // 开启限流入口，设定资源名、限流入口类型、参数个数、参数值
            entry = SphU.entry("listQuestionHotspotVOByPage", EntryType.IN, 1, remoteAddr);
            Page<QuestionHotspot> questionHotspotPage = questionHotspotService.page(new Page<>(current, size),
                    questionHotspotService.getQueryWrapper(questionHotspotQueryRequest));
            return ResultUtils.success(questionHotspotService.getQuestionHotspotVOPage(questionHotspotPage, request));
        } catch (Throwable ex) {
            if (!BlockException.isBlockException(ex)) {
                Tracer.trace(ex);
                return ResultUtils.error(ErrorCode.SYSTEM_ERROR, ex.getMessage());
            }
            if (ex instanceof DegradeException) {
                return SentinelUtils.handleFallbackPage(QuestionHotspotVO.class);
            }
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "您访问过于频繁，系统压力稍大，请耐心等待哟~");
        } finally {
            if (entry != null) {
                entry.exit(1, remoteAddr);
            }
        }
    }
}
