package com.rich.richInterview.service.impl;

import cn.hutool.core.collection.CollUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.CommonConstant;
import com.rich.richInterview.exception.ThrowUtils;
import com.rich.richInterview.mapper.LearnPathMapper;
import com.rich.richInterview.model.dto.learnPath.LearnPathQueryRequest;
import com.rich.richInterview.model.entity.LearnPath;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.model.vo.LearnPathVO;
import com.rich.richInterview.model.vo.UserVO;
import com.rich.richInterview.service.LearnPathService;
import com.rich.richInterview.service.UserService;
import com.rich.richInterview.utils.SqlUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 学习路线关系服务实现
 *
 */
@Service
@Slf4j
public class LearnPathServiceImpl extends ServiceImpl<LearnPathMapper, LearnPath> implements LearnPathService {

    @Resource
    private UserService userService;

    /**
     * 校验数据
     *
     * @param learnPath
     * @param add      对创建的数据进行校验
     */
    @Override
    public void validLearnPath(LearnPath learnPath, boolean add) {
        ThrowUtils.throwIf(learnPath == null, ErrorCode.PARAMS_ERROR);
        // todo 从对象中取值
        String title = learnPath.getTitle();
        // 创建数据时，参数不能为空
        if (add) {
            // todo 补充校验规则
            ThrowUtils.throwIf(StringUtils.isBlank(title), ErrorCode.PARAMS_ERROR);
        }
        // 修改数据时，有参数则校验
        // todo 补充校验规则
        if (StringUtils.isNotBlank(title)) {
            ThrowUtils.throwIf(title.length() > 80, ErrorCode.PARAMS_ERROR, "标题过长");
        }
    }

    /**
     * 获取查询条件
     *
     * @param learnPathQueryRequest
     * @return
     */
    @Override
    public QueryWrapper<LearnPath> getQueryWrapper(LearnPathQueryRequest learnPathQueryRequest) {
        QueryWrapper<LearnPath> queryWrapper = new QueryWrapper<>();
        if (learnPathQueryRequest == null) {
            return queryWrapper;
        }
        // todo 从对象中取值
        Long id = learnPathQueryRequest.getId();
        Long notId = learnPathQueryRequest.getNotId();
        String title = learnPathQueryRequest.getTitle();
        String content = learnPathQueryRequest.getContent();
        String searchText = learnPathQueryRequest.getSearchText();
        String sortField = learnPathQueryRequest.getSortField();
        String sortOrder = learnPathQueryRequest.getSortOrder();
        List<String> tagList = learnPathQueryRequest.getTags();
        Long userId = learnPathQueryRequest.getUserId();
        // todo 补充需要的查询条件
        // 从多字段中搜索
        if (StringUtils.isNotBlank(searchText)) {
            // 需要拼接查询条件
            queryWrapper.and(qw -> qw.like("title", searchText).or().like("content", searchText));
        }
        // 模糊查询
        queryWrapper.like(StringUtils.isNotBlank(title), "title", title);
        queryWrapper.like(StringUtils.isNotBlank(content), "content", content);
        // JSON 数组查询
        if (CollUtil.isNotEmpty(tagList)) {
            for (String tag : tagList) {
                queryWrapper.like("tags", "\"" + tag + "\"");
            }
        }
        // 精确查询
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
     * 获取学习路线关系封装
     *
     * @param learnPath
     * @param request
     * @return
     */
    @Override
    public LearnPathVO getLearnPathVO(LearnPath learnPath, HttpServletRequest request) {
        // 对象转封装类
        LearnPathVO learnPathVO = LearnPathVO.objToVo(learnPath);

        // todo 根据需要为封装对象补充值

        // 1. 关联查询用户信息
        Long userId = learnPath.getUserId();
        User user = null;
        if (userId != null && userId > 0) {
            user = userService.getById(userId);
        }
        UserVO userVO = userService.getUserVO(user);
        learnPathVO.setUser(userVO);
        // 2. 已登录，获取用户点赞、收藏状态
//        long learnPathId = learnPath.getId();
//        User loginUser = userService.getLoginUserPermitNull(request);
//        if (loginUser != null) {
//            // 获取点赞
//            QueryWrapper<LearnPathThumb> learnPathThumbQueryWrapper = new QueryWrapper<>();
//            learnPathThumbQueryWrapper.in("learnPathId", learnPathId);
//            learnPathThumbQueryWrapper.eq("userId", loginUser.getId());
//            LearnPathThumb learnPathThumb = learnPathThumbMapper.selectOne(learnPathThumbQueryWrapper);
//            learnPathVO.setHasThumb(learnPathThumb != null);
//            // 获取收藏
//            QueryWrapper<LearnPathFavour> learnPathFavourQueryWrapper = new QueryWrapper<>();
//            learnPathFavourQueryWrapper.in("learnPathId", learnPathId);
//            learnPathFavourQueryWrapper.eq("userId", loginUser.getId());
//            LearnPathFavour learnPathFavour = learnPathFavourMapper.selectOne(learnPathFavourQueryWrapper);
//            learnPathVO.setHasFavour(learnPathFavour != null);
//        }


        return learnPathVO;
    }

    /**
     * 分页获取学习路线关系封装
     *
     * @param learnPathPage
     * @param request
     * @return
     */
    @Override
    public Page<LearnPathVO> getLearnPathVOPage(Page<LearnPath> learnPathPage, HttpServletRequest request) {
        List<LearnPath> learnPathList = learnPathPage.getRecords();
        Page<LearnPathVO> learnPathVOPage = new Page<>(learnPathPage.getCurrent(), learnPathPage.getSize(), learnPathPage.getTotal());
        if (CollUtil.isEmpty(learnPathList)) {
            return learnPathVOPage;
        }
        // 对象列表 => 封装对象列表
        List<LearnPathVO> learnPathVOList = learnPathList.stream().map(learnPath -> {
            return LearnPathVO.objToVo(learnPath);
        }).collect(Collectors.toList());

        // todo 根据需要为封装对象补充值

        // 1. 关联查询用户信息
        Set<Long> userIdSet = learnPathList.stream().map(LearnPath::getUserId).collect(Collectors.toSet());
        Map<Long, List<User>> userIdUserListMap = userService.listByIds(userIdSet).stream()
                .collect(Collectors.groupingBy(User::getId));
        // 2. 已登录，获取用户点赞、收藏状态
//        Map<Long, Boolean> learnPathIdHasThumbMap = new HashMap<>();
//        Map<Long, Boolean> learnPathIdHasFavourMap = new HashMap<>();
//        User loginUser = userService.getLoginUserPermitNull(request);
//        if (loginUser != null) {
//            Set<Long> learnPathIdSet = learnPathList.stream().map(LearnPath::getId).collect(Collectors.toSet());
//            loginUser = userService.getLoginUser(request);
//            // 获取点赞
//            QueryWrapper<LearnPathThumb> learnPathThumbQueryWrapper = new QueryWrapper<>();
//            learnPathThumbQueryWrapper.in("learnPathId", learnPathIdSet);
//            learnPathThumbQueryWrapper.eq("userId", loginUser.getId());
//            List<LearnPathThumb> learnPathLearnPathThumbList = learnPathThumbMapper.selectList(learnPathThumbQueryWrapper);
//            learnPathLearnPathThumbList.forEach(learnPathLearnPathThumb -> learnPathIdHasThumbMap.put(learnPathLearnPathThumb.getLearnPathId(), true));
//            // 获取收藏
//            QueryWrapper<LearnPathFavour> learnPathFavourQueryWrapper = new QueryWrapper<>();
//            learnPathFavourQueryWrapper.in("learnPathId", learnPathIdSet);
//            learnPathFavourQueryWrapper.eq("userId", loginUser.getId());
//            List<LearnPathFavour> learnPathFavourList = learnPathFavourMapper.selectList(learnPathFavourQueryWrapper);
//            learnPathFavourList.forEach(learnPathFavour -> learnPathIdHasFavourMap.put(learnPathFavour.getLearnPathId(), true));
//        }
        // 填充信息
        learnPathVOList.forEach(learnPathVO -> {
            Long userId = learnPathVO.getUserId();
            User user = null;
            if (userIdUserListMap.containsKey(userId)) {
                user = userIdUserListMap.get(userId).get(0);
            }
            learnPathVO.setUser(userService.getUserVO(user));
//            learnPathVO.setHasThumb(learnPathIdHasThumbMap.getOrDefault(learnPathVO.getId(), false));
//            learnPathVO.setHasFavour(learnPathIdHasFavourMap.getOrDefault(learnPathVO.getId(), false));
        });


        learnPathVOPage.setRecords(learnPathVOList);
        return learnPathVOPage;
    }

}
