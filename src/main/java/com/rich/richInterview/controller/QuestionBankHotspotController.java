package com.rich.richInterview.controller;

import cn.dev33.satoken.annotation.SaCheckRole;
import cn.dev33.satoken.annotation.SaMode;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.rich.richInterview.annotation.AutoCache;
import com.rich.richInterview.annotation.AutoClearCache;
import com.rich.richInterview.annotation.SentinelResourceByIP;
import com.rich.richInterview.common.BaseResponse;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.UserConstant;
import com.rich.richInterview.exception.BusinessException;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.model.dto.questionBankHotspot.QuestionBankHotspotQueryRequest;
import com.rich.richInterview.model.dto.questionBankHotspot.QuestionBankHotspotUpdateRequest;
import com.rich.richInterview.model.entity.QuestionBankHotspot;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.model.enums.IncrementFieldEnum;
import com.rich.richInterview.model.vo.QuestionBankHotspotVO;
import com.rich.richInterview.service.QuestionBankHotspotService;
import com.rich.richInterview.service.UserService;
import com.rich.richInterview.utils.DetectCrawlersUtils;
import com.rich.richInterview.utils.ResultUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.web.bind.annotation.*;

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

    @Resource
    private UserService userService;

    @Resource
    private DetectCrawlersUtils detectCrawlersUtils;

    /**
     * 热点字段递增接口（自动初始化）
     */
    @PostMapping("/increment")
    public BaseResponse<Boolean> incrementField(@RequestParam Long questionBankId, @RequestParam String fieldType) {
        ThrowUtils.throwIf(questionBankId == null, ErrorCode.PARAMS_ERROR);

        // 使用字段名查找对应的枚举
        IncrementFieldEnum field = IncrementFieldEnum.fromFieldName(fieldType);

        // 构建缓存键
        String cacheKey = questionBankHotspotService.buildFieldCacheKey(questionBankId, field);

        // 执行字段增量
        return ResultUtils.success(questionBankHotspotService.doIncrementField(questionBankId, field, cacheKey));
    }

    /**
     * 根据题库 ID 获取热点封装类
     *
     * @param questionBankId 题库ID
     * @param request
     * @return QuestionBankHotspotVO
     */
    @GetMapping("/get/vo/byQuestionBankId")
    @SaCheckRole(value = {UserConstant.ADMIN_ROLE, UserConstant.DEFAULT_ROLE}, mode = SaMode.OR)
    @SentinelResourceByIP(
            resourceName = "getQuestionBankHotspotVOByQuestionBankId",
            fallbackType = QuestionBankHotspotVO.class
    )
    public BaseResponse<QuestionBankHotspotVO> getQuestionBankHotspotVOByQuestionBankId(@RequestParam Long questionBankId, HttpServletRequest request) {
        ThrowUtils.throwIf(questionBankId == null || questionBankId <= 0, ErrorCode.PARAMS_ERROR);

        // 1.反爬虫处理，针对用户 ID 控制访问次数
        User loginUser = userService.getLoginUser(request);
        if (!loginUser.getUserRole().equals(UserConstant.ADMIN_ROLE)) {
            detectCrawlersUtils.detectCrawler(loginUser.getId());
        }

        // 2.核心业务
        userService.updateById(loginUser);

        // 尝试从缓存获取各个字段的值
        QuestionBankHotspotVO hotspotVO = questionBankHotspotService.getQuestionBankHotspotFromCache(questionBankId);

        if (hotspotVO != null) {
            // 从缓存获取热点数据成功
            return ResultUtils.success(hotspotVO);
        } else {
            log.info("缓存未命中，查询数据库，questionBankId: {}", questionBankId);
        }

        // 缓存未命中，查询数据库
        QuestionBankHotspot questionBankHotspot = questionBankHotspotService.getByQuestionBankId(questionBankId);
        ThrowUtils.throwIf(questionBankHotspot == null, ErrorCode.NOT_FOUND_ERROR);

        // 将数据库数据写入缓存
        questionBankHotspotService.cacheQuestionBankHotspotFields(questionBankHotspot);

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
    @AutoClearCache(prefixes = {"question_bank_hotspot_page", "question_bank_hotspot_vo"})
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
        Page<QuestionBankHotspot> questionBankHotspotPage = questionBankHotspotService.page(new Page<>(current, size), questionBankHotspotService.getQueryWrapper(questionBankHotspotQueryRequest));
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
    @SaCheckRole(value = {UserConstant.ADMIN_ROLE, UserConstant.DEFAULT_ROLE}, mode = SaMode.OR)
    @SentinelResourceByIP(
            resourceName = "listQuestionBankHotspotVOByPage",
            fallbackType = Page.class
    )
    @AutoCache(keyPrefix = "question_bank_hotspot_page")
    public BaseResponse<Page<QuestionBankHotspotVO>> listQuestionBankHotspotVOByPage(@RequestBody QuestionBankHotspotQueryRequest questionBankHotspotQueryRequest, HttpServletRequest request) {

        long current = questionBankHotspotQueryRequest.getCurrent();
        long size = questionBankHotspotQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        // 查询数据库
        Page<QuestionBankHotspot> questionBankHotspotPage = questionBankHotspotService.page(new Page<>(current, size), questionBankHotspotService.getQueryWrapper(questionBankHotspotQueryRequest));
        // 获取封装类
        return ResultUtils.success(questionBankHotspotService.getQuestionBankHotspotVOPage(questionBankHotspotPage, request));
    }


}
