import {MenuDataItem} from "@ant-design/pro-layout";
import {
    BookOutlined,
    CrownOutlined,
    DatabaseOutlined,
    EditOutlined,
    HomeOutlined,
    InfoCircleOutlined,
    MoreOutlined,
    QuestionCircleOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";
import AccessEnumeration from "@/access/accessEnumeration";

/**
 * 菜单列表
 * TODO: 具体菜单待完善
 */
export const sysMenus = [
  {
    path: "/",
    name: "主页",
    icon: <HomeOutlined />,
    access: AccessEnumeration.NOT_LOGIN,
  },
  {
    path: "/banks",
    name: "题库",
    icon: <BookOutlined />,
    access: AccessEnumeration.USER,
  },
  {
    path: "/questions",
    name: "题目",
    icon: <QuestionCircleOutlined />,
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
        icon: <TeamOutlined />,
        access: AccessEnumeration.ADMIN,
      },
      {
        path: "/admin/bank",
        name: "题库管理",
        icon: <DatabaseOutlined />,
        access: AccessEnumeration.ADMIN,
      },
      {
        path: "/admin/question",
        name: "题目管理",
        icon: <EditOutlined />,
        access: AccessEnumeration.ADMIN,
      },
    ],
  },
  {
    name: "其他",
    path: "/other",
    icon: <MoreOutlined />,
    access: AccessEnumeration.NOT_LOGIN,
    children: [
      {
        path: "/other/aboutAuthor",
        name: "关于作者",
        icon: <UserOutlined />,
        access: AccessEnumeration.NOT_LOGIN,
      },
      {
        path: "/other/aboutRichInterview",
        name: "关于项目",
        icon: <InfoCircleOutlined />,
        access: AccessEnumeration.NOT_LOGIN,
      },
    ],
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
