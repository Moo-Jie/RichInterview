import { MenuDataItem } from "@ant-design/pro-layout";
import { CrownOutlined } from "@ant-design/icons";
import AccessEnumeration from "@/access/accessEnumeration";

/**
 * 菜单列表
 * TODO: 具体菜单待完善
 */
export const sysMenus = [
  {
    path: "/",
    name: "主页",
    access: AccessEnumeration.NOT_LOGIN,
  },
  {
    path: "/banks",
    name: "题库",
    access: AccessEnumeration.USER,
  },
  {
    path: "/questions",
    name: "题目",
    access: AccessEnumeration.USER,
  },
  {
    path: "/admin",
    name: "管理",
    icon: <CrownOutlined />,
    access: AccessEnumeration.ADMIN,
    children: [
      {
        path: "/admin/user",
        name: "用户管理",
        access: AccessEnumeration.ADMIN,
      },
      {
        path: "/admin/bank",
        name: "题库管理",
        access: AccessEnumeration.ADMIN,
      },
      {
        path: "/admin/question",
        name: "题目管理",
        access: AccessEnumeration.ADMIN,
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
export const findMenuByPath = (
  menus: MenuDataItem[],
  path: string,
): MenuDataItem | null => {
  // 遍历菜单列表，递归查找匹配的菜单及其子菜单
  for (const menu of menus) {
    if (menu.path === path) {
      return menu;
    }
    if (menu.children) {
      const matchedMenuItem = findMenuByPath(menu.children, path);
      if (matchedMenuItem) {
        return matchedMenuItem;
      }
    }
  }
  return null;
};

// 查找所有菜单
export const findAllMenuByPath = (path: string): MenuDataItem | null => {
  return findMenuByPath(sysMenus, path);
};
