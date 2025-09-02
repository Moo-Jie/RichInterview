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
    'pages/question/index',
    // 题库详情
    'pages/questionBank/index',
    // 全部题目
    'pages/questions/index',
    // 全部题库
    'pages/questionBanks/index',
    // 个人中心
    'pages/user/index',
    // 个人中心-编辑
    'pages/user/edit/index',
    // 隐私政策
    'pages/privacy/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'RichInterview',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#666',
    selectedColor: '#2563EB',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '主页',
        iconPath: 'assets/tabbar/home.png',
        selectedIconPath: 'assets/tabbar/home-active.png'
      },
      {
        pagePath: 'pages/questions/index',
        text: '题目',
        iconPath: 'assets/tabbar/question.png',
        selectedIconPath: 'assets/tabbar/question-active.png'
      },
      {
        pagePath: 'pages/questionBanks/index',
        text: '题库',
        iconPath: 'assets/tabbar/bank.png',
        selectedIconPath: 'assets/tabbar/bank-active.png'
      },
      {
        pagePath: 'pages/user/index',
        text: '我的',
        iconPath: 'assets/tabbar/user.png',
        selectedIconPath: 'assets/tabbar/user-active.png'
      }
    ]
  }
})
