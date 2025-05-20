"use client";
import {ReactNode, useCallback, useEffect} from "react";
import {useDispatch} from "react-redux";
import {AppDispatch} from "@/store";
import {getLoginUserUsingGet} from "@/api/userController";
import {setUserLogin} from "@/store/userLogin";
import {DEFAULT_USER} from "@/constant/ConstantUserMsg";

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
    const res = await getLoginUserUsingGet();
    if (res.data) {
      dispatch(setUserLogin(res.data as API.LoginUserVO));
    } else dispatch(setUserLogin(DEFAULT_USER));
  }, []);

  useEffect(() => {
    console.log("项目初始化中......");
    // TODO 其他初始化逻辑待实现
    userLoginInit().then(() => {
      console.log("用户登录初始化完成");
    });
  }, [userLoginInit]);

  return <>{children}</>;
}
