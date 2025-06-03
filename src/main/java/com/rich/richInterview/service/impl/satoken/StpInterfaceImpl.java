package com.rich.richInterview.service.impl.satoken;

import cn.dev33.satoken.stp.StpInterface;
import cn.dev33.satoken.stp.StpUtil;
import com.rich.richInterview.model.entity.User;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static com.rich.richInterview.constant.UserConstant.USER_LOGIN_STATE;

/**
 * Sa-Token 官方建议的 权限列表、角色列表 缓存查询接口实现类
 * 源：
 * https://sa-token.cc/doc.html#/use/jur-auth
 * https://gitee.com/dromara/sa-token/blob/master/sa-token-demo/sa-token-demo-case/src/main/java/com/pj/satoken/StpInterfaceImpl.java
 *
 * 因为每个项目的需求不同，其权限设计也千变万化，
 * 因此 [ 获取当前账号权限码集合 ] 这一操作不可能内置到框架中，
 * 所以 Sa-Token 将此操作以接口的方式暴露给开发者，以方便你根据自己的业务逻辑进行重写
 *
 * @author DuRuiChi
 * @return
 * @create 2025/6/2
 **/
@Component
public class StpInterfaceImpl implements StpInterface {

    /**
     * 从缓存查询指定用户的权限列表
     *
     * @param loginId   账号ID，即调用 StpUtil.login(id) 时写入的标识值
     * @param loginType 账号体系标识，此处忽略，用于多账户认证
     * @return 权限列表
     * @author DuRuiChi
     * @create 2025/6/2
     */
    @Override
    public List<String> getPermissionList(Object loginId, String loginType) {
        // TODO 细粒度区分权限
//        List<String> list = new ArrayList<String>();
//        list.add("101");
//        list.add("user.add");
//        list.add("user.update");
//        list.add("user.get");
//         list.add("user.delete");
//        list.add("art.*");
        return new ArrayList<>();
    }

    /**
     * 从缓存查询指定用户的角色列表
     *
     * @param loginId   账号ID，即调用 StpUtil.login(id) 时写入的标识值
     * @param loginType 账号体系标识，此处忽略，用于多账户认证
     * @return 角色列表
     * @author DuRuiChi
     * @create 2025/6/2
     */
    @Override
    public List<String> getRoleList(Object loginId, String loginType) {
        // 通过 Sa - Token 提供的工具类 StpUtil 获取当前用户登陆时存储的 SaSession 本地缓存对象
        // 通过 get 获取 dataMap 属性中存放的当前登录的用户的 User 对象
        User user = (User) StpUtil.getSessionByLoginId(loginId).get(USER_LOGIN_STATE);
        // 封装为不可变列表返回
        return Collections.singletonList(user.getUserRole());
    }

}
