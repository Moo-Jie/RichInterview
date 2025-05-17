import AccessEnumeration from "@/access/accessEnumeration";

/**
 * 初始化登录用户信息
 */
export const DEFAULT_USER: API.LoginUserVO = {
  userName: "游客",
  userProfile: "暂无",
  userAvatar: "/assets/pictures/userNotLogin.png",
  userRole: AccessEnumeration.NOT_LOGIN,
} as const;
