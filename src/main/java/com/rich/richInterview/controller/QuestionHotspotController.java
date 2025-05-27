package com.rich.richInterview.controller;

import com.alibaba.csp.sentinel.annotation.SentinelResource;
import com.alibaba.csp.sentinel.slots.block.BlockException;
import com.alibaba.csp.sentinel.slots.block.RuleConstant;
import com.alibaba.csp.sentinel.slots.block.degrade.DegradeException;
import com.alibaba.csp.sentinel.slots.block.flow.FlowRule;
import com.alibaba.csp.sentinel.slots.block.flow.FlowRuleManager;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rich.richInterview.annotation.AuthCheck;
import com.rich.richInterview.common.BaseResponse;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.common.ResultUtils;
import com.rich.richInterview.constant.IncrementField;
import com.rich.richInterview.constant.UserConstant;
import com.rich.richInterview.exception.BusinessException;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.model.dto.questionBank.QuestionBankQueryRequest;
import com.rich.richInterview.model.dto.questionHotspot.QuestionHotspotQueryRequest;
import com.rich.richInterview.model.dto.questionHotspot.QuestionHotspotUpdateRequest;
import com.rich.richInterview.model.entity.QuestionHotspot;
import com.rich.richInterview.model.vo.QuestionHotspotVO;
import com.rich.richInterview.model.vo.QuestionVO;
import com.rich.richInterview.service.QuestionHotspotService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

/**
 * 题目热点接口
 */
@RestController
@RequestMapping("/questionHotspot")
@Slf4j
public class QuestionHotspotController {

    @Resource
    private QuestionHotspotService questionHotspotService;

    /**
     * 热点字段递增接口（自动初始化）
     */
    @PostMapping("/increment")
    public BaseResponse<Boolean> incrementField(
            @RequestParam Long questionId,
            @RequestParam String fieldType) {
        ThrowUtils.throwIf(questionId == null, ErrorCode.PARAMS_ERROR);

        // 使用字段名查找对应的枚举
        IncrementField field = IncrementField.fromFieldName(fieldType);

        boolean result = questionHotspotService.incrementField(questionId, field);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }

    /**
     * 根据题目ID获取热点封装类
     * @param questionId 题目ID
     * @param request
     * @return QuestionHotspotVO
     */
    @GetMapping("/get/vo/byQuestionId")
    public BaseResponse<QuestionHotspotVO> getQuestionHotspotVOByQuestionId(
            @RequestParam Long questionId,
            HttpServletRequest request) {
        ThrowUtils.throwIf(questionId == null || questionId <= 0, ErrorCode.PARAMS_ERROR);

        // 根据题目 id 获取题库热点信息，不存在时初始化
        QuestionHotspot questionHotspot = questionHotspotService.getByQuestionId(questionId);
        ThrowUtils.throwIf(questionHotspot == null, ErrorCode.NOT_FOUND_ERROR);

        return ResultUtils.success(questionHotspotService.getQuestionHotspotVO(questionHotspot, request));
    }

    /**
     * 更新题目热点（仅管理员可用）
     *
     * @param questionHotspotUpdateRequest
     * @return
     */
    @PostMapping("/update")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
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
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
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
     * @param questionHotspotQueryRequest
     * @param request
     * @return
     */
    @SentinelResource(value = "listQuestionHotspotVOByPage",
            blockHandler = "handleBlockException",
            fallback = "handleFallback")
    @PostMapping("/list/page/vo")
    public BaseResponse<Page<QuestionHotspotVO>> listQuestionHotspotVOByPage(@RequestBody QuestionHotspotQueryRequest questionHotspotQueryRequest,
                                                                             HttpServletRequest request) {
        initFlowRules();
        long current = questionHotspotQueryRequest.getCurrent();
        long size = questionHotspotQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        // 查询数据库
        Page<QuestionHotspot> questionHotspotPage = questionHotspotService.page(new Page<>(current, size),
                questionHotspotService.getQueryWrapper(questionHotspotQueryRequest));
        // 获取封装类
        return ResultUtils.success(questionHotspotService.getQuestionHotspotVOPage(questionHotspotPage, request));
    }

    /**
     * Sintel 流控：触发异常熔断后的降级服务
     * @param questionHotspotQueryRequest
     * @param request
     * @param ex
     * @return com.rich.richInterview.common.BaseResponse<com.baomidou.mybatisplus.extension.plugins.pagination.Page<com.rich.richInterview.model.vo.QuestionHotspotVO>>
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
     * 限流规则
     * @return void
     * @author DuRuiChi
     * @PostConstruct 依赖注入后自动执行
     * @create 2025/5/27
     **/
        private void initFlowRules() {
        List<FlowRule> rules = new ArrayList<>(FlowRuleManager.getRules());
        FlowRule rule = new FlowRule();
        // 指定资源名称，此处是要监测的方法
        rule.setResource("listQuestionHotspotVOByPage");
        // QPS 模式
        rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
        // 阈值：5次/秒
        rule.setCount(2);
        // 添加规则
        rules.add(rule);
        // 加载规则
        FlowRuleManager.loadRules(rules);
    }

    /**
     * Sintel 流控： 触发流量过大阻塞后响应的服务
     * @param questionHotspotQueryRequest
     * @param request
     * @param ex
     * @return com.rich.richInterview.common.BaseResponse<com.baomidou.mybatisplus.extension.plugins.pagination.Page<com.rich.richInterview.model.vo.QuestionHotspotVO>>
     * @author DuRuiChi
     * @create 2025/5/27
     **/
    public BaseResponse<Page<QuestionHotspotVO>> handleBlockException(@RequestBody QuestionHotspotQueryRequest questionHotspotQueryRequest,
                                                               HttpServletRequest request, BlockException ex) {
        // 过滤普通降级操作
        if (ex instanceof DegradeException) {
            return handleFallback(questionHotspotQueryRequest, request, ex);
        }
        // 系统高压限流降级操作
        return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "系统压力稍大，请耐心等待哟~");
    }
}
