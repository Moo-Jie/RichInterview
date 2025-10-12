package com.rich.richInterview.service.impl;

import cn.hutool.core.collection.CollUtil;
import cn.hutool.json.JSONUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.rich.richInterview.common.DeleteRequest;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.CommonConstant;
import com.rich.richInterview.constant.SourceConstant;
import com.rich.richInterview.exception.BusinessException;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.mapper.QuestionMapper;
import com.rich.richInterview.model.dto.question.*;
import com.rich.richInterview.model.dto.questionBankQuestion.QuestionBankQuestionAddRequest;
import com.rich.richInterview.model.entity.Question;
import com.rich.richInterview.model.entity.QuestionBankQuestion;
import com.rich.richInterview.model.entity.QuestionHotspot;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.model.enums.ReviewStatusEnum;
import com.rich.richInterview.model.vo.QuestionVO;
import com.rich.richInterview.model.vo.UserVO;
import com.rich.richInterview.service.QuestionBankQuestionService;
import com.rich.richInterview.service.QuestionHotspotService;
import com.rich.richInterview.service.QuestionService;
import com.rich.richInterview.service.UserService;
import com.rich.richInterview.utils.SqlUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.elasticsearch.client.RequestOptions;
import org.elasticsearch.index.query.BoolQueryBuilder;
import org.elasticsearch.index.query.QueryBuilders;
import org.elasticsearch.search.sort.SortBuilder;
import org.elasticsearch.search.sort.SortBuilders;
import org.elasticsearch.search.sort.SortOrder;
import org.springframework.beans.BeanUtils;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.elasticsearch.core.ElasticsearchRestTemplate;
import org.springframework.data.elasticsearch.core.SearchHit;
import org.springframework.data.elasticsearch.core.SearchHits;
import org.springframework.data.elasticsearch.core.query.NativeSearchQuery;
import org.springframework.data.elasticsearch.core.query.NativeSearchQueryBuilder;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

// 不使用改热点探测服务注销即可
//import com.jd.platform.hotkey.client.callback.JdHotKeyStore;

/**
 * 题目服务实现
 */
@Service
@Slf4j
public class QuestionServiceImpl extends ServiceImpl<QuestionMapper, Question> implements QuestionService {

    @Resource
    private UserService userService;

    @Resource
    private QuestionBankQuestionService questionBankQuestionService;

    @Resource
    private ElasticsearchRestTemplate elasticsearchRestTemplate;

    @Lazy
    @Resource
    private QuestionHotspotService questionHotspotService;

    /**
     * 校验数据
     *
     * @param question
     * @param add      对创建的数据进行校验
     */
    @Override
    public void validQuestion(Question question, boolean add) {
        ThrowUtils.throwIf(question == null, ErrorCode.PARAMS_ERROR);
        // todo 从对象中取值
        String title = question.getTitle();
        String content = question.getContent();
        String tags = question.getTags();
        String answer = question.getAnswer();

        // 创建数据时，参数不能为空
        if (add) {
            // todo 补充校验规则
            ThrowUtils.throwIf(StringUtils.isBlank(title), ErrorCode.PARAMS_ERROR);
            ThrowUtils.throwIf(StringUtils.isBlank(content), ErrorCode.PARAMS_ERROR);
            ThrowUtils.throwIf(StringUtils.isBlank(tags), ErrorCode.PARAMS_ERROR);
            ThrowUtils.throwIf(StringUtils.isBlank(answer), ErrorCode.PARAMS_ERROR);
        }
        // 修改数据时，有参数则校验
        // todo 补充校验规则
        if (StringUtils.isNotBlank(title)) {
            ThrowUtils.throwIf(title.length() > 80, ErrorCode.PARAMS_ERROR, "标题过长");
        }
        if (StringUtils.isNotBlank(content)) {
            ThrowUtils.throwIf(title.length() > 10240, ErrorCode.PARAMS_ERROR, "题目内容过长");
        }
        if (StringUtils.isNotBlank(answer)) {
            ThrowUtils.throwIf(answer.length() > 102400, ErrorCode.PARAMS_ERROR, "答案过长");
        }
        if (StringUtils.isNotBlank(tags)) {
            ThrowUtils.throwIf(tags.length() > 256, ErrorCode.PARAMS_ERROR, "标签过长");
        }
    }

    /**
     * 获取查询条件
     *
     * @param questionQueryRequest
     * @return
     */
    @Override
    public QueryWrapper<Question> getQueryWrapper(QuestionQueryRequest questionQueryRequest) {
        QueryWrapper<Question> queryWrapper = new QueryWrapper<>();
        if (questionQueryRequest == null) {
            return queryWrapper;
        }
        // todo 从对象中取值question_review
        Long id = questionQueryRequest.getId();
        Long notId = questionQueryRequest.getNotId();
        String title = questionQueryRequest.getTitle();
        String content = questionQueryRequest.getContent();
        String searchText = questionQueryRequest.getSearchText();
        String sortField = questionQueryRequest.getSortField();
        String sortOrder = questionQueryRequest.getSortOrder();
        List<String> tagList = questionQueryRequest.getTags();
        Long userId = questionQueryRequest.getUserId();
        String answer = questionQueryRequest.getAnswer();
        Long questionBankId = questionQueryRequest.getQuestionBankId();

        // todo 补充需要的查询条件
        // 从多字段中搜索
        if (StringUtils.isNotBlank(searchText)) {
            // 需要拼接查询条件
            queryWrapper.and(qw -> qw.like("title", searchText)
                            .or().like("tags", searchText)
//                    .or().like("content", searchText)
//                    .or().like("answer", searchText)
            );
        }
        // 精确查询
        queryWrapper.ne(ObjectUtils.isNotEmpty(notId), "id", notId);
        queryWrapper.eq(ObjectUtils.isNotEmpty(id), "id", id);
        queryWrapper.eq(ObjectUtils.isNotEmpty(userId), "userId", userId);
        // JSON 数组查询
        if (CollUtil.isNotEmpty(tagList)) {
            for (String tag : tagList) {
                queryWrapper.like("tags", "\"" + tag + "\"");
            }
        }
        // 模糊查询
        queryWrapper.like(StringUtils.isNotBlank(title), "title", title);
        queryWrapper.like(StringUtils.isNotBlank(content), "content", content);
        queryWrapper.like(StringUtils.isNotBlank(answer), "answer", answer);
        // 排序规则
        queryWrapper.orderBy(SqlUtils.validSortField(sortField),
                sortOrder.equals(CommonConstant.SORT_ORDER_ASC),
                sortField);
        // 按所属题库过滤
        if (questionBankId != null) {
            // 查询题库关联的题目，取出题目id并过滤
            LambdaQueryWrapper<QuestionBankQuestion> lambdaQueryWrapper = Wrappers.lambdaQuery(QuestionBankQuestion.class)
                    //仅映射题目id字段的值
                    .select(QuestionBankQuestion::getQuestionId)
                    .eq(QuestionBankQuestion::getQuestionBankId, questionBankId);
            Set<Long> questionIds = questionBankQuestionService.list(lambdaQueryWrapper)
                    .stream()
                    .map(QuestionBankQuestion::getQuestionId)
                    .collect(Collectors.toSet());
            if (CollUtil.isEmpty(questionIds)) {
                queryWrapper.apply("1 = 0");
            } else {
                queryWrapper.in("id", questionIds);
            }
        }
        return queryWrapper;
    }

    /**
     * 获取题目封装类
     *
     * @param question
     * @param request
     * @return
     */
    @Override
    public QuestionVO getQuestionVO(Question question, HttpServletRequest request) {
        // 对象转封装类
        QuestionVO questionVO = QuestionVO.objToVo(question);

        // todo 根据需要为封装对象补充值
        // 关联查询用户信息
        Long userId = question.getUserId();
        User user = null;
        if (userId != null && userId > 0) {
            user = userService.getById(userId);
        }
        UserVO userVO = userService.getUserVO(user);
        questionVO.setUser(userVO);
        return questionVO;
    }

    /**
     * 分页获取题目封装
     *
     * @param questionPage
     * @param request
     * @return
     */
    @Override
    public Page<QuestionVO> getQuestionVOPage(Page<Question> questionPage, HttpServletRequest request) {
        List<Question> questionList = questionPage.getRecords();
        Page<QuestionVO> questionVOPage = new Page<>(questionPage.getCurrent(), questionPage.getSize(), questionPage.getTotal());
        if (CollUtil.isEmpty(questionList)) {
            return questionVOPage;
        }
        // 对象列表 => 封装对象列表
        Set<Long> questionIds = questionList.stream().map(Question::getId).collect(Collectors.toSet());
        LambdaQueryWrapper<QuestionBankQuestion> bankQuery = Wrappers.lambdaQuery(QuestionBankQuestion.class)
                .select(QuestionBankQuestion::getQuestionId, QuestionBankQuestion::getQuestionBankId)
                .in(QuestionBankQuestion::getQuestionId, questionIds);
        // 查询关联的题目和题库id映射关系
        Map<Long, Long> questionBankMap = questionBankQuestionService.list(bankQuery).stream()
                .collect(Collectors.toMap(QuestionBankQuestion::getQuestionId,
                        QuestionBankQuestion::getQuestionBankId, (v1, v2) -> v1));

        // VO转换
        List<QuestionVO> questionVOList = questionList.stream().map(question -> {
            QuestionVO vo = QuestionVO.objToVo(question);
            vo.setQuestionBankId(questionBankMap.get(question.getId())); // 设置题库ID
            return vo;
        }).collect(Collectors.toList());


        // todo 根据需要为封装对象补充值

        // 1. 关联查询用户信息
        Set<Long> userIdSet = questionList.stream().map(Question::getUserId).collect(Collectors.toSet());
        Map<Long, List<User>> userIdUserListMap = userService.listByIds(userIdSet).stream()
                .collect(Collectors.groupingBy(User::getId));
        // 2. 已登录，获取用户点赞、收藏状态
        Map<Long, Boolean> questionIdHasThumbMap = new HashMap<>();
        Map<Long, Boolean> questionIdHasFavourMap = new HashMap<>();
        User loginUser = userService.getLoginUserPermitNull(request);
        if (loginUser != null) {
            Set<Long> questionIdSet = questionList.stream().map(Question::getId).collect(Collectors.toSet());
            loginUser = userService.getLoginUser(request);
        }
        // 填充信息
        questionVOList.forEach(questionVO -> {
            Long userId = questionVO.getUserId();
            User user = null;
            if (userIdUserListMap.containsKey(userId)) {
                user = userIdUserListMap.get(userId).get(0);
            }
            questionVO.setUser(userService.getUserVO(user));
        });

        questionVOPage.setRecords(questionVOList);
        return questionVOPage;
    }

    /**
     * 分页获取题目列表（仅管理员可用）
     *
     * @param questionQueryRequest
     * @return com.baomidou.mybatisplus.extension.plugins.pagination.Page<com.rich.richInterview.model.entity.Question>
     * @author DuRuiChi
     * @create 2025/3/22
     **/
    @Override
    public Page<Question> getQuestionPage(QuestionQueryRequest questionQueryRequest) {
        long current = questionQueryRequest.getCurrent();
        long size = questionQueryRequest.getPageSize();

        // 题目表的查询条件
        QueryWrapper<Question> queryWrapper = this.getQueryWrapper(questionQueryRequest);
        // 查询数据库
        Page<Question> questionPage = this.page(new Page<>(current, size), queryWrapper);
        return questionPage;
    }

    /**
     * 创建题目（仅管理员可用）
     *
     * @param questionAddRequest
     * @param request
     * @return java.lang.Long
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    @Override
    public Long addQuestion(QuestionAddRequest questionAddRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(questionAddRequest == null, ErrorCode.PARAMS_ERROR);
        // todo 在此处将实体类和 DTO 进行转换
        Question question = new Question();
        BeanUtils.copyProperties(questionAddRequest, question);
        // tags 的转换
        if (questionAddRequest.getTags() != null) {
            question.setTags(JSONUtil.toJsonStr(questionAddRequest.getTags()));
        }
        // 数据校验
        this.validQuestion(question, true);
        // todo 填充默认值
        User loginUser = userService.getLoginUser(request);
        question.setUserId(loginUser.getId());
        question.setSource(SourceConstant.ADMIN_CREATE);
        // 管理员提供的题目默认通过审批
        question.setReviewerId(loginUser.getId());
        question.setReviewStatus(ReviewStatusEnum.PASS.getCode());
        // 写入数据库
        boolean result = this.save(question);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        // 同步题库题目关系
        if (questionAddRequest.getQuestionBankId() != null) {
            QuestionBankQuestionAddRequest addQBQRequest = new QuestionBankQuestionAddRequest();
            addQBQRequest.setQuestionBankId(questionAddRequest.getQuestionBankId());
            addQBQRequest.setQuestionId(question.getId());
            questionBankQuestionService.addQuestionBankQuestion(addQBQRequest, request);
        }

        // 返回新写入的数据 id
        return question.getId();
    }

    /**
     * 删除题目（仅管理员可用）
     *
     * @param deleteRequest
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    @Override
    public Boolean deleteQuestion(DeleteRequest deleteRequest, HttpServletRequest request) {
        if (deleteRequest == null || deleteRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        User user = userService.getLoginUser(request);
        long id = deleteRequest.getId();
        // 判断是否存在
        Question oldQuestion = this.getById(id);
        ThrowUtils.throwIf(oldQuestion == null, ErrorCode.NOT_FOUND_ERROR);
        // 仅本人或管理员可删除
        if (!oldQuestion.getUserId().equals(user.getId()) && !userService.isAdmin(request)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
        // 删除题目题库关系
        QueryWrapper<QuestionBankQuestion> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("questionId", id);
        questionBankQuestionService.remove(queryWrapper);
        // 删除题目热点数据
        QueryWrapper<QuestionHotspot> questionQueryWrapper = new QueryWrapper<>();
        questionQueryWrapper.eq("questionId", id);
        questionHotspotService.remove(questionQueryWrapper);
        // 操作数据库
        boolean result = this.removeById(id);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return true;
    }

    /**
     * 更新题目（仅管理员可用）
     *
     * @param questionUpdateRequest
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    @Override
    public Boolean updateQuestion(QuestionUpdateRequest questionUpdateRequest, HttpServletRequest request) {
        if (questionUpdateRequest == null || questionUpdateRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        // todo 在此处将实体类和 DTO 进行转换
        Question question = new Question();
        BeanUtils.copyProperties(questionUpdateRequest, question);
        // tags 的转换
        if (questionUpdateRequest.getTags() != null) {
            question.setTags(JSONUtil.toJsonStr(questionUpdateRequest.getTags()));
        }
        // 数据校验
        this.validQuestion(question, false);
        // 判断是否存在
        long id = questionUpdateRequest.getId();
        Question oldQuestion = this.getById(id);
        ThrowUtils.throwIf(oldQuestion == null, ErrorCode.NOT_FOUND_ERROR);
        // 操作数据库
        boolean result = this.updateById(question);
        // 同步题库题目关系
        if (questionUpdateRequest.getQuestionBankId() != null) {
            // 删除原有和当前题目关联的关系
            QueryWrapper<QuestionBankQuestion> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("questionId", question.getId());
            questionBankQuestionService.remove(queryWrapper);
            // 添加新的关联关系
            QuestionBankQuestionAddRequest addQBQRequest = new QuestionBankQuestionAddRequest();
            addQBQRequest.setQuestionBankId(questionUpdateRequest.getQuestionBankId());
            addQBQRequest.setQuestionId(question.getId());
            questionBankQuestionService.addQuestionBankQuestion(addQBQRequest, request);
        }
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return true;
    }

    /**
     * 分页获取当前登录用户创建的题目列表
     *
     * @param questionQueryRequest
     * @param request
     * @return com.baomidou.mybatisplus.extension.plugins.pagination.Page<com.rich.richInterview.model.vo.QuestionVO>
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    @Override
    public Page<QuestionVO> listMyQuestionVOByPage(QuestionQueryRequest questionQueryRequest, HttpServletRequest request) {
        ThrowUtils.throwIf(questionQueryRequest == null, ErrorCode.PARAMS_ERROR);
        // 补充查询条件，只查询当前登录用户的数据
        User loginUser = userService.getLoginUser(request);
        questionQueryRequest.setUserId(loginUser.getId());
        long current = questionQueryRequest.getCurrent();
        long size = questionQueryRequest.getPageSize();
        // 限制爬虫
        ThrowUtils.throwIf(size > 20, ErrorCode.PARAMS_ERROR);
        // 查询数据库
        Page<Question> questionPage = this.page(new Page<>(current, size),
                this.getQueryWrapper(questionQueryRequest));
        // 获取封装类
        return this.getQuestionVOPage(questionPage, request);
    }

    /**
     * 编辑题目（给用户使用）
     *
     * @param questionEditRequest
     * @param request
     * @return java.lang.Boolean
     * @author DuRuiChi
     * @create 2025/3/23
     **/
    @Override
    public Boolean editQuestion(QuestionEditRequest questionEditRequest, HttpServletRequest request) {
        if (questionEditRequest == null || questionEditRequest.getId() <= 0) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        // todo 在此处将实体类和 DTO 进行转换
        Question question = new Question();
        BeanUtils.copyProperties(questionEditRequest, question);
        List<String> tags = questionEditRequest.getTags();
        if (tags != null) {
            question.setTags(JSONUtil.toJsonStr(tags));
        }
        // 数据校验
        this.validQuestion(question, false);
        User loginUser = userService.getLoginUser(request);
        // 判断是否存在
        long id = questionEditRequest.getId();
        Question oldQuestion = this.getById(id);
        ThrowUtils.throwIf(oldQuestion == null, ErrorCode.NOT_FOUND_ERROR);
        // 仅本人或管理员可编辑
        if (!oldQuestion.getUserId().equals(loginUser.getId()) && !userService.isAdmin(loginUser)) {
            throw new BusinessException(ErrorCode.NO_AUTH_ERROR);
        }
        // 操作数据库
        boolean result = this.updateById(question);
        ThrowUtils.throwIf(!result, ErrorCode.OPERATION_ERROR);
        return true;
    }

    /**
     * 获取题目
     *
     * @param id
     * @return com.rich.richInterview.model.vo.QuestionVO
     * @author DuRuiChi
     * @create 2025/5/2
     **/
    @Override
    public Long getQuestionBankId(Long id) {
        if (id == null) {
            throw new BusinessException(ErrorCode.NOT_FOUND_ERROR);
        }
        Question question = this.getById(id);
        if (question == null) {
            throw new BusinessException(ErrorCode.OPERATION_ERROR);
        }
        // 返回所属题库ID
        // 查询所有questionId为id的questionBankQuestion记录
        QueryWrapper<QuestionBankQuestion> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("questionId", id);
        List<QuestionBankQuestion> questionBankQuestionList = questionBankQuestionService.list(queryWrapper);
        // 获取其id
        return questionBankQuestionList.get(0).getQuestionBankId();
    }

    /**
     * 从 ES 数据库中查询题目
     *
     * @param questionQueryRequest
     * @return com.baomidou.mybatisplus.extension.plugins.pagination.Page<com.rich.richInterview.model.entity.Question>
     * @author DuRuiChi
     * TODO ES 词典 + 接口降级
     * @create 2025/5/2
     **/
    @Override
    public Page<Question> searchFromEs(QuestionQueryRequest questionQueryRequest) {
        // 实现接口检测降级
        try {
            // 检查 ES 客户端是否初始化
            if (!isEsAvailable()) {
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "ES 服务不可用,请查看 ES 服务是否正常。");
            }

            // 正常ES查询逻辑

            // 1. 获取参数
            // 请求参数
            Long id = questionQueryRequest.getId();
            Long notId = questionQueryRequest.getNotId();
            String searchText = questionQueryRequest.getSearchText();
            List<String> tags = questionQueryRequest.getTags();
            Long questionBankId = questionQueryRequest.getQuestionBankId();
            Long userId = questionQueryRequest.getUserId();
            // 分页参数（ES页码从0开始）
            int current = questionQueryRequest.getCurrent() - 1;
            int pageSize = questionQueryRequest.getPageSize();
            // 排序参数
            String sortField = questionQueryRequest.getSortField();
            String sortOrder = questionQueryRequest.getSortOrder();

            // 2. 构造查询条件（bool类型）
            BoolQueryBuilder boolQueryBuilder = QueryBuilders.boolQuery();
            // 过滤未删除的数据
            boolQueryBuilder.filter(QueryBuilders.termQuery("isDelete", 0));
            // 过滤其他条件
            if (id != null) {
                boolQueryBuilder.filter(QueryBuilders.termQuery("id", id));
            }
            if (notId != null) {
                boolQueryBuilder.mustNot(QueryBuilders.termQuery("id", notId));
            }
            if (userId != null) {
                boolQueryBuilder.filter(QueryBuilders.termQuery("userId", userId));
            }
            if (questionBankId != null) {
                boolQueryBuilder.filter(QueryBuilders.termQuery("questionBankId", questionBankId));
            }
            // 过滤标签
            if (CollUtil.isNotEmpty(tags)) {
                for (String tag : tags) {
                    boolQueryBuilder.filter(QueryBuilders.termQuery("tags", tag));
                }
            }
            // 设置全字段匹配检索
            if (StringUtils.isNotBlank(searchText)) {
                // 在标题、内容和答案字段中匹配任意一个
                boolQueryBuilder.should(QueryBuilders.matchQuery("title", searchText));
                boolQueryBuilder.should(QueryBuilders.matchQuery("content", searchText));
                boolQueryBuilder.should(QueryBuilders.matchQuery("answer", searchText));
                // 至少匹配一个条件
                boolQueryBuilder.minimumShouldMatch(1);
            }

            //  设置排序规则
            SortBuilder<?> sortBuilder = SortBuilders.scoreSort();
            if (StringUtils.isNotBlank(sortField)) {
                // 自定义字段排序（支持升序/降序）
                sortBuilder = SortBuilders.fieldSort(sortField);
                sortBuilder.order(CommonConstant.SORT_ORDER_ASC.equals(sortOrder) ? SortOrder.ASC : SortOrder.DESC);
            }

            // 构建分页参数（ES的分页对象）
            PageRequest pageRequest = PageRequest.of(current, pageSize);

            // 组合完整查询条件
            NativeSearchQuery searchQuery = new NativeSearchQueryBuilder()
                    .withQuery(boolQueryBuilder)
                    .withPageable(pageRequest)
                    .withSorts(sortBuilder)
                    .build();

            // 3. ES 查询并转化为实体类
            // 为了保证查询灵活性，使用 ElasticsearchRestTemplate 查询
            SearchHits<QuestionEsDTO> searchHits = elasticsearchRestTemplate.search(searchQuery, QuestionEsDTO.class);
            Page<Question> page = new Page<>();
            // 设置总命中数量
            page.setTotal(searchHits.getTotalHits());
            List<Question> resourceList = new ArrayList<>();
            if (searchHits.hasSearchHits()) {
                // 转换每个命中的 ES 文档为数据库实体
                List<SearchHit<QuestionEsDTO>> searchHitList = searchHits.getSearchHits();
                for (SearchHit<QuestionEsDTO> questionEsDTOSearchHit : searchHitList) {
                    resourceList.add(QuestionEsDTO.dtoToObj(questionEsDTOSearchHit.getContent()));
                }
            }

            // 4. 分页返回结果
            page.setRecords(resourceList);
            return page;
        } catch (Exception e) {
            // 捕获所有异常（包括健康检查抛出的BusinessException）
            log.info("ES 查询异常，触发接口降级，异常信息：{}" +
                    "若使用 ES 服务，请打开配置并启动服务器", e.getMessage());
            // 降级到数据库查询
            // ES 排序方式和数据库排序方式不一致，需要重新设置排序字段
            if (!CommonConstant.SORT_ORDER_ASC.equals(questionQueryRequest.getSortOrder())
                    && !CommonConstant.SORT_ORDER_DESC.equals(questionQueryRequest.getSortOrder())) {
                questionQueryRequest.setSortOrder(CommonConstant.SORT_ORDER_ASC);
            }
            if (!"id".equals(questionQueryRequest.getSortField())) {
                questionQueryRequest.setSortField("id");
            }
            // ES 分页方式和数据库分页方式不一致，需要重新设置分页参数
            return getQuestionPage(questionQueryRequest);
        }
    }

    /**
     * 根据题目id查询题目封装类
     * @param id
     * @param request
     * @return com.rich.richInterview.model.vo.QuestionVO
     * @author DuRuiChi
     * @create 2025/5/2
     **/
    @Override
    public QuestionVO getQuestionVOById(Long id, HttpServletRequest request) {
        // HotKey

        /* 规则备份：
                [
                  {
                    "duration": 600,
                        "key": "question_detail_",
                        "prefix": true,
                        "interval": 5,
                        "threshold": 10,
                        "desc": "热门题目 HotKey 缓存：首先判断 question_detail_ 开头的 key，如果 5 秒访问次数达到 10 次，就会指认为HotKey 被添加到缓存中，为期10 分钟，到期后从 JVM 中清除，变回普通 Key"
                  }
                ]
        */

        // 生成 question_detail_ 开头的 key ，应当与数据库内设定好的热点探测规则匹配
        // String key = "question_detail_" + id;

        // 响应缓存内容
        // 通过 JD-HotKey-Client 内置方法，判断是否被指认为 HotKey
//        if (JdHotKeyStore.isHotKey(key)) {
//            // 尝试从本地缓存中获取缓存值
//            Object cachedQuestionVO = JdHotKeyStore.get(key);
//            // 如果缓存值存在，响应缓存的值
//            if (cachedQuestionVO != null) {
//                return (QuestionVO) cachedQuestionVO;
//            }
//        }


        // TODO 校验是否会员题目
        ThrowUtils.throwIf(id <= 0, ErrorCode.PARAMS_ERROR);
        // 查询数据库
        Question question = this.getById(id);
        ThrowUtils.throwIf(question == null, ErrorCode.NOT_FOUND_ERROR);
        // 获取封装类

        // 缓存查询结果
        // 通过 JD-HotKey-Client 内置方法，直接将查询结果缓存到本地 Caffeine 缓存中
//        JdHotKeyStore.smartSet(key, questionVO);
        return this.getQuestionVO(question, request);
    }

    /**
     * 分页获取题目列表（仅包含基础信息）
     * @param questionQueryRequest
     * @return com.baomidou.mybatisplus.extension.plugins.pagination.Page<com.rich.richInterview.model.entity.Question>
     * @author DuRuiChi
     * @create 2025/9/27
     **/
    @Override
    public Page<Question> getQuestionSimplePage(QuestionQueryRequest questionQueryRequest) {
        QueryWrapper<Question> queryWrapper = this.getQueryWrapper(questionQueryRequest);
        // 排除answer字段
        queryWrapper.select(Question.class, info ->
                !info.getColumn().equals("answer"));
        return this.page(new Page<>(questionQueryRequest.getCurrent(), questionQueryRequest.getPageSize()), queryWrapper);
    }

    /**
     * 检查 ES 客户端配置是否存在
     *
     * @return boolean
     * @author DuRuiChi
     * @create 2025/5/4
     **/
    private boolean isEsAvailable() {
        try {
            // execute 方法用于执行一个操作，这里是检查 ES 客户端是否可用
            return elasticsearchRestTemplate.execute(client -> {
                try {
                    // 尝试ping ES服务器 ， RequestOptions.DEFAULT 是请求选项的默认值
                    return client.ping(RequestOptions.DEFAULT);
                } catch (IOException e) {
                    return false;
                }
            });
        } catch (Exception e) {
            log.info("ES 初始化状态健康检查异常,若使用 ES 服务,请打开配置并启动服务器:{}", e.getMessage());
            return false;
        }
    }
}
