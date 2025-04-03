import accessChecker from "@/access/accessChecker";
import {sysMenus} from "../../../config/menu";

/**
 * 获取有权限、可访问的菜单
 * @param loginUser
 * @param menuItems
 */
const showMenuByUserAccess = (
  loginUser: API.LoginUserVO,
  menuItems = sysMenus,
) => {
  // 获取当前登录用户可访问的菜单集
  return menuItems.reduce((acc: typeof sysMenus, item) => {
    // 权限校验：无访问权限则跳过当前菜单项
    if (!accessChecker(loginUser, item.access)) return acc;

    // 深度优先遍历来递归校验其子菜单
    const newItem = { ...item };
    if (newItem.children) {
      newItem.children = showMenuByUserAccess(loginUser, newItem.children);
    }

    // 将通过校验的菜单项加入结果集
    acc.push(newItem);
    return acc;
  }, []);
};

export default showMenuByUserAccess;
