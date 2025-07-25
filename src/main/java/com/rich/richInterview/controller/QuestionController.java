package com.rich.richInterview.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
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
import com.rich.richInterview.common.DeleteRequest;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.UserConstant;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.model.dto.question.QuestionAddRequest;
import com.rich.richInterview.model.dto.question.QuestionEditRequest;
import com.rich.richInterview.model.dto.question.QuestionQueryRequest;
import com.rich.richInterview.model.dto.question.QuestionUpdateRequest;
import com.rich.richInterview.model.entity.Question;
import com.rich.richInterview.model.vo.QuestionVO;
import com.rich.richInterview.service.QuestionService;
import com.rich.richInterview.utils.ResultUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.*;

/**
 * 题目接口
 */
@RestController
@RequestMapping("/question")
@Slf4j
public class QuestionController {

    @Resource
    private QuestionService questionService;

    /**
     * 创建题目（仅管理员可用）
     *
     * @param questionAddRequest
     * @param request
     * @return
     */
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    @PostMapping("/add")
    public BaseResponse<Long> addQuestion(@RequestBody QuestionAddRequest questionAddRequest, HttpServletRequest request) {
        return ResultUtils.success(questionService.addQuestion(questionAddRequest, request));
    }

    /**
     * 删除题目（仅管理员可用）
     *
     * @param deleteRequest
     * @param request
     * @return
     */
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    @PostMapping("/delete")
    public BaseResponse<Boolean> deleteQuestion(@RequestBody DeleteRequest deleteRequest, HttpServletRequest request) {
        return ResultUtils.success(questionService.deleteQuestion(deleteRequest, request));
    }

    /**
     * 更新题目（仅管理员可用）
     *
     * @param questionUpdateRequest
     * @return
     */
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    @PostMapping("/update")
    public BaseResponse<Boolean> updateQuestion(@RequestBody QuestionUpdateRequest questionUpdateRequest, HttpServletRequest request) {
        return ResultUtils.success(questionService.updateQuestion(questionUpdateRequest, request));
    }

    /**
     * 根据 id 获取题目（封装类）
     *
     * @param id
     * @return
     */
    @GetMapping("/get/vo")
    public BaseResponse<QuestionVO> getQuestionVOById(Long id, HttpServletRequest request) {
        ThrowUtils.throwIf(id == null || id <= 0, ErrorCode.PARAMS_ERROR);
        // 获取用户 IP
        String remoteAddr = request.getRemoteAddr();
        if (remoteAddr == null || remoteAddr.isEmpty()) {
            remoteAddr = "unknown";
        }
        // 非注解方式，手动针对用户 IP 进行流控
        // 源：https://sentinelguard.io/zh-cn/docs/parameter-flow-control.html
        Entry entry = null;
        initFlowAndDegradeRules("getQuestionVOById");
        try {
            // SphU.entry() 方法用于创建一个流控入口，该方法接受三个参数：
            // 资源名称：用于标识流控规则的资源名称。
            // 入口类型：表示流控入口的类型，EntryType.IN 表示类型为入口。
            // 入口数量：表示流控入口的数量，设置为 1。
            // 额外参数：用于传递额外的参数，此处传入用户 IP 地址等。
            entry = SphU.entry("getQuestionVOById", EntryType.IN, 1, remoteAddr);
            // 核心业务
            return ResultUtils.success(questionService.getQuestionVOById(id, request));
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
                QuestionVO simulateQuestionVO = new QuestionVO();
                simulateQuestionVO.setId(404L);
                simulateQuestionVO.setTitle("您的数据丢了！请检查网络或通知管理员。");
                simulateQuestionVO.setContent("您的数据丢了！请检查网络或通知管理员。");
                simulateQuestionVO.setAnswer("您的数据丢了！请检查网络或通知管理员。");
                simulateQuestionVO.setCreateTime(new Date(System.currentTimeMillis()));
                simulateQuestionVO.setUpdateTime(new Date(System.currentTimeMillis()));
                return ResultUtils.success(simulateQuestionVO);
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
     * 分页获取题目列表（仅管理员可用）
     *
     * @param questionQueryRequest
     * @return
     */
    @PostMapping("/list/page")
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<Question>> listQuestionByPage(@RequestBody QuestionQueryRequest questionQueryRequest) {
        // 查询数据库
        Page<Question> questionPage = questionService.getQuestionPage(questionQueryRequest);
        return ResultUtils.success(questionPage);
    }

    /**
     * 分页获取题目列表（封装类）
     * 源：https://sentinelguard.io/zh-cn/docs/annotation-support.html
     * @param questionQueryRequest
     * @param request
     * @return
     */
    @PostMapping("/list/page/vo")
    public BaseResponse<Page<QuestionVO>> listQuestionVOByPage(@RequestBody QuestionQueryRequest questionQueryRequest, HttpServletRequest request) {
        long size = questionQueryRequest.getPageSize();
        // TODO 安全性配置
        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        // 获取用户 IP
        String remoteAddr = request.getRemoteAddr();
        // 非注解方式，手动针对用户 IP 进行流控
        // 源：https://sentinelguard.io/zh-cn/docs/parameter-flow-control.html
        Entry entry = null;
        initFlowAndDegradeRules("listQuestionVOByPage");
        try {
            // SphU.entry() 方法用于创建一个流控入口，该方法接受三个参数：
            // 1. 资源名称：用于标识流控规则的资源名称。
            // 2. 入口类型：表示流控入口的类型，EntryType.IN 表示类型为入口。
            // 3. 入口数量：表示流控入口的数量，设置为 1。
            // 4. 额外参数：用于传递额外的参数，此处传入用户 IP 地址等。
            entry = SphU.entry("listQuestionVOByPage", EntryType.IN, 1, remoteAddr);
            // 查询数据库
            Page<Question> questionPage = questionService.getQuestionPage(questionQueryRequest);
            // 获取封装类
            return ResultUtils.success(questionService.getQuestionVOPage(questionPage, request));
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
                return handleFallback(questionQueryRequest, request, ex);
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
     * Sintel 熔断：触发异常熔断后的降级服务
     *
     * @param questionQueryRequest
     * @param request
     * @param ex
     * @author DuRuiChi
     * @create 2025/5/27
     **/
    public BaseResponse<Page<QuestionVO>> handleFallback(@RequestBody QuestionQueryRequest questionQueryRequest, HttpServletRequest request, Throwable ex) {
        // TODO 调取缓存真实数据或其他方案
        // 生成模拟数据
        Page<QuestionVO> simulateQuestionVOPage = new Page<>();
        List<QuestionVO> simulateQuestionVOList = new ArrayList<>();
        QuestionVO simulateQuestionVO = new QuestionVO();
        simulateQuestionVO.setId(404L);
        simulateQuestionVO.setTitle("您的数据丢了！请检查网络或通知管理员。");
        simulateQuestionVO.setContent("您的数据丢了！请检查网络或通知管理员。");
        simulateQuestionVO.setAnswer("您的数据丢了！请检查网络或通知管理员。");
        simulateQuestionVO.setTags("数据丢失");
        simulateQuestionVO.setCreateTime(new Date(System.currentTimeMillis()));
        simulateQuestionVO.setUpdateTime(new Date(System.currentTimeMillis()));
        simulateQuestionVOList.add(simulateQuestionVO);
        simulateQuestionVOPage.setRecords(simulateQuestionVOList);

        // TODO 降级响应设定好的数据，不影响正常显示
        return ResultUtils.success(simulateQuestionVOPage);
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
        DegradeRule slowCallRule = new DegradeRule(resourceName).setGrade(CircuitBreakerStrategy.SLOW_REQUEST_RATIO.getType())
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
        DegradeRule errorRateRule = new DegradeRule(resourceName).setGrade(CircuitBreakerStrategy.ERROR_RATIO.getType())
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
     * 分页获取当前登录用户创建的题目列表
     *
     * @param questionQueryRequest
     * @param request
     * @return
     */
    @PostMapping("/my/list/page/vo")
    public BaseResponse<Page<QuestionVO>> listMyQuestionVOByPage(@RequestBody QuestionQueryRequest questionQueryRequest, HttpServletRequest request) {
        return ResultUtils.success(questionService.listMyQuestionVOByPage(questionQueryRequest, request));
    }

    /**
     * 编辑题目（给用户使用）
     *
     * @param questionEditRequest
     * @param request
     * @return
     */
    @PostMapping("/edit")
    public BaseResponse<Boolean> editQuestion(@RequestBody QuestionEditRequest questionEditRequest, HttpServletRequest request) {
        return ResultUtils.success(questionService.editQuestion(questionEditRequest, request));
    }

    /**
     * 通过题目id查询所属题库ID
     *
     * @param id
     * @return com.rich.richInterview.common.BaseResponse<java.lang.Long>
     * @author DuRuiChi
     * @create 2025/4/17
     **/
    @GetMapping("/get/questionBankId")
    public BaseResponse<Long> getQuestionBankId(long id, HttpServletRequest request) {
        Long questionBankId = questionService.getQuestionBankId(id);
        return ResultUtils.success(questionBankId);
    }

    /**
     * 从 ES 数据库中查询题目
     *
     * @param questionQueryRequest
     * @param request
     * @return com.rich.richInterview.common.BaseResponse<com.baomidou.mybatisplus.extension.plugins.pagination.Page < com.rich.richInterview.model.vo.QuestionVO>>
     * @author DuRuiChi
     * @create 2025/5/2
     **/
    @PostMapping("/search/page/vo")
    public BaseResponse<Page<QuestionVO>> searchQuestionVOByPage(@RequestBody QuestionQueryRequest questionQueryRequest, HttpServletRequest request) {
        long size = questionQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 200, ErrorCode.PARAMS_ERROR);
        Page<Question> questionPage = questionService.searchFromEs(questionQueryRequest);
        return ResultUtils.success(questionService.getQuestionVOPage(questionPage, request));
    }

}
