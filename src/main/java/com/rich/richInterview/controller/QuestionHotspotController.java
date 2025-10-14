package com.rich.richInterview.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.rich.richInterview.annotation.AutoCache;
import cn.dev33.satoken.annotation.SaMode;
import com.alibaba.csp.sentinel.Entry;
import com.alibaba.csp.sentinel.EntryType;
import com.alibaba.csp.sentinel.SphU;
import com.alibaba.csp.sentinel.Tracer;
import com.alibaba.csp.sentinel.slots.block.BlockException;
import com.alibaba.csp.sentinel.slots.block.degrade.DegradeException;
import com.alibaba.csp.sentinel.slots.block.degrade.DegradeRule;
import com.alibaba.csp.sentinel.slots.block.degrade.DegradeRuleManager;
import com.alibaba.csp.sentinel.slots.block.degrade.circuitbreaker.CircuitBreakerStrategy;
import com.alibaba.csp.sentinel.slots.block.flow.param.ParamFlowRule;
import com.alibaba.csp.sentinel.slots.block.flow.param.ParamFlowRuleManager;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rich.richInterview.common.BaseResponse;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.UserConstant;
import com.rich.richInterview.exception.BusinessException;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.model.dto.questionHotspot.QuestionHotspotQueryRequest;
import com.rich.richInterview.model.dto.questionHotspot.QuestionHotspotUpdateRequest;
import com.rich.richInterview.model.entity.QuestionHotspot;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.model.enums.IncrementFieldEnum;
import com.rich.richInterview.model.vo.QuestionHotspotVO;
import com.rich.richInterview.service.QuestionHotspotService;
import com.rich.richInterview.service.UserService;
import com.rich.richInterview.utils.DetectCrawlersUtils;
import com.rich.richInterview.utils.ResultUtils;
import com.rich.richInterview.utils.SentinelUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.*;

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

        boolean result = questionHotspotService.incrementField(questionId, field);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }

    /**
     * 根据题目ID获取热点封装类
     *
     * @param questionId 题目ID
     * @param request
     * @return QuestionHotspotVO
     */
    @GetMapping("/get/vo/byQuestionId")
    //    只要具有其中一个权限即可通过校验
    @SaCheckRole(value = {UserConstant.ADMIN_ROLE, UserConstant.DEFAULT_ROLE}, mode = SaMode.OR)
    // 对 ID 查询降低缓存时间
    @AutoCache(
            keyPrefix = "question_bank_vo",
            expireTime = 120,  // 设置缓存过期时间为 2 分钟
            nullCacheTime = 60,  // 设置空缓存过期时间为 1 分钟
            randomExpireRange = 30  // 设置随机过期范围为 0.5 分钟
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
        // 获取用户 IP
        String remoteAddr = request.getRemoteAddr();
        // 非注解方式，手动针对用户 IP 进行流控
        // 源：https://sentinelguard.io/zh-cn/docs/parameter-flow-control.html
        Entry entry = null;
        initFlowAndDegradeRules("getQuestionHotspotVOByQuestionId");
        try {
            // SphU.entry() 方法用于创建一个流控入口，该方法接受三个参数：【资源名称：用于标识流控规则的资源名称。】【入口数量：表示流控入口的数量，设置为 1。】【额外参数：用于传递额外的参数，此处传入用户 IP 地址等。】
            entry = SphU.entry("getQuestionHotspotVOByQuestionId", EntryType.IN, 1, remoteAddr);
            // 核心业务
            // 最近刷题记录
            loginUser.setPreviousQuestionID(questionId);
            userService.updateById(loginUser);
            // 根据题目 id 获取题库热点信息，不存在时初始化
            QuestionHotspot questionHotspot = questionHotspotService.getByQuestionId(questionId);
            ThrowUtils.throwIf(questionHotspot == null, ErrorCode.NOT_FOUND_ERROR);
            return ResultUtils.success(questionHotspotService.getQuestionHotspotVO(questionHotspot, request));
        } catch (Throwable ex) {
            // 当限流时，抛出 BlockException
            // 普通业务异常后逻辑
            if (!BlockException.isBlockException(ex)) {
                // 记录日志
                Tracer.trace(ex);
                return ResultUtils.error(ErrorCode.SYSTEM_ERROR, ex.getMessage());
            }
            // 降级后逻辑
            if (ex instanceof DegradeException) {
                return SentinelUtils.handleFallback(QuestionHotspotVO.class);
            }
            // 限流后逻辑
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "您访问过于频繁，系统压力稍大，请耐心等待哟~");
        } finally {
            if (entry != null) {
                // 退出流控
                entry.exit(1, remoteAddr);
            }
        }
    }

    /**
     * 更新题目热点（仅管理员可用）
     *
     * @param questionHotspotUpdateRequest
     * @return
     */
    @PostMapping("/update")
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> updateQuestionHotspot(@RequestBody QuestionHotspotUpdateRequest questionHotspotUpdateRequest) {
        if (questionHotspotUpdateRequest == null || questionHotspotUpdateRequest.getQuestionId() == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        // todo 在此处将实体类和 DTO 进行转换
        QuestionHotspot questionHotspot = new QuestionHotspot();
        BeanUtils.copyProperties(questionHotspotUpdateRequest, questionHotspot);
        // 数据校验
        questionHotspotService.validQuestionHotspot(questionHotspot, false);
        // 操作数据库
        boolean result = questionHotspotService.updateById(questionHotspot);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
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
        // 查询数据库
        Page<QuestionHotspot> questionHotspotPage = questionHotspotService.page(new Page<>(current, size),
                questionHotspotService.getQueryWrapper(questionHotspotQueryRequest));
        return ResultUtils.success(questionHotspotPage);
    }

    /**
     * 分页获取题目热点列表（封装类）
     * 源：https://sentinelguard.io/zh-cn/docs/annotation-support.html
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

        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        // 获取用户 IP
        String remoteAddr = request.getRemoteAddr();
        // 非注解方式，手动针对用户 IP 进行流控
        // 源：https://sentinelguard.io/zh-cn/docs/parameter-flow-control.html
        Entry entry = null;
        initFlowAndDegradeRules("listQuestionHotspotVOByPage");
        try {
            // SphU.entry() 方法用于创建一个流控入口，该方法接受三个参数：【资源名称：用于标识流控规则的资源名称。】【入口数量：表示流控入口的数量，设置为 1。】【额外参数：用于传递额外的参数，此处传入用户 IP 地址等。】
            entry = SphU.entry("listQuestionHotspotVOByPage", EntryType.IN, 1, remoteAddr);
            // 查询数据库
            Page<QuestionHotspot> questionHotspotPage = questionHotspotService.page(new Page<>(current, size),
                    questionHotspotService.getQueryWrapper(questionHotspotQueryRequest));
            // 获取封装类
            return ResultUtils.success(questionHotspotService.getQuestionHotspotVOPage(questionHotspotPage, request));
        } catch (Throwable ex) {
            // 当限流时，抛出 BlockException
            // 普通业务异常后逻辑
            if (!BlockException.isBlockException(ex)) {
                // 记录日志
                Tracer.trace(ex);
                return ResultUtils.error(ErrorCode.SYSTEM_ERROR, ex.getMessage());
            }
            // 降级后逻辑
            if (ex instanceof DegradeException) {
                return handleFallback(questionHotspotQueryRequest, request, ex);
            }
            // 限流后逻辑
            return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "您访问过于频繁，系统压力稍大，请耐心等待哟~");
        } finally {
            if (entry != null) {
                // 退出流控
                entry.exit(1, remoteAddr);
            }
        }
    }

    /**
     * Sintel 流控：触发异常熔断后的降级服务
     *
     * @param questionHotspotQueryRequest
     * @param request
     * @param ex
     * @return com.rich.richInterview.common.BaseResponse<com.baomidou.mybatisplus.extension.plugins.pagination.Page < com.rich.richInterview.model.vo.QuestionHotspotVO>>
     * @author DuRuiChi
     * @create 2025/5/27
     **/
    public BaseResponse<Page<QuestionHotspotVO>> handleFallback(@RequestBody QuestionHotspotQueryRequest questionHotspotQueryRequest, HttpServletRequest request, Throwable ex) {
        // TODO 调取缓存真实数据或其他方案
        // 生成模拟数据
        Page<QuestionHotspotVO> simulateQuestionHotspotVOPage = new Page<>();
        List<QuestionHotspotVO> simulateQuestionHotspotVOList = new ArrayList<>();
        QuestionHotspotVO simulateQuestionHotspotVO = new QuestionHotspotVO();
        simulateQuestionHotspotVO.setId(404L);
        simulateQuestionHotspotVO.setTitle("您的数据丢了！请检查网络或通知管理员。");
        simulateQuestionHotspotVO.setContent("您的数据丢了！请检查网络或通知管理员。");
        simulateQuestionHotspotVO.setAnswer("您的数据丢了！请检查网络或通知管理员。");
        simulateQuestionHotspotVO.setCreateTime(new Date(System.currentTimeMillis()));
        simulateQuestionHotspotVO.setUpdateTime(new Date(System.currentTimeMillis()));
        simulateQuestionHotspotVOList.add(simulateQuestionHotspotVO);
        simulateQuestionHotspotVOPage.setRecords(simulateQuestionHotspotVOList);

        // TODO 降级响应设定好的数据，不影响正常显示
        return ResultUtils.success(simulateQuestionHotspotVOPage);
    }

    /**
     * 设定限流与熔断规则
     *
     * @return void
     * @author DuRuiChi
     * @PostConstruct 依赖注入后自动执行
     * @create 2025/5/27
     **/
    private void initFlowAndDegradeRules(String resourceName) {
        SentinelUtils.initFlowAndDegradeRules(resourceName);
    }
}
