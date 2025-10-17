package com.rich.richInterview.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import com.alibaba.csp.sentinel.annotation.SentinelResource;
import com.alibaba.csp.sentinel.slots.block.BlockException;
import com.alibaba.csp.sentinel.slots.block.degrade.DegradeException;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rich.richInterview.annotation.AutoCache;
import com.rich.richInterview.common.BaseResponse;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.UserConstant;
import com.rich.richInterview.exception.BusinessException;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.model.dto.questionBankHotspot.QuestionBankHotspotQueryRequest;
import com.rich.richInterview.model.dto.questionBankHotspot.QuestionBankHotspotUpdateRequest;
import com.rich.richInterview.model.entity.QuestionBankHotspot;
import com.rich.richInterview.model.enums.IncrementFieldEnum;
import com.rich.richInterview.model.vo.QuestionBankHotspotVO;
import com.rich.richInterview.service.QuestionBankHotspotService;
import com.rich.richInterview.utils.ResultUtils;
import com.rich.richInterview.utils.SentinelUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

/**
 * 题库热点接口
 */
@RestController
@RequestMapping("/questionBankHotspot")
@Slf4j
public class QuestionBankHotspotController {

    @Resource
    private QuestionBankHotspotService questionBankHotspotService;

    /**
     * 热点字段递增接口（自动初始化）
     *
     * @param questionBankId
     * @param fieldType
     * @return boolean
     * @author DuRuiChi
     * @create 2025/5/25
     **/
    @PostMapping("/increment")
    public BaseResponse<Boolean> incrementField(
            @RequestParam Long questionBankId,
            @RequestParam String fieldType) {
        ThrowUtils.throwIf(questionBankId == null, ErrorCode.PARAMS_ERROR);

        // 使用字段名查找对应的枚举
        IncrementFieldEnum field = IncrementFieldEnum.fromFieldName(fieldType);

        boolean result = questionBankHotspotService.incrementField(questionBankId, field);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }

    /**
     * 根据题库 ID 获取热点封装类
     *
     * @param questionBankId 题库ID
     * @param request
     * @return QuestionBankHotspotVO
     */
    @GetMapping("/get/vo/byQuestionBankId")
    @SentinelResource(value = "getQuestionBankHotspotVOByQuestionBankId",
            blockHandler = "handleBlockException",
            fallback = "handleFallback")
    // 对 ID 查询降低缓存时间
    @AutoCache(
            keyPrefix = "question_bank_hotspot_vo",
            expireTime = 120,  // 设置缓存过期时间为 2 分钟
            nullCacheTime = 60,  // 设置空缓存过期时间为 1 分钟
            randomExpireRange = 30  // 设置随机过期范围为 0.5 分钟
    )
    public BaseResponse<QuestionBankHotspotVO> getQuestionBankHotspotVOByQuestionBankId(
            @RequestParam Long questionBankId,
            HttpServletRequest request) {
        ThrowUtils.throwIf(questionBankId == null || questionBankId <= 0, ErrorCode.PARAMS_ERROR);

        // 根据题库 id 获取题库热点信息，不存在时初始化
        QuestionBankHotspot questionBankHotspot = questionBankHotspotService.getByQuestionBankId(questionBankId);
        ThrowUtils.throwIf(questionBankHotspot == null, ErrorCode.NOT_FOUND_ERROR);

        return ResultUtils.success(questionBankHotspotService.getQuestionBankHotspotVO(questionBankHotspot, request));
    }

    /**
     * 更新题库热点（仅管理员可用）
     *
     * @param questionBankHotspotUpdateRequest
     * @return
     */
    @PostMapping("/update")
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    public BaseResponse<Boolean> updateQuestionBankHotspot(@RequestBody QuestionBankHotspotUpdateRequest questionBankHotspotUpdateRequest) {
        if (questionBankHotspotUpdateRequest == null || questionBankHotspotUpdateRequest.getQuestionBankId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        // todo 在此处将实体类和 DTO 进行转换
        QuestionBankHotspot questionBankHotspot = new QuestionBankHotspot();
        BeanUtils.copyProperties(questionBankHotspotUpdateRequest, questionBankHotspot);
        // 数据校验
        questionBankHotspotService.validQuestionBankHotspot(questionBankHotspot, false);
        // 操作数据库
        boolean result = questionBankHotspotService.updateById(questionBankHotspot);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return ResultUtils.success(true);
    }

    /**
     * 分页获取题库热点列表（仅管理员可用）
     *
     * @param questionBankHotspotQueryRequest
     * @return
     */
    @PostMapping("/list/page")
    @SaCheckRole(UserConstant.ADMIN_ROLE)
    public BaseResponse<Page<QuestionBankHotspot>> listQuestionBankHotspotByPage(@RequestBody QuestionBankHotspotQueryRequest questionBankHotspotQueryRequest) {
        long current = questionBankHotspotQueryRequest.getCurrent();
        long size = questionBankHotspotQueryRequest.getPageSize();
        // 查询数据库
        Page<QuestionBankHotspot> questionBankHotspotPage = questionBankHotspotService.page(new Page<>(current, size),
                questionBankHotspotService.getQueryWrapper(questionBankHotspotQueryRequest));
        return ResultUtils.success(questionBankHotspotPage);
    }

    /**
     * 分页获取题库热点列表（封装类）
     * 源： https://sentinelguard.io/zh-cn/docs/annotation-support.html
     *
     * @param questionBankHotspotQueryRequest
     * @param request
     * @return com.rich.richInterview.common.BaseResponse<com.baomidou.mybatisplus.extension.plugins.pagination.Page < com.rich.richInterview.model.vo.QuestionBankHotspotVO>>
     * @author DuRuiChi
     * @create 2025/5/27
     **/
    @PostMapping("/list/page/vo")
    @SentinelResource(value = "listQuestionBankHotspotVOByPage",
            blockHandler = "handleBlockException",
            fallback = "handleFallback")
    @AutoCache(keyPrefix = "question_bank_hotspot_page")
    public BaseResponse<Page<QuestionBankHotspotVO>> listQuestionBankHotspotVOByPage(@RequestBody QuestionBankHotspotQueryRequest questionBankHotspotQueryRequest,
                                                                                     HttpServletRequest request) {

        long current = questionBankHotspotQueryRequest.getCurrent();
        long size = questionBankHotspotQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        // 查询数据库
        Page<QuestionBankHotspot> questionBankHotspotPage = questionBankHotspotService.page(new Page<>(current, size),
                questionBankHotspotService.getQueryWrapper(questionBankHotspotQueryRequest));
        // 获取封装类
        return ResultUtils.success(questionBankHotspotService.getQuestionBankHotspotVOPage(questionBankHotspotPage, request));
    }

    /**
     * Sintel 流控：触发异常熔断后的降级服务
     *
     * @param questionBankHotspotQueryRequest
     * @param request
     * @param ex
     * @return com.rich.richInterview.common.BaseResponse<com.baomidou.mybatisplus.extension.plugins.pagination.Page < com.rich.richInterview.model.vo.QuestionBankHotspotVO>>
     * @author DuRuiChi
     * @create 2025/5/27
     **/
    public BaseResponse<Page<QuestionBankHotspotVO>> handleFallback(@RequestBody QuestionBankHotspotQueryRequest questionBankHotspotQueryRequest, HttpServletRequest request, Throwable ex) {
        return SentinelUtils.handleFallbackPage(QuestionBankHotspotVO.class);
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
        SentinelUtils.initFlowAndDegradeRules("listQuestionBankHotspotVOByPage");
    }

    /**
     * Sintel 流控： 触发流量过大阻塞后响应的服务
     *
     * @param questionBankHotspotQueryRequest
     * @param request
     * @param ex
     * @return com.rich.richInterview.common.BaseResponse<com.baomidou.mybatisplus.extension.plugins.pagination.Page < com.rich.richInterview.model.vo.QuestionBankHotspotVO>>
     * @author DuRuiChi
     * @create 2025/5/27
     **/
    public BaseResponse<Page<QuestionBankHotspotVO>> handleBlockException(@RequestBody QuestionBankHotspotQueryRequest questionBankHotspotQueryRequest,
                                                                          HttpServletRequest request, BlockException ex) {
        // 过滤普通降级操作
        if (ex instanceof DegradeException) {
            return handleFallback(questionBankHotspotQueryRequest, request, ex);
        }
        // 系统高压限流降级操作
        return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "系统压力稍大，请耐心等待哟~");
    }
}
