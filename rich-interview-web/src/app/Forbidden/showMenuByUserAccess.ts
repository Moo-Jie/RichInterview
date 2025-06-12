import accessChecker from "@/access/accessChecker";
import { sysMenus } from "../../../config/menu";
import AccessEnumeration from "@/access/accessEnumeration";

/**
 * 获取有权限、可访问的菜单
 * @param loginUser
 * @param menuItems
 */
const showMenuByUserAccess = (
  loginUser: API.LoginUserVO,
  menuItems = sysMenus,
) => {
  return menuItems.reduce((acc: typeof sysMenus, item) => {
    // 管理员菜单直接隐藏（只有管理员可见）
    if (
      item.access === AccessEnumeration.ADMIN &&
      loginUser.userRole !== AccessEnumeration.ADMIN
    ) {
      return acc;
    }

    const hasAccess = accessChecker(loginUser, item.access);
    // 保留需要登录的菜单项但标记为禁用
    const shouldDisable =
      !hasAccess &&
      [AccessEnumeration.USER, AccessEnumeration.VIP].includes(item.access);

    const newItem = {
      ...item,
      disabled: shouldDisable,
      children: item.children
        ? showMenuByUserAccess(loginUser, item.children)
        : undefined,
    };

    acc.push(newItem);
    return acc;
  }, []);
};

export default showMenuByUserAccess;
