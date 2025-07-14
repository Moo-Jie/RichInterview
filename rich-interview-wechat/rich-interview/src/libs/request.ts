import Taro from '@tarojs/taro';

// 环境配置
const DEV_BASE_URL = 'http://localhost:8101';
const PROD_BASE_URL = 'http://49.233.207.238';

void PROD_BASE_URL;
void DEV_BASE_URL;

const request = <T,>(options: Taro.request.Option): Promise<T> => {
  const baseURL = DEV_BASE_URL;
  // const baseURL = PROD_BASE_URL;

  return new Promise((resolve, reject) => {
    Taro.request({
      ...options,
      url: baseURL + options.url,
      success: (res) => {
        // 状态码处理
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // 业务逻辑处理（40100未登录）
          if (res.data?.code === 40100) {
            // 检查是否已经是登录页面
            const pages = Taro.getCurrentPages();
            const currentPage = pages[pages.length - 1]?.route || '';

            if (!currentPage.includes('/user/login')) {
              Taro.navigateTo({url: '/pages/user/login'});
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
