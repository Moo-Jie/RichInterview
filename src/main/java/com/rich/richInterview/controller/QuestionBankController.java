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
import com.rich.richInterview.common.DeleteRequest;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.common.ResultUtils;
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
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
// 不使用改热点探测服务注销即可
//import com.jd.platform.hotkey.client.callback.JdHotKeyStore;

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
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    @PostMapping("/add")
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
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
    @PostMapping("/delete")
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
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
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
    public BaseResponse<QuestionBankVO> getQuestionBankVOById(QuestionBankQueryRequest questionBankQueryRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(questionBankQueryRequest == null, ErrorCode.PARAMS_ERROR);
        Long id = questionBankQueryRequest.getId();
        ThrowUtils.throwIf(id <= 0, ErrorCode.PARAMS_ERROR);
        // 不使用改热点探测服务注销即可
        // 生成 bank_detail_ 开头的 key ，应当与数据库内设定好的热点探测规则匹配
        // 规则备份：
        //        [
//                  {
//                    "duration": 600,
//                        "key": "bank_detail_",
//                        "prefix": true,
//                        "interval": 5,
//                        "threshold": 10,
//                        "desc": "热门题库 HotKey 缓存：首先判断 bank_detail_ 开头的 key，如果 5 秒访问次数达到 10 次，就会指认为HotKey 被添加到缓存中，为期10 分钟，到期后从 JVM 中清除，变回普通 Key"
//                  }
        //        ]
//        String key = "bank_detail_" + id;

        // 响应缓存内容
        // 通过 JD-HotKey-Client 内置方法，判断是否被指认为 HotKey
//        if (JdHotKeyStore.isHotKey(key)) {
//            // 尝试从本地缓存中获取缓存值
//            Object cachedQuestionBankVO = JdHotKeyStore.get(key);
//            // 如果缓存值存在，响应缓存的值
//            if (cachedQuestionBankVO != null) {
//                return ResultUtils.success((QuestionBankVO) cachedQuestionBankVO);
//            }
//        }
        // 查询数据库
        QuestionBankVO questionBankVO = questionBankService.getQuestionBankVOById(questionBankQueryRequest, request);

        // 缓存查询结果
        // 通过 JD-HotKey-Client 内置方法，直接将查询结果缓存到本地 Caffeine 缓存中
//        JdHotKeyStore.smartSet(key, questionBankVO);

        // 获取封装类
        return ResultUtils.success(questionBankVO);

    }

    /**
     * 分页获取题库列表（仅管理员可用）
     *
     * @param questionBankQueryRequest
     * @return
     */
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
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
        // TODO 调取缓存真实数据或其他方案
        // 生成模拟数据
        Page<QuestionBankVO> simulateQuestionBankVOPage = new Page<>();
        List<QuestionBankVO> simulateQuestionBankVOList = new ArrayList<>();
        QuestionBankVO simulateQuestionBankVO = new QuestionBankVO();
        simulateQuestionBankVO.setId(404L);
        simulateQuestionBankVO.setTitle("您的数据丢了！请检查网络或通知管理员。");
        simulateQuestionBankVO.setDescription("您的题库信息暂时访问不到，请检查网络后再试试，或者联系管理员。");
        simulateQuestionBankVO.setPicture("https://rich-tams.oss-cn-beijing.aliyuncs.com/LOGO.jpg");
        simulateQuestionBankVO.setCreateTime(new Date(System.currentTimeMillis()));
        simulateQuestionBankVO.setUpdateTime(new Date(System.currentTimeMillis()));
        simulateQuestionBankVOList.add(simulateQuestionBankVO);
        simulateQuestionBankVOPage.setRecords(simulateQuestionBankVOList);
        // TODO 降级响应设定好的数据，不影响正常显示
        return ResultUtils.success(simulateQuestionBankVOPage);
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
        List<FlowRule> rules = new ArrayList<>(FlowRuleManager.getRules());
        FlowRule rule = new FlowRule();
        // 指定资源名称，此处是要监测的方法
        rule.setResource("listQuestionBankVOByPage");
        // QPS 模式
        rule.setGrade(RuleConstant.FLOW_GRADE_QPS);
        // 阈值：10次/秒
        rule.setCount(10);
        // 添加规则
        rules.add(rule);
        // 加载规则
        FlowRuleManager.loadRules(rules);
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
    public BaseResponse<Boolean> editQuestionBank(@RequestBody QuestionBankEditRequest questionBankEditRequest, HttpServletRequest request) {
        return ResultUtils.success(questionBankService.editQuestionBank(questionBankEditRequest, request));
    }
}
