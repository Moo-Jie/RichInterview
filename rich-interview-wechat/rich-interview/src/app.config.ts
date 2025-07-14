/**
 * 对小程序进行全局配置，配置项遵循微信小程序规范，并且对所有平台进行统一
 * 源：https://docs.taro.zone/docs/app-config#defineappconfig-%E5%AE%8F%E5%87%BD%E6%95%B0
 */
export default defineAppConfig({
  // 需要配置的小程序页面路径，支持通配符
  pages: [
    // 主页
    'pages/index/index',
    // 题目详情
    'pages/question/index'
  ],
  subPackages: [
    {
      root: "packageQuestion",
      pages: [
        "pages/question/index"
      ]
    }
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'RichInterview',
    navigationBarTextStyle: 'black'
  }
})
