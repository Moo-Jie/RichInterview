/**
 * 对小程序进行全局配置，配置项遵循微信小程序规范，并且对所有平台进行统一
 * 源：https://docs.taro.zone/docs/app-config#defineappconfig-%E5%AE%8F%E5%87%BD%E6%95%B0
 */
export default defineAppConfig({
  pages: [
    'pages/index/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'RichInterview',
    navigationBarTextStyle: 'black'
  }
})
