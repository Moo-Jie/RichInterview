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
import com.rich.richInterview.model.dto.question.QuestionAddRequest;
import com.rich.richInterview.model.dto.question.QuestionEditRequest;
import com.rich.richInterview.model.dto.question.QuestionQueryRequest;
import com.rich.richInterview.model.dto.question.QuestionUpdateRequest;
import com.rich.richInterview.model.dto.questionBank.QuestionBankQueryRequest;
import com.rich.richInterview.model.entity.Question;
import com.rich.richInterview.model.vo.QuestionBankVO;
import com.rich.richInterview.model.vo.QuestionVO;
import com.rich.richInterview.service.QuestionService;
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
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
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
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
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
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
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

        // 生成 question_detail_ 开头的 key ，应当与数据库内设定好的热点探测规则匹配
//         规则备份：
//                [
//                  {
//                    "duration": 600,
//                        "key": "question_detail_",
//                        "prefix": true,
//                        "interval": 5,
//                        "threshold": 10,
//                        "desc": "热门题目 HotKey 缓存：首先判断 question_detail_ 开头的 key，如果 5 秒访问次数达到 10 次，就会指认为HotKey 被添加到缓存中，为期10 分钟，到期后从 JVM 中清除，变回普通 Key"
//                  }
//                ]
        // 不使用改热点探测服务注销即可
//        String key = "question_detail_" + id;

        // 响应缓存内容
        // 通过 JD-HotKey-Client 内置方法，判断是否被指认为 HotKey
//        if (JdHotKeyStore.isHotKey(key)) {
//            // 尝试从本地缓存中获取缓存值
//            Object cachedQuestionVO = JdHotKeyStore.get(key);
//            // 如果缓存值存在，响应缓存的值
//            if (cachedQuestionVO != null) {
//                return ResultUtils.success((QuestionVO) cachedQuestionVO);
//            }
//        }
        // TODO 校验是否会员题目
        ThrowUtils.throwIf(id <= 0, ErrorCode.PARAMS_ERROR);
        // 查询数据库
        Question question = questionService.getById(id);
        ThrowUtils.throwIf(question == null, ErrorCode.NOT_FOUND_ERROR);
        // 获取封装类
        QuestionVO questionVO = questionService.getQuestionVO(question, request);
        // 缓存查询结果
        // 通过 JD-HotKey-Client 内置方法，直接将查询结果缓存到本地 Caffeine 缓存中
//        JdHotKeyStore.smartSet(key, questionVO);

        // 获取封装类
        return ResultUtils.success(questionVO);
    }

    /**
     * 分页获取题目列表（仅管理员可用）
     *
     * @param questionQueryRequest
     * @return
     */
    @PostMapping("/list/page")
    @AuthCheck(mustRole = UserConstant.ADMIN_ROLE)
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
    @SentinelResource(value = "listQuestionVOByPage",
            blockHandler = "handleBlockException",
            fallback = "handleFallback")
    public BaseResponse<Page<QuestionVO>> listQuestionVOByPage(@RequestBody QuestionQueryRequest questionQueryRequest,
                                                               HttpServletRequest request) {
        initFlowRules();
        long size = questionQueryRequest.getPageSize();
        // TODO 安全性配置
        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        // 查询数据库
        Page<Question> questionPage = questionService.getQuestionPage(questionQueryRequest);
        // 获取封装类
        return ResultUtils.success(questionService.getQuestionVOPage(questionPage, request));
    }

    /**
     * Sintel 流控：触发异常熔断后的降级服务
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
        rule.setResource("listQuestionVOByPage");
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
     *
     * @param questionQueryRequest
     * @param request
     * @param ex
     * @author DuRuiChi
     * @create 2025/5/27
     **/
    public BaseResponse<Page<QuestionVO>> handleBlockException(@RequestBody QuestionQueryRequest questionQueryRequest,
                                                                   HttpServletRequest request, BlockException ex) {
        // 过滤普通降级操作
        if (ex instanceof DegradeException) {
            return handleFallback(questionQueryRequest, request, ex);
        }
        // 系统高压限流降级操作
        return ResultUtils.error(ErrorCode.SYSTEM_ERROR, "系统压力稍大，请耐心等待哟~");
    }

    /**
     * 分页获取当前登录用户创建的题目列表
     *
     * @param questionQueryRequest
     * @param request
     * @return
     */
    @PostMapping("/my/list/page/vo")
    public BaseResponse<Page<QuestionVO>> listMyQuestionVOByPage(@RequestBody QuestionQueryRequest questionQueryRequest,
                                                                 HttpServletRequest request) {
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
    public BaseResponse<Page<QuestionVO>> searchQuestionVOByPage(@RequestBody QuestionQueryRequest questionQueryRequest,
                                                                 HttpServletRequest request) {
        long size = questionQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 200, ErrorCode.PARAMS_ERROR);
        Page<Question> questionPage = questionService.searchFromEs(questionQueryRequest);
        return ResultUtils.success(questionService.getQuestionVOPage(questionPage, request));
    }

}
