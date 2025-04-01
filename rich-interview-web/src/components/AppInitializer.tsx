"use client";
import { useCallback, useEffect, ReactNode } from "react";
import {useDispatch} from "react-redux";
import {AppDispatch} from "@/store";
import {getLoginUserUsingGet} from "@/api/userController";
import {setUserLogin} from "@/store/userLogin";

interface AppInitializerProps {
  children: ReactNode;
}

/**
 * 全局初始化组件
 * @param children 子组件
 * TODO 初始化逻辑待实现 ：用户认证检查、全局配置加载、埋点初始化等
 */
export default function AppInitializer({ children }: AppInitializerProps) {
  console.log("项目初始化中......");
  // 获取dispatch触发action
  const dispatch = useDispatch<AppDispatch>();
  // 初始化全局用户状态
  const userLoginInit = useCallback(async () => {

  }, []);

  useEffect(() => {
    userLoginInit();
    console.log("项目初始化完成");
  }, [userLoginInit]);

  return <>{children}</>;
}
