"use client";
import { useCallback, useEffect, ReactNode } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { getLoginUserUsingGet } from "@/api/userController";
import { setUserLogin } from "@/store/userLogin";

interface AppInitializerProps {
  children: ReactNode;
}

/**
 * 全局初始化组件
 * @param children 子组件
 */
export default function AppInitializer({ children }: AppInitializerProps) {
  console.log("项目初始化中......");
  // 获取dispatch触发action
  const dispatch = useDispatch<AppDispatch>();

  // 初始化全局用户状态
  const userLoginInit = useCallback(async () => {
    // TODO 初始化逻辑待实现 ：用户认证检查、全局配置加载、埋点初始化等
    try {
      const res = await getLoginUserUsingGet();
      // TODO 排除登录注册页面
      if (res.data) {
        // 刷新用户信息
      } else {
        // 跳转登录注册界面
      }
    } catch (error) {
      console.error("初始化失败:", error);
    } finally {
    }
  }, [dispatch]);

  useEffect(() => {
    console.log("项目初始化中......");
    userLoginInit().then(() => {
      console.log("项目初始化完成");
    });
  }, [userLoginInit]);

  return <>{children}</>;
}
