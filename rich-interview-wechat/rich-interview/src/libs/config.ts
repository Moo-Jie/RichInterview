// API配置文件
export const API_CONFIG = {
  // 环境配置
  DEV_BASE_URL: 'https://richdu.cn',
  PROD_BASE_URL: 'https://richdu.cn',

  // 当前环境配置
  IS_DEV: process.env.NODE_ENV === 'development',
} as const;

/**
 * 获取API基础URL
 * @returns 当前环境对应的API基础URL
 */
export const getApiBaseUrl = (): string => {
  // 开发环境使用本地地址，生产环境使用线上地址
  // return API_CONFIG.DEV_BASE_URL;
  return API_CONFIG.PROD_BASE_URL;
};

/**
 * 获取完整的API URL
 * @param path API路径
 * @returns 完整的API URL
 */
export const getApiUrl = (path: string): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};
