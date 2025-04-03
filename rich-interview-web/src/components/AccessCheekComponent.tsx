import {useSelector} from "react-redux";
import {RootState} from "@/store";
import {usePathname} from "next/navigation";
import accessChecker from "@/access/accessChecker";
import React from "react";
import {findAllMenuByPath} from "../../config/menu";
import AccessEnum from "@/access/accessEnumeration";
import Forbidden from "@/app/Forbidden/Forbidden";

/**
 * 统一权限校验拦截器
 * @param children
 * @constructor
 */
const AccessCheekComponent: React.FC<
  Readonly<{
    children: React.ReactNode;
  }>
> = ({ children }) => {
  // 获取当前路径下的全部菜单权限
  const pathname = usePathname();
  const menu = findAllMenuByPath(pathname) || {};
  const needAccess = menu?.access ?? AccessEnum.NOT_LOGIN;
  // 获取当前登录用户信息
  const loginUser = useSelector((state: RootState) => state.userLogin);
  // 权限拦截过滤
  const canAccess = accessChecker(loginUser, needAccess);
  if (!canAccess) {
    // 触发403页面
    return <Forbidden />;
  }
  // 放行
  return <>{children}</>;
};

export default AccessCheekComponent;
