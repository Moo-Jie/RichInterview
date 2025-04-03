"use client";
import { ReactNode, useCallback, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { getLoginUserUsingGet } from "@/api/userController";
import { setUserLogin } from "@/store/userLogin";
import ACCESS_ENUM from "@/access/accessEnumeration";
import { ConstantMsg } from "../../public/constant/ConstantMsg";

interface AppInitializerProps {
  children: ReactNode;
}

/**
 * 全局初始化组件
 * @param children 子组件
 */
export default function AppInitializerComponent({
  children,
}: AppInitializerProps) {
  // 获取dispatch触发action
  const dispatch = useDispatch<AppDispatch>();

  // 初始化全局用户状态
  const userLoginInit = useCallback(async () => {
    // TODO 初始化逻辑待实现
    try {
      const res = await getLoginUserUsingGet();
      // TODO 排除登录注册页面
      if (res.data) {
        // 刷新用户信息
        // dispatch(setUserLogin(res.data));
      } else {
        // 跳转登录注册界面
        const testUser = {
          userName: "MOJIE",
          id: 1,
          userAvatar: ConstantMsg.AUTHOR_AVATAR,
          userRole: ACCESS_ENUM.USER,
        };
        dispatch(setUserLogin(testUser));
      }
    } catch (error) {
      console.error("初始化失败:", error);
    } finally {
    }
  }, [dispatch]);

  useEffect(() => {
    console.log("项目初始化中......");
    // TODO 其他初始化逻辑待实现
    userLoginInit().then(() => {
      console.log("用户登录初始化完成");
    });
  }, [userLoginInit]);

  return <>{children}</>;
}
