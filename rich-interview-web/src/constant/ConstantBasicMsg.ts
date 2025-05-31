/**
 * 项目信息相关常量配置
 */
export const ConstantBasicMsg = {
  // 主页地址
  HOME_URL: "http://localhost:3000/",
  // HOME_URL: "http://49.233.207.238/",
  // 项目名称
  PROJECT_NAME: "RichInterview",
  // 默认项目LOGO
  DEFAULT_PROJECT_LOGO:
      "https://rich-tams.oss-cn-beijing.aliyuncs.com/LOGO.jpg",
  // 项目版本号
  PROJECT_VERSION: "1.5.0",
  // 项目最近更新时间
  PROJECT_LAST_UPDATE_TIME: "2025-05-25",
  // 项目描述
  PROJECT_DESCRIPTION: "",
  // 项目中文名
  PROJECT_CHINESE_NAME: "RICH面试刷题平台",
  // 仓库名
  REPO_NAME: "RichInterview",
  // 仓库地址
  REPO_URL: "https://github.com/Moo-Jie/RichInterview.git",
  // 作者头像
  AUTHOR_AVATAR:
    "https://rich-tams.oss-cn-beijing.aliyuncs.com/DKD_RichDu/2025/03/09/67cd64943c851694f2a087e7.png",
  // 作者名
  AUTHOR_NAME: "莫桀",
  // 默认题目图片
  DEFAULT_QUESTION_IMAGE:
    "https://rich-tams.oss-cn-beijing.aliyuncs.com/LOGO.jpg",
  // 默认题库图片
  DEFAULT_QUESTION_BANK_IMAGE:
    "https://rich-tams.oss-cn-beijing.aliyuncs.com/LOGO.jpg",
  // Sentinel-Dashboard 地址
  SENTINEL_DASHBOARD_URL: "http://localhost:8151/#/dashboard",
  // SENTINEL_DASHBOARD_URL: "http://49.233.207.238:8151/#/dashboard",
  // 服务器 Swagger 接口文档地址
  SERVER_API_SWAGGER_DOCS_URL: "http://localhost:8101/api/doc.html#/home",
  // SERVER_API_SWAGGER_DOCS_URL: "http://49.233.207.238/api/doc.html#/home",
  // Nacos-Dashboard 地址
  NACOS_DASHBOARD_URL: "http://localhost:8848/nacos/index.html#/",
  // NACOS_DASHBOARD_URL: "http://49.233.207.238:8848/nacos/index.html#/",
  // 云服务器性能
  SERVER_PERFORMANCE:{
    "cpu": "CPU - 2核",
    "memory": "内存 - 2GB",
    "disk": "SSD云硬盘 40GB",
    "bandwidth": " 200GB/月（带宽 3Mbps）",
  }
} as const;
