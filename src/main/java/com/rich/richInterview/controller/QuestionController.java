package com.rich.richInterview.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.alibaba.csp.sentinel.Entry;
import com.alibaba.csp.sentinel.EntryType;
import com.alibaba.csp.sentinel.SphU;
import com.alibaba.csp.sentinel.Tracer;
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
import com.rich.richInterview.model.dto.question.QuestionAddRequest;
import com.rich.richInterview.model.dto.question.QuestionEditRequest;
import com.rich.richInterview.model.dto.question.QuestionQueryRequest;
import com.rich.richInterview.model.dto.question.QuestionUpdateRequest;
import com.rich.richInterview.model.entity.Question;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.model.vo.QuestionVO;
import com.rich.richInterview.service.QuestionService;
import com.rich.richInterview.service.impl.UserServiceImpl;
import com.rich.richInterview.utils.ResultUtils;
import com.rich.richInterview.utils.SentinelUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

/**
 * 题目接口
 */
@RestController
@RequestMapping("/question")
@Slf4j
public class QuestionController {

    @Resource
    private QuestionService questionService;
    @Autowired
    private UserServiceImpl userService;

    /**
     * 创建题目（仅管理员可用）
     *
     * @param questionAddRequest
     * @param request
     * @return
     */
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    @PostMapping("/add")
    @AutoClearCache(prefixes = {"question_page", "question_vo", "question_hotspot_page", "question_hotspot_vo", "question_bank_page", "question_bank_vo"})
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
    @AutoClearCache(prefixes = {"question_page", "question_vo", "question_hotspot_page", "question_hotspot_vo", "question_bank_page", "question_bank_vo"})
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
    @AutoClearCache(prefixes = {"question_page", "question_vo", "question_hotspot_page", "question_hotspot_vo", "question_bank_page", "question_bank_vo"})
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
    // 对 ID 查询降低缓存时间
    @AutoCache(
            keyPrefix = "question_vo",
            expireTime = 120,  // 设置缓存过期时间为 2 分钟
            nullCacheTime = 60,  // 设置空缓存过期时间为 1 分钟
            randomExpireRange = 30  // 设置随机过期范围为 0.5 分钟
    )
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
            // 开启限流入口，设定资源名、限流入口类型、参数个数、参数值
            entry = SphU.entry("getQuestionVOById", EntryType.IN, 1, remoteAddr);
            // 核心业务
            // 最近刷题记录
            User loginUser = userService.getLoginUser(request);
            loginUser.setPreviousQuestionID(id);
            userService.updateById(loginUser);
            // 题目详情
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
                return SentinelUtils.handleFallback(QuestionVO.class);
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
     *
     * @param questionQueryRequest
     * @param request
     * @return
     */
    @PostMapping("/list/page/vo")
    @AutoCache(keyPrefix = "question_page")
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
            // 开启限流入口，设定资源名、限流入口类型、参数个数、参数值
            entry = SphU.entry("listQuestionVOByPage", EntryType.IN, 1, remoteAddr);
            // 查询数据库
            Page<Question> questionPage = questionService.getQuestionPage(questionQueryRequest);
            // 获取封装类
            return ResultUtils.success(questionService.getQuestionVOPage(questionPage));
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
                return handleFallback();
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
     * @author DuRuiChi
     * @create 2025/5/27
     **/
    public BaseResponse<Page<QuestionVO>> handleFallback() {
        return SentinelUtils.handleFallbackPage(QuestionVO.class);
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
    @AutoClearCache(prefixes = {"question_page", "question_vo", "question_hotspot_page", "question_hotspot_vo", "question_bank_page", "question_bank_vo"})
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
     * @return com.rich.richInterview.common.BaseResponse<com.baomidou.mybatisplus.extension.plugins.pagination.Page < com.rich.richInterview.model.vo.QuestionVO>>
     * @author DuRuiChi
     * @create 2025/5/2
     **/
    @AutoCache(keyPrefix = "question_page")
    @PostMapping("/search/page/vo")
    public BaseResponse<Page<QuestionVO>> searchQuestionVOByPage(@RequestBody QuestionQueryRequest questionQueryRequest) {
        long size = questionQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 200, ErrorCode.PARAMS_ERROR);
        Page<Question> questionPage = questionService.searchFromEs(questionQueryRequest);
        return ResultUtils.success(questionService.getQuestionVOPage(questionPage));
    }

}
