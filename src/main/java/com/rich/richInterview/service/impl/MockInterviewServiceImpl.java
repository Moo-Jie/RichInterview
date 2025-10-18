package com.rich.richInterview.service.impl;

import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.CommonConstant;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.mapper.MockInterviewMapper;
import com.rich.richInterview.model.dto.mockInterview.MockInterviewChatRecord;
import com.rich.richInterview.model.dto.mockInterview.MockInterviewEventRequest;
import com.rich.richInterview.model.dto.mockInterview.MockInterviewQueryRequest;
import com.rich.richInterview.model.entity.MockInterview;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.model.enums.MockInterviewEventEnum;
import com.rich.richInterview.model.enums.MockInterviewStatusEnum;
import com.rich.richInterview.service.MockInterviewService;
import com.rich.richInterview.manager.AiChatManager;
import com.rich.richInterview.utils.SqlUtils;
import com.volcengine.ark.runtime.model.completion.chat.ChatMessage;
import com.volcengine.ark.runtime.model.completion.chat.ChatMessageRole;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.List;

/**
 * 模拟面试服务实现
 */
@Service
@Slf4j
public class MockInterviewServiceImpl extends ServiceImpl<MockInterviewMapper, MockInterview> implements MockInterviewService {
    @Resource
    private AiChatManager aiChatManager;

    /**
     * 校验数据
     *
     * @param mockInterview
     * @param add   对创建的数据进行校验
     */
    @Override
    public void validMockInterview(MockInterview mockInterview, boolean add) {
        ThrowUtils.throwIf(mockInterview == null, ErrorCode.PARAMS_ERROR);
        String workExperience = mockInterview.getWorkExperience();
        String jobPosition = mockInterview.getJobPosition();
        String difficulty = mockInterview.getDifficulty();

        // 创建数据时，参数不能为空
        if (add) {
            // todo 补充校验规则
            ThrowUtils.throwIf(StringUtils.isBlank(workExperience), ErrorCode.PARAMS_ERROR);
            ThrowUtils.throwIf(StringUtils.isBlank(jobPosition), ErrorCode.PARAMS_ERROR);
            ThrowUtils.throwIf(StringUtils.isBlank(difficulty), ErrorCode.PARAMS_ERROR);
        }
    }

    /**
     * 获取查询条件
     *
     * @param mockInterviewQueryRequest
     * @return
     */
    @Override
    public QueryWrapper<MockInterview> getQueryWrapper(MockInterviewQueryRequest mockInterviewQueryRequest) {
        QueryWrapper<MockInterview> queryWrapper = new QueryWrapper<>();
        if (mockInterviewQueryRequest == null) {
            return queryWrapper;
        }
        // todo 从对象中取值
        Long id = mockInterviewQueryRequest.getId();
        String workExperience = mockInterviewQueryRequest.getWorkExperience();
        String jobPosition = mockInterviewQueryRequest.getJobPosition();
        String difficulty = mockInterviewQueryRequest.getDifficulty();
        Long userId = mockInterviewQueryRequest.getUserId();
        String sortField = mockInterviewQueryRequest.getSortField();
        String sortOrder = mockInterviewQueryRequest.getSortOrder();

        // todo 补充需要的查询条件
        // 模糊查询
        queryWrapper.like(StringUtils.isNotBlank(workExperience), "workExperience", workExperience);
        queryWrapper.like(StringUtils.isNotBlank(jobPosition), "jobPosition", jobPosition);
        queryWrapper.like(StringUtils.isNotBlank(difficulty), "difficulty", difficulty);
        queryWrapper.like(StringUtils.isNotBlank(jobPosition), "jobPosition", jobPosition);
        // 精确查询
        queryWrapper.eq(ObjectUtils.isNotEmpty(id), "id", id);
        queryWrapper.eq(ObjectUtils.isNotEmpty(userId), "userId", userId);
        // 排序规则
        queryWrapper.orderBy(SqlUtils.validSortField(sortField),
                sortOrder.equals(CommonConstant.SORT_ORDER_ASC),
                sortField);
        return queryWrapper;
    }

    /**
     * 进行模拟面试对话事件  TODO
     *
     * @param mockInterviewEventRequest
     * @param loginUser
     * @return java.lang.String
     * @author DuRuiChi
     * @create 2025/6/11
     **/
    @Override
    public String doChatEvent(MockInterviewEventRequest mockInterviewEventRequest, User loginUser) {
        // 获取当前对话记录的事件状态
        Long id = mockInterviewEventRequest.getId();
        ThrowUtils.throwIf(id == null, ErrorCode.NOT_FOUND_ERROR, "请求参数错误");
        MockInterview mockInterview = this.getById(id);
        ThrowUtils.throwIf(mockInterview == null, ErrorCode.NOT_FOUND_ERROR, "面试记录不存在");
        ThrowUtils.throwIf(!mockInterview.getUserId().equals(loginUser.getId()), ErrorCode.PARAMS_ERROR, "请求参数错误");
        String event = mockInterviewEventRequest.getEvent();
        MockInterviewEventEnum mockInterviewEventEnum = MockInterviewEventEnum.fromEventValue(event);

        // 构建上下文
        String workExperience = mockInterview.getWorkExperience();
        String jobPosition = mockInterview.getJobPosition();
        String difficulty = mockInterview.getDifficulty();

        String sysPrompt = "你是一位严厉的程序员面试官，我是候选人。\n" +
                "我是来应聘" + jobPosition + "这份工作岗位的，\n" +
                "我的工作经历为" + workExperience + "，\n" +
                "你为我提供的面试难度为" + difficulty + "。\n" +
                "请你向我依次提出问题（最多 5 个问题），我会依次进行回复。\n" +
                "你的说话口吻：\n" +
                "1.说话要符合面试官严厉、凝练的口吻。\n" +
                "2.面对面试者的任何与问题无关的、挑衅的、开玩笑的回答等等，不要予以正面回应，而是保持稳重，并进行十分严厉地警告对方要专注于面试。\n" +
                "3.不要问回答太驳杂的问题，最好让求职者能用几句话回答上来，而不是让求职者长篇大论，并且只要概括重点即可，如有落下的点，也可以接受，但是不能过于不尽人意。\n" +
                "面试流程务必要满足以下要求：\n" +
                "1. 开始面试——只有当求职者说类似于 “开始面试” 的指令时，你要正式开始面试，如果没有下达类似的指令，你要不断地告知——请说“开始面试”以开始面试。\n" +
                "2. 被动结束——当求职者说类似于 “结束面试” 时，你要立即结束面试。\n" +
                "3. 主动结束——当面试题数量问完，或求职者前几次的回答都不尽人意，专业能力不满足当前工作岗位，亦或者态度不好、不礼貌、回答内容总是和问题无关，你必须主动结束面试。" +
                "（但你不要轻易主动结束面试，如果面试者回答的多次不好，但好在能说个大概，也不要主动结束）\n" +
                "4. 面试结束前——要告知最后的结束语，应当对面试者每次的回答进行评估，并告知 录用/未录用 的原因，" +
                "如果是主动结束的面试，要告知原因（“你的能力过差......”、“你的 态度/素质 是不尽人意的......”）。\n" +
                "5. 面试结束后——首先结合面试者的历史回答进行总结，再之后无论面试者说任何话,有任何要求，都只回复“【面试结束，请重新开启对话】”这一段字符，不要换添加或减少，因为“【面试结束，请重新开启对话】”是系统判断对话结束的标识。\n";

        // 通过事件状态进行不同业务
        return switch (mockInterviewEventEnum) {
            case START -> startChatEvent(sysPrompt, id);
            case CHAT -> inProgressEvent(mockInterview, mockInterviewEventRequest.getMessage(), id);
            case END -> endChatEvent(mockInterview, id);
        };
    }

    /**
     * 结束对话事件
     * @param mockInterview
     * @param id
     * @return java.lang.String
     * @author DuRuiChi
     * @create 2025/6/17
     **/
    private String endChatEvent(MockInterview mockInterview, Long id) {
        // 从数据库中获取序列化后的历史消息，反序列化为 MockInterviewChatRecord，再转化为 ChatMessage 消息列表
        String endMessagesStr = mockInterview.getMessages();
        List<ChatMessage> endMessages = new ArrayList<>(AiChatManager
                .mockInterviewChatRecordToChatMessage(JSONUtil
                        .parseArray(endMessagesStr)
                        .toList(MockInterviewChatRecord.class)));
        // 构造结束对话，并添加到消息列表
        String endMsgPrompt = "结束面试";
        final ChatMessage endMessage = ChatMessage.builder().role(ChatMessageRole.USER).content(endMsgPrompt).build();
        endMessages.add(endMessage);

        // 获取 AI 最后的结束语，并保存到消息列表
        String aiChatEndMsg = aiChatManager.aiChat(endMessages);
        final ChatMessage aiEndMessage = ChatMessage.builder().role(ChatMessageRole.ASSISTANT).content(aiChatEndMsg).build();
        endMessages.add(aiEndMessage);

        // 维护对话记录到数据库
        MockInterview updateEndMockInterview = new MockInterview();
        updateEndMockInterview.setId(id);
        updateEndMockInterview.setStatus(MockInterviewStatusEnum.FINISHED.getCode());
        // 存储消息列表
        // 将火山 SDK 内封装的对话消息列表 ChatMessage ， 简化为本系统的对话消息列表 MockInterviewChatRecord，用于存储到数据库中
        List<MockInterviewChatRecord> mockInterviewEndChatRecords = AiChatManager.chatMessageToMockInterviewChatRecord(endMessages);
        String endMsgJsonStr = JSONUtil.toJsonStr(mockInterviewEndChatRecords);
        updateEndMockInterview.setMessages(endMsgJsonStr);
        boolean result03 = this.updateById(updateEndMockInterview);
        ThrowUtils.throwIf(!result03, ErrorCode.SUCCESS, "对话已完成，但模拟面试记录更新失败");
        // 响应内容
        return aiChatEndMsg;
    }

    /**
     * 进行中对话事件
     * @param mockInterview
     * @param mockInterviewEventRequest
     * @param id
     * @return java.lang.String
     * @author DuRuiChi
     * @create 2025/6/17
     **/
    private String inProgressEvent(MockInterview mockInterview, String mockInterviewEventRequest, Long id) {
        // 从数据库中获取序列化后的历史消息，反序列化为 MockInterviewChatRecord，再转化为 ChatMessage 消息列表
        String inProgressMessagesStr = mockInterview.getMessages();
        List<ChatMessage> inProgressMessages = new ArrayList<>(AiChatManager
                .mockInterviewChatRecordToChatMessage(JSONUtil
                        .parseArray(inProgressMessagesStr)
                        .toList(MockInterviewChatRecord.class)));
        // 构造对话，并添加到消息列表
        final ChatMessage inProgressMessage = ChatMessage.builder().role(ChatMessageRole.USER).content(mockInterviewEventRequest).build();
        inProgressMessages.add(inProgressMessage);

        // 开启对话,保存 AI 对话到消息列表，用于后续的对话
        String aiChatInProgressMsg = aiChatManager.aiChat(inProgressMessages);


        final ChatMessage aiInProgressMessage = ChatMessage.builder().role(ChatMessageRole.ASSISTANT).content(aiChatInProgressMsg).build();
        inProgressMessages.add(aiInProgressMessage);

        // 维护对话记录到数据库
        MockInterview updateInProgressMockInterview = new MockInterview();
        updateInProgressMockInterview.setId(id);
        // 若 AI 主动结束面试,则更新状态为结束
        if (aiChatInProgressMsg.contains("【面试结束，请重新开启对话】")) {
            updateInProgressMockInterview.setStatus(MockInterviewStatusEnum.FINISHED.getCode());
        }
        // 存储消息列表
        // 将火山 SDK 内封装的对话消息列表 ChatMessage ， 简化为本系统的对话消息列表 MockInterviewChatRecord，用于存储到数据库中
        List<MockInterviewChatRecord> mockInterviewInProgressChatRecords = AiChatManager.chatMessageToMockInterviewChatRecord(inProgressMessages);
        String inProgressMsgJsonStr = JSONUtil.toJsonStr(mockInterviewInProgressChatRecords);
        updateInProgressMockInterview.setMessages(inProgressMsgJsonStr);
        boolean result02 = this.updateById(updateInProgressMockInterview);
        ThrowUtils.throwIf(!result02, ErrorCode.SUCCESS, "对话已完成，但模拟面试记录更新失败");
        // 响应内容
        return aiChatInProgressMsg;
    }

    /**
     * 开始对话事件
     * @param sysPrompt
     * @param id
     * @return java.lang.String
     * @author DuRuiChi
     * @create 2025/6/17
     **/
    private String startChatEvent(String sysPrompt, Long id) {
        // 构造消息列表，用于存储用户的消息
        final List<ChatMessage> newMessages = new ArrayList<>();
        final ChatMessage systemMessage = ChatMessage.builder().role(ChatMessageRole.SYSTEM).content(sysPrompt).build();
        String startMsgPrompt = "开始面试";
        final ChatMessage userMessage = ChatMessage.builder().role(ChatMessageRole.USER).content(startMsgPrompt).build();
        newMessages.add(systemMessage);
        newMessages.add(userMessage);
        // 开启对话,保存 AI 对话到消息列表，用于后续的对话
        String aiChatMsg = aiChatManager.aiChat(newMessages);
        final ChatMessage aiMessage = ChatMessage.builder().role(ChatMessageRole.ASSISTANT).content(aiChatMsg).build();
        newMessages.add(aiMessage);

        // 维护对话记录到数据库
        MockInterview updateStartMockInterview = new MockInterview();
        updateStartMockInterview.setId(id);
        updateStartMockInterview.setStatus(MockInterviewStatusEnum.IN_PROGRESS.getCode());
        // 存储消息列表
        // 将火山 SDK 内封装的对话消息列表 ChatMessage ， 简化为本系统的对话消息列表 MockInterviewChatRecord，序列化为 JSON 后存储到数据库中
        List<MockInterviewChatRecord> mockInterviewStartChatRecords = AiChatManager.chatMessageToMockInterviewChatRecord(newMessages);
        String startMsgJsonStr = JSONUtil.toJsonStr(mockInterviewStartChatRecords);
        updateStartMockInterview.setMessages(startMsgJsonStr);
        boolean result = this.updateById(updateStartMockInterview);
        ThrowUtils.throwIf(!result, ErrorCode.SUCCESS, "对话已完成，但模拟面试记录更新失败");
        // 响应内容
        return aiChatMsg;
    }
}
