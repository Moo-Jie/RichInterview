import Taro from '@tarojs/taro';
import { getApiBaseUrl } from './config';

// 解析Set-Cookie获取satoken
const extractSatoken = (headers: any): string | null => {
  if (!headers || !headers['Set-Cookie'] && !headers['set-cookie']) {
    return null;
  }

  const setCookies = headers['Set-Cookie'] || headers['set-cookie'];
  const cookieArray = Array.isArray(setCookies) ? setCookies : [setCookies];

  for (const cookieStr of cookieArray) {
    const cookiePairs = cookieStr.split(';');
    for (const pair of cookiePairs) {
      const [name, value] = pair.trim().split('=');
      if (name === 'satoken') {
        return value;
      }
    }
  }

  return null;
};

const request = <T, >(options: Taro.request.Option): Promise<T> => {
  const baseURL = getApiBaseUrl();

  // 获取设备唯一标识（优先使用缓存）
  const getDeviceId = () => {
    let deviceId = Taro.getStorageSync('deviceId');
    if (!deviceId) {
      deviceId = `wx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      Taro.setStorageSync('deviceId', deviceId);
    }
    return deviceId;
  };

  Taro.addInterceptor((chain) => {
    const requestParams = chain.requestParams;
    // 从本地存储获取token
    const token = Taro.getStorageSync('token');
    // 获取设备ID
    const deviceId = getDeviceId();
    // 添加请求头
    requestParams.header = {
      ...requestParams.header,
      'X-Device-Id': deviceId,
      ...(token ? {satoken: token} : {})
    };
    return chain.proceed(requestParams);
  });

  return new Promise((resolve, reject) => {
    Taro.request({
      ...options,
      url: baseURL + options.url,
      success: (res) => {
        // 状态码处理
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 解析响应头中的satoken
          const satoken = extractSatoken(res.header);
          if (satoken) {
            // 将satoken存入本地存储
            Taro.setStorageSync('token', satoken);
          }

          console.log('token为：', Taro.getStorageSync('token'));

          // 业务逻辑处理（40100未登录）
          if (res.data?.code === 40100) {
            // 检查是否已经是登录页面
            const pages = Taro.getCurrentPages();
            const currentPage = pages[pages.length - 1]?.route || '';

            if (!currentPage.includes('/user/index')) {
              Taro.navigateTo({url: '/pages/user/index'});
            }
          }
          resolve(res.data as T);
        } else {
          reject(new Error(`请求错误 ${res.statusCode}`));
        }
      },
      fail: (err) => {
        Taro.showToast({title: '网络连接失败', icon: 'none'});
        reject(err);
      }
    });
  });
};

export default request;
