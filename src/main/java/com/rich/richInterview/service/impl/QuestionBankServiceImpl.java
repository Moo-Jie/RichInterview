package com.rich.richInterview.service.impl;

import cn.hutool.core.collection.CollUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.rich.richInterview.common.DeleteRequest;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.CommonConstant;
import com.rich.richInterview.constant.UserConstant;
import com.rich.richInterview.exception.BusinessException;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.mapper.QuestionBankMapper;
import com.rich.richInterview.model.dto.question.QuestionQueryRequest;
import com.rich.richInterview.model.dto.questionBank.QuestionBankAddRequest;
import com.rich.richInterview.model.dto.questionBank.QuestionBankEditRequest;
import com.rich.richInterview.model.dto.questionBank.QuestionBankQueryRequest;
import com.rich.richInterview.model.dto.questionBank.QuestionBankUpdateRequest;
import com.rich.richInterview.model.entity.QuestionBank;
import com.rich.richInterview.model.entity.QuestionBankHotspot;
import com.rich.richInterview.model.entity.QuestionBankQuestion;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.model.vo.QuestionBankVO;
import com.rich.richInterview.model.vo.UserVO;
import com.rich.richInterview.service.*;
import com.rich.richInterview.utils.SqlUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
// 不使用改热点探测服务注销即可
//import com.jd.platform.hotkey.client.callback.JdHotKeyStore;

/**
 * 题库服务实现
 */
@Service
@Slf4j
public class QuestionBankServiceImpl extends ServiceImpl<QuestionBankMapper, QuestionBank> implements QuestionBankService {

    @Resource
    private UserService userService;

    @Resource
    private QuestionService questionService;

    @Resource
    @Lazy
    private QuestionBankHotspotService questionBankHotspotService;

    @Resource
    @Lazy
    private QuestionBankQuestionService questionBankQuestionService;
    ;

    /**
     * 校验数据
     *
     * @param questionBank
     * @param add          对创建的数据进行校验
     */
    @Override
    public void validQuestionBank(QuestionBank questionBank, boolean add) {
        ThrowUtils.throwIf(questionBank == null, ErrorCode.PARAMS_ERROR);
        // todo 从对象中取值
        String title = questionBank.getTitle();
        String description = questionBank.getDescription();

        // 创建数据时，参数不能为空
        if (add) {
            // todo 补充校验规则
            ThrowUtils.throwIf(StringUtils.isBlank(title), ErrorCode.PARAMS_ERROR);
            ThrowUtils.throwIf(StringUtils.isBlank(description), ErrorCode.PARAMS_ERROR);
        }
        // 修改数据时，有参数则校验
        if (StringUtils.isNotBlank(title)) {
            ThrowUtils.throwIf(title.length() > 100, ErrorCode.PARAMS_ERROR, "标题过长");
        }
        if (StringUtils.isNotBlank(description)) {
            ThrowUtils.throwIf(description.length() > 10240, ErrorCode.PARAMS_ERROR, "描述过长");
        }
        // todo 补充校验规则 : 审批流状态校验
    }

    /**
     * 获取查询条件
     *
     * @param questionBankQueryRequest
     * @return
     */
    @Override
    public QueryWrapper<QuestionBank> getQueryWrapper(QuestionBankQueryRequest questionBankQueryRequest) {
        QueryWrapper<QuestionBank> queryWrapper = new QueryWrapper<>();
        if (questionBankQueryRequest == null) {
            return queryWrapper;
        }
        // todo 从对象中取值
        Long id = questionBankQueryRequest.getId();
        Long notId = questionBankQueryRequest.getNotId();
        String title = questionBankQueryRequest.getTitle();
        String content = questionBankQueryRequest.getContent();
        String searchText = questionBankQueryRequest.getSearchText();
        String sortField = questionBankQueryRequest.getSortField();
        String sortOrder = questionBankQueryRequest.getSortOrder();
        Long userId = questionBankQueryRequest.getUserId();
        String picture = questionBankQueryRequest.getPicture();
        String description = questionBankQueryRequest.getDescription();

        // todo 补充需要的查询条件
        // 从多字段中搜索
        if (StringUtils.isNotBlank(searchText)) {
            // 需要拼接查询条件，同时在标题、内容、描述中搜索
            queryWrapper.and(qw -> qw.like("title", searchText).or().like("content", searchText).or().like("description", searchText));
        }
        // 模糊查询
        queryWrapper.like(StringUtils.isNotBlank(title), "title", title);
        queryWrapper.like(StringUtils.isNotBlank(content), "content", content);
        queryWrapper.like(StringUtils.isNotBlank(description), "description", description);
        // 精确查询
        queryWrapper.ne(ObjectUtils.isNotEmpty(picture), "picture", picture);
        queryWrapper.ne(ObjectUtils.isNotEmpty(notId), "id", notId);
        queryWrapper.eq(ObjectUtils.isNotEmpty(id), "id", id);
        queryWrapper.eq(ObjectUtils.isNotEmpty(userId), "userId", userId);
        // 排序规则
        queryWrapper.orderBy(SqlUtils.validSortField(sortField),
                sortOrder.equals(CommonConstant.SORT_ORDER_ASC),
                sortField);
        return queryWrapper;
    }

    /**
     * 获取题库封装
     *
     * @param questionBank
     * @param request
     * @return
     */
    @Override
    public QuestionBankVO getQuestionBankVO(QuestionBank questionBank, HttpServletRequest request) {
        // 对象转封装类
        QuestionBankVO questionBankVO = QuestionBankVO.objToVo(questionBank);

        // todo 根据需要为封装对象补充值

        // 关联查询用户信息
        Long userId = questionBank.getUserId();
        User user = null;
        if (userId != null && userId > 0) {
            user = userService.getById(userId);
        }
        UserVO userVO = userService.getUserVO(user);
        questionBankVO.setUser(userVO);

        return questionBankVO;
    }

    /**
     * 分页获取题库封装
     *
     * @param questionBankPage
     * @param request
     * @return
     */
    @Override
    public Page<QuestionBankVO> getQuestionBankVOPage(Page<QuestionBank> questionBankPage, HttpServletRequest request) {
        List<QuestionBank> questionBankList = questionBankPage.getRecords();
        Page<QuestionBankVO> questionBankVOPage = new Page<>(questionBankPage.getCurrent(), questionBankPage.getSize(), questionBankPage.getTotal());
        if (CollUtil.isEmpty(questionBankList)) {
            return questionBankVOPage;
        }
        // 对象列表 => 封装对象列表
        List<QuestionBankVO> questionBankVOList = questionBankList.stream().map(questionBank -> QuestionBankVO.objToVo(questionBank)).collect(Collectors.toList());

        // todo 根据需要为封装对象补充值

        // 1关联查询用户信息
        Set<Long> userIdSet = questionBankList.stream().map(QuestionBank::getUserId).collect(Collectors.toSet());
        Map<Long, List<User>> userIdUserListMap = userService.listByIds(userIdSet).stream()
                .collect(Collectors.groupingBy(User::getId));
        // 填充信息
        questionBankVOList.forEach(questionBankVO -> {
            Long userId = questionBankVO.getUserId();
            User user = null;
            if (userIdUserListMap.containsKey(userId)) {
                user = userIdUserListMap.get(userId).get(0);
            }
            questionBankVO.setUser(userService.getUserVO(user));

        });


        questionBankVOPage.setRecords(questionBankVOList);
        return questionBankVOPage;
    }

    /**
     * 创建题库(仅管理员权限)
     *
     * @param questionBankAddRequest
     * @param request
     * @return java.lang.Long
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    @Override
    public Long addQuestionBank(QuestionBankAddRequest questionBankAddRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(questionBankAddRequest == null, ErrorCode.PARAMS_ERROR);
        // todo 在此处将实体类和 DTO 进行转换
        QuestionBank questionBank = new QuestionBank();
        BeanUtils.copyProperties(questionBankAddRequest, questionBank);
        // 数据校验
        this.validQuestionBank(questionBank, true);
        // todo 填充默认值
        User loginUser = userService.getLoginUser(request);
        questionBank.setUserId(loginUser.getId());
        String picture = questionBank.getPicture();
        if (picture == null || picture.isEmpty()) {
            questionBank.setPicture(UserConstant.DEFAULT_QUESTION_BANK_PICTURE);
        }

        // 写入数据库
        boolean result = this.save(questionBank);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        // 返回新写入的数据 id
        long newQuestionBankId = questionBank.getId();
        return newQuestionBankId;
    }

    /**
     * 删除题库(仅管理员权限)
     *
     * @param deleteRequest
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    @Override
    public Boolean deleteQuestionBank(DeleteRequest deleteRequest, HttpServletRequest request) {
        if (deleteRequest == null || deleteRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        User user = userService.getLoginUser(request);
        long id = deleteRequest.getId();
        // 判断是否存在
        QuestionBank oldQuestionBank = this.getById(id);
        ThrowUtils.throwIf(oldQuestionBank == null, ErrorCode.NOT_FOUND_ERROR);
        // 仅本人或管理员可删除
        if (!oldQuestionBank.getUserId().equals(user.getId()) && !userService.isAdmin(request)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
        // 若存在关联问题，则不允许删除
        QueryWrapper<QuestionBankQuestion> questionBankQuestionQueryWrapper = new QueryWrapper<>();
        questionBankQuestionQueryWrapper.eq("questionBankId", id);
        long count = questionBankQuestionService.count(questionBankQuestionQueryWrapper);
        if (count > 0) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR, "该题库存在关联的问题，请先移除与问题的关联");
        }
        // 删除题库热点数据
        QueryWrapper<QuestionBankHotspot> questionBankHotspotQueryWrapper = new QueryWrapper<>();
        questionBankHotspotQueryWrapper.eq("questionBankId", id);
        questionBankHotspotService.remove(questionBankHotspotQueryWrapper);
        // 操作数据库
        boolean result = this.removeById(id);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return true;
    }

    /**
     * 更新题库(仅管理员权限)
     *
     * @param questionBankUpdateRequest
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    @Override
    public Boolean updateQuestionBank(QuestionBankUpdateRequest questionBankUpdateRequest) {
        if (questionBankUpdateRequest == null || questionBankUpdateRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        // todo 在此处将实体类和 DTO 进行转换
        QuestionBank questionBank = new QuestionBank();
        BeanUtils.copyProperties(questionBankUpdateRequest, questionBank);
        // 数据校验
        this.validQuestionBank(questionBank, false);
        // 判断是否存在
        long id = questionBankUpdateRequest.getId();
        QuestionBank oldQuestionBank = this.getById(id);
        ThrowUtils.throwIf(oldQuestionBank == null, ErrorCode.NOT_FOUND_ERROR);
        // 操作数据库
        boolean result = this.updateById(questionBank);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return true;
    }

    /**
     * 根据 id 获取题库详情（封装类）
     *
     * @param questionBankQueryRequest
     * @param request
     * @return com.rich.richInterview.model.vo.QuestionBankVO
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    @Override
    public QuestionBankVO getQuestionBankVOById(QuestionBankQueryRequest questionBankQueryRequest, HttpServletRequest request) {
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
//                return (QuestionBankVO) cachedQuestionBankVO;
//            }
//        }
        // 查询数据库
        QuestionBank questionBank = this.getById(id);
        ThrowUtils.throwIf(questionBank == null, ErrorCode.NOT_FOUND_ERROR);
        // 题库封装类
        QuestionBankVO questionBankVO = this.getQuestionBankVO(questionBank, request);
        // 是否要查询题库下的题目集
        boolean needQueryQuestionList = questionBankQueryRequest.getQueryQuestionsFlag();
        if (needQueryQuestionList) {
            QuestionQueryRequest questionQueryRequest = new QuestionQueryRequest();
            questionQueryRequest.setQuestionBankId(id);
            questionQueryRequest.setPageSize(questionBankQueryRequest.getQuestionsPageSize());
            questionQueryRequest.setCurrent(questionBankQueryRequest.getQuestionsCurrent());
            // 封装VO
            questionBankVO.setQuestionsPage(questionService.getQuestionSimplePage(questionQueryRequest));
        }

        // 缓存查询结果
        // 通过 JD-HotKey-Client 内置方法，直接将查询结果缓存到本地 Caffeine 缓存中
//        JdHotKeyStore.smartSet(key, questionBankVO);

        // 获取封装类
        return questionBankVO;
    }

    @Override
    public Boolean editQuestionBank(QuestionBankEditRequest questionBankEditRequest, HttpServletRequest request) {
        if (questionBankEditRequest == null || questionBankEditRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        // todo 在此处将实体类和 DTO 进行转换
        QuestionBank questionBank = new QuestionBank();
        BeanUtils.copyProperties(questionBankEditRequest, questionBank);
        // 数据校验
        this.validQuestionBank(questionBank, false);
        User loginUser = userService.getLoginUser(request);
        // 判断是否存在
        long id = questionBankEditRequest.getId();
        QuestionBank oldQuestionBank = this.getById(id);
        ThrowUtils.throwIf(oldQuestionBank == null, ErrorCode.NOT_FOUND_ERROR);
        // 仅本人或管理员可编辑
        if (!oldQuestionBank.getUserId().equals(loginUser.getId()) && !userService.isAdmin(loginUser)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
        // 操作数据库
        boolean result = this.updateById(questionBank);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return true;
    }

}
