import ACCESS_ENUM from "@/access/accessEnumeration";

/**
 * 全局权限校验器
 * @param loginUser 登录用户对象
 * @param needAccess 所需权限集合
 */
const accessChecker = (loginUser: API.LoginUserVO, needAccess = ACCESS_ENUM.NOT_LOGIN) => {
  // 获取并校验权限
  const loginUserAccess = loginUser?.userRole ?? ACCESS_ENUM.NOT_LOGIN;
  // 1.未登录即可访问
  if (needAccess === ACCESS_ENUM.NOT_LOGIN) {
    return true;
  }
  // 2.登录即可访问
  if (needAccess === ACCESS_ENUM.USER) {
    // 未登录
    if (loginUserAccess === ACCESS_ENUM.NOT_LOGIN) {
      return false;
    }
  }
  // 3.VIP用户即可即可访问
  if (needAccess === ACCESS_ENUM.VIP) {
    // 未登录
    if (loginUserAccess === ACCESS_ENUM.VIP) {
      return false;
    }
  }
  // 4.管理员即可访问
  if (needAccess === ACCESS_ENUM.ADMIN) {
    // 非管理员
    if (loginUserAccess !== ACCESS_ENUM.ADMIN) {
      return false;
    }
  }
  return true;
};

export default accessChecker;
