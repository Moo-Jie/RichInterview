/**
 * 权限枚举类
 */
const ACCESS_ENUM = {
  // 普通用户权限
  USER: "user",
  // VIP权限
  VIP: "vip",
  VIP_READ: "vipRead",
  // 普通读写权限
  READ: "read",
  WRITE: "write",
  // 管理员权限
  ADMIN: "admin",
  ADMIN_READ: "adminRead",
  ADMIN_WRITE: "adminWrite",
  ADMIN_READ_WRITE: "adminReadWrite",
  // 未登录
  NOT_LOGIN: "notLogin",
  // 无权限
  NOT_ACCESS: "notAccess",
  // 被封号
  BAN: "ban",
};
export default ACCESS_ENUM;
