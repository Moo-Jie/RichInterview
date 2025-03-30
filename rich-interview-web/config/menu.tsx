import { MenuDataItem } from "@ant-design/pro-layout";
import { CrownOutlined } from "@ant-design/icons";

/**
 * 菜单列表
 * TODO: 具体菜单待完善
 */
export const sysMenus = [
  {
    path: "/",
    name: "主页",
  },
  {
    path: "/banks",
    name: "题库",
  },
  {
    path: "/questions",
    name: "题目",
  },
  {
    path: "/admin",
    name: "管理",
    icon: <CrownOutlined />,
    children: [
      {
        path: "/admin/user",
        name: "用户管理",
      },
      {
        path: "/admin/bank",
        name: "题库管理",
      },
      {
        path: "/admin/question",
        name: "题目管理",
      },
    ],
  },
  {
    name: "关于作者",
    path: "/aboutAuthor",
  },
] as MenuDataItem[];

// TODO 其他菜单方法待完善
// 指定路径查找菜单
export const findMenuItemByPath = (
  menus: MenuDataItem[],
  path: string,
): MenuDataItem | null => {
  // 遍历菜单列表，递归查找匹配的菜单及其子菜单
  for (const menu of menus) {
    if (menu.path === path) {
      return menu;
    }
    if (menu.children) {
      const matchedMenuItem = findMenuItemByPath(menu.children, path);
      if (matchedMenuItem) {
        return matchedMenuItem;
      }
    }
  }
  return null;
};

// 查找所有菜单
export const findAllMenuItemByPath = (path: string): MenuDataItem | null => {
  return findMenuItemByPath(sysMenus, path);
};
