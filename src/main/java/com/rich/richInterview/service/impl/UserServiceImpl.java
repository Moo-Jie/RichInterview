package com.rich.richInterview.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.hutool.core.collection.CollUtil;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.rich.richInterview.common.ErrorCode;
import com.rich.richInterview.constant.CommonConstant;
import com.rich.richInterview.constant.RedisConstant;
import com.rich.richInterview.exception.BusinessException;
import com.rich.richInterview.mapper.UserMapper;
import com.rich.richInterview.model.dto.user.UserQueryRequest;
import com.rich.richInterview.model.entity.User;
import com.rich.richInterview.model.enums.UserRoleEnum;
import com.rich.richInterview.model.vo.LoginUserVO;
import com.rich.richInterview.model.vo.UserVO;
import com.rich.richInterview.service.UserService;
import com.rich.richInterview.utils.SaTokenLoginDeviceUtils;
import com.rich.richInterview.utils.SqlUtils;
import lombok.extern.slf4j.Slf4j;
import me.chanjar.weixin.common.bean.WxOAuth2UserInfo;
import org.apache.commons.lang3.StringUtils;
import org.redisson.api.RBitSet;
import org.redisson.api.RedissonClient;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.DigestUtils;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.BitSet;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import static com.rich.richInterview.constant.UserConstant.USER_LOGIN_STATE;

/**
 * 用户服务实现类
 *
 * @author DuRuiChi
 * @return
 * @create 2025/3/20
 **/
@Service
@Slf4j
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements UserService {

    @Resource
    // 注入 Redisson 客户端
    private RedissonClient redissonClient;

    /**
     * 加密盐值
     */
    public static final String SALT = "rich";

    @Override
    public long userRegister(String userAccount, String userPassword, String checkPassword, String userAavatar, String userProfile, String userName) {
        // 1. 校验
        if (StringUtils.isAnyBlank(userAccount, userPassword, checkPassword, userName)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "参数为空");
        }
        if (userAccount.length() < 4) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户账号过短");
        }
        if (userPassword.length() < 8 || checkPassword.length() < 8) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户密码过短");
        }
        if (userProfile.length() >= 100) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户简介过长");
        }
        // 密码和校验密码相同
        if (!userPassword.equals(checkPassword)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "两次输入的密码不一致");
        }
        synchronized (userAccount.intern()) {
            // 账户不能重复
            QueryWrapper<User> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("userAccount", userAccount);
            long count = this.baseMapper.selectCount(queryWrapper);
            if (count > 0) {
                throw new BusinessException(ErrorCode.PARAMS_ERROR, "账号重复");
            }
            // 2. 加密
            String encryptPassword = DigestUtils.md5DigestAsHex((SALT + userPassword).getBytes());
            // 3. 插入数据
            User user = new User();
            user.setUserAccount(userAccount);
            user.setUserPassword(encryptPassword);
            user.setUserAvatar(userAavatar);
            user.setUserProfile(userProfile);
            user.setUserName(userName);
            boolean saveResult = this.save(user);
            if (!saveResult) {
                throw new BusinessException(ErrorCode.SYSTEM_ERROR, "注册失败，数据库错误");
            }
            return user.getId();
        }
    }

    /**
     * 用户登录
     * Sa-Token:https://sa-token.cc/doc.html#/use/login-auth
     * @param userAccount
     * @param userPassword
     * @param request
     * @return com.rich.richInterview.model.vo.LoginUserVO
     * @author DuRuiChi
     * @create 2025/6/3
     **/
    @Override
    public LoginUserVO userLogin(String userAccount, String userPassword, HttpServletRequest request) {
        // 1. 校验
        if (StringUtils.isAnyBlank(userAccount, userPassword)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "参数为空");
        }
        if (userAccount.length() < 4) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "账号错误");
        }
        if (userPassword.length() < 8) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "密码错误");
        }
        // 2. 加密
        String encryptPassword = DigestUtils.md5DigestAsHex((SALT + userPassword).getBytes());
        // 查询用户是否存在
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq("userAccount", userAccount);
        queryWrapper.eq("userPassword", encryptPassword);
        User user = this.baseMapper.selectOne(queryWrapper);
        // 用户不存在
        if (user == null) {
            log.info("用户登录失败，userAccount与userPassword不匹配");
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户不存在或密码错误");
        }
        // 3. 记录用户的登录态
        // 弃用 severlet 方式存储登录态
//        request.getSession().setAttribute(USER_LOGIN_STATE, user);
        // Sa-Token 框架存储登录态,并指定登录设备类型，实现同端登录互斥
        // TODO 设备类型多样化：PC端、移动端、小程序端
        StpUtil.login(user.getId(), SaTokenLoginDeviceUtils.getUserDevice(request));
        // 将当前用户数据存入 Sa-Token 提供的缓存 Session 中，用于后续操作
        StpUtil.getSession().set(USER_LOGIN_STATE, user);
        return this.getLoginUserVO(user);
    }

    /**
     * 用户登录（微信开放平台）
     * Sa-Token:https://sa-token.cc/doc.html#/use/login-auth
     * @param wxOAuth2UserInfo
     * @param request
     * @return com.rich.richInterview.model.vo.LoginUserVO
     * @author DuRuiChi
     * @create 2025/6/3
     **/
    @Override
    public LoginUserVO userLoginByMpOpen(WxOAuth2UserInfo wxOAuth2UserInfo, HttpServletRequest request) {
        String unionId = wxOAuth2UserInfo.getUnionId();
        String mpOpenId = wxOAuth2UserInfo.getOpenid();
        // 单机锁
        synchronized (unionId.intern()) {
            // 查询用户是否已存在
            QueryWrapper<User> queryWrapper = new QueryWrapper<>();
            queryWrapper.eq("unionId", unionId);
            User user = this.getOne(queryWrapper);
            // 被封号，禁止登录
            if (user != null && UserRoleEnum.BAN.getValue().equals(user.getUserRole())) {
                throw new BusinessException(ErrorCode.FORBIDDEN_ERROR, "该用户已被封，禁止登录");
            }
            // 用户不存在则创建
            if (user == null) {
                user = new User();
                user.setUnionId(unionId);
                user.setMpOpenId(mpOpenId);
                user.setUserAvatar(wxOAuth2UserInfo.getHeadImgUrl());
                user.setUserName(wxOAuth2UserInfo.getNickname());
                boolean result = this.save(user);
                if (!result) {
                    throw new BusinessException(ErrorCode.SYSTEM_ERROR, "登录失败");
                }
            }
            // 记录用户的登录态
            StpUtil.getSession().set(USER_LOGIN_STATE, user);
            return getLoginUserVO(user);
        }
    }

    /**
     * 获取当前登录用户
     * Sa-Token:https://sa-token.cc/doc.html#/use/login-auth
     * @param request
     * @return
     */
    @Override
    public User getLoginUser(HttpServletRequest request) {
        // 从 Sa-Token 提供的方法中获取当前用户 id
        Object loginId = StpUtil.getLoginIdDefaultNull();
        if (Objects.isNull(loginId)) {
            throw new BusinessException(ErrorCode.NOT_LOGIN_ERROR);
        }

        // 由于用户数据变更不频繁，暂不从数据库查询
//        return  this.getById((String) loginId);

        // 返回缓存中的用户数据
        // 通过 Sa - Token 提供的工具类 StpUtil 获取当前用户登陆时存储的 SaSession 本地缓存对象
        // 通过 get 获取 dataMap 属性中存放的当前登录的用户的 User 对象
        return (User) StpUtil.getSessionByLoginId(loginId).get(USER_LOGIN_STATE);
    }

    /**
     * 获取当前登录用户（允许未登录）
     * Sa-Token:https://sa-token.cc/doc.html#/use/login-auth
     * @param request
     * @return
     */
    @Override
    public User getLoginUserPermitNull(HttpServletRequest request) {
        // 从 Sa-Token 提供的方法中获取当前用户 id
        Object loginId = StpUtil.getLoginIdDefaultNull();
        if (Objects.isNull(loginId)) {
            return null;
        }

        // 由于用户数据变更不频繁，暂不从数据库查询
//        return  this.getById((String) loginId);

        // 返回缓存中的用户数据
        // 通过 Sa - Token 提供的工具类 StpUtil 获取当前用户登陆时存储的 SaSession 本地缓存对象
        // 通过 get 获取 dataMap 属性中存放的当前登录的用户的 User 对象
        User user = (User) StpUtil.getSessionByLoginId(loginId).get(USER_LOGIN_STATE);
        if (user == null || user.getId() == null) {
            return null;
        }
        return user;
    }

    /**
     * 是否为管理员
     * Sa-Token:https://sa-token.cc/doc.html#/use/login-auth
     * @param request
     * @return
     */
    @Override
    public boolean isAdmin(HttpServletRequest request) {
        // 仅管理员可查询
        // Object userObj = request.getSession().getAttribute(USER_LOGIN_STATE);
        Object userObj = StpUtil.getSession().get(USER_LOGIN_STATE);

        User user = (User) userObj;
        return isAdmin(user);
    }

    @Override
    public boolean isAdmin(User user) {
        return user != null && UserRoleEnum.ADMIN.getValue().equals(user.getUserRole());
    }

    /**
     * 用户注销
     * Sa-Token:https://sa-token.cc/doc.html#/use/login-auth
     * @param request
     */
    @Override
    public boolean userLogout(HttpServletRequest request) {
        // 检查登录
        StpUtil.checkLogin();
        // 执行注销
        StpUtil.logout();
        return true;
    }

    @Override
    public LoginUserVO getLoginUserVO(User user) {
        if (user == null) {
            return null;
        }
        LoginUserVO loginUserVO = new LoginUserVO();
        BeanUtils.copyProperties(user, loginUserVO);
        return loginUserVO;
    }

    @Override
    public UserVO getUserVO(User user) {
        if (user == null) {
            return null;
        }
        UserVO userVO = new UserVO();
        BeanUtils.copyProperties(user, userVO);
        return userVO;
    }

    @Override
    public List<UserVO> getUserVO(List<User> userList) {
        if (CollUtil.isEmpty(userList)) {
            return new ArrayList<>();
        }
        return userList.stream().map(this::getUserVO).collect(Collectors.toList());
    }

    @Override
    public QueryWrapper<User> getQueryWrapper(UserQueryRequest userQueryRequest) {
        if (userQueryRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "请求参数为空");
        }
        Long id = userQueryRequest.getId();
        String unionId = userQueryRequest.getUnionId();
        String mpOpenId = userQueryRequest.getMpOpenId();
        String userName = userQueryRequest.getUserName();
        String userProfile = userQueryRequest.getUserProfile();
        String userRole = userQueryRequest.getUserRole();
        String sortField = userQueryRequest.getSortField();
        String sortOrder = userQueryRequest.getSortOrder();
        QueryWrapper<User> queryWrapper = new QueryWrapper<>();
        queryWrapper.eq(id != null, "id", id);
        queryWrapper.eq(StringUtils.isNotBlank(unionId), "unionId", unionId);
        queryWrapper.eq(StringUtils.isNotBlank(mpOpenId), "mpOpenId", mpOpenId);
        queryWrapper.eq(StringUtils.isNotBlank(userRole), "userRole", userRole);
        queryWrapper.like(StringUtils.isNotBlank(userProfile), "userProfile", userProfile);
        queryWrapper.like(StringUtils.isNotBlank(userName), "userName", userName);
        queryWrapper.orderBy(SqlUtils.validSortField(sortField), sortOrder.equals(CommonConstant.SORT_ORDER_ASC), sortField);
        return queryWrapper;
    }

    /**
     * 添加用户签到记录
     *
     * @param userId
     * @return boolean
     * @author DuRuiChi
     * @create 2025/4/18
     **/
    public boolean addUserSignIn(long userId) {
        LocalDate date = LocalDate.now();
        // 拼接Redis存储键：用户签到记录按年份存储（格式：user:sign:2024:123）
        String key = RedisConstant.getUserSignInRedisKey(date.getYear(), userId);
        // 使用 Redission 自带的 BitSet数据结构 来存储用户签到记录
        RBitSet signInBitSet = redissonClient.getBitSet(key);
        // 作为偏移量（从 1 开始计数），表示当天是一年中的第几天
        int offset = date.getDayOfYear();
        // 当天是否签到
        if (!signInBitSet.get(offset)) {
            // 执行签到
            return signInBitSet.set(offset, true);
        }
        // 当天已签到
        return true;
    }

    /**
     * 获取用户签到记录
     *
     * @param userId
     * @param year
     * @return java.util.List<java.lang.Integer>
     * @author DuRuiChi
     * @create 2025/4/18
     **/
    @Override
    public List<Integer> getUserSignInRecord(long userId, Integer year) {
        // 如果未指定年份，默认使用当前年份
        if (year == null) {
            LocalDate date = LocalDate.now();
            year = date.getYear();
        }
        // 拼接Redis存储键：用户签到记录按年份存储（格式：user:sign:2024:123）
        String key = RedisConstant.getUserSignInRedisKey(year, userId);
        RBitSet signInBitSet = redissonClient.getBitSet(key);
        // 加载 BitSet 到内存中，避免后续读取时发送多次请求
        BitSet bitSet = signInBitSet.asBitSet();

        // 统计签到的日期（存储从1开始计算的日偏移量）
        List<Integer> dayList = new ArrayList<>();
        // 从索引 0 开始查找下一个被设置为 1 的位，使用性能更好的实现
        int index = bitSet.nextSetBit(0);
        while (index >= 0) {
            // 位偏移量转换为从1开始的天数（索引0对应第1天）
            dayList.add(index);
            // 查找下一个被设置为 1 的位
            index = bitSet.nextSetBit(index + 1);
        }
        return dayList;
    }
}
