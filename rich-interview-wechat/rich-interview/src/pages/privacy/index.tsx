import {Button, ScrollView, Text, View} from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

export default function PrivacyPolicy() {
  return (
    <View className="privacy-container">
      <View className="header">
        <Text className="title">用户隐私保护指引</Text>
        <Text className="subtitle">生效日期：2025年9月1日</Text>
      </View>

      <ScrollView scrollY className="content">
        <Text className="section-title">一、我们收集的信息</Text>
        <Text className="section-text">
          为了提供优质的学习服务，我们会收集以下信息：
          1. 注册账号信息（用户名、手机号、邮箱等）
          2. 学习行为数据（练习记录、学习时长等）
          3. 设备信息（用于保障账户安全）
        </Text>

        <Text className="section-title">二、信息的使用</Text>
        <Text className="section-text">
          我们仅会将您的信息用于：
          1. 提供个性化学习推荐
          2. 提升产品质量和服务体验
          3. 安全保障和问题排查
        </Text>

        <Text className="section-title">三、信息的存储与保护</Text>
        <Text className="section-text">
          我们采用安全加密技术存储您的信息
          严格限制员工访问权限
          保留期限为用户活跃期间
        </Text>

        <Text className="section-title">四、您的权利</Text>
        <Text className="section-text">
          您可以：
          1. 访问、修改您的个人信息
          2. 注销账户（账户注销后信息将被删除）
          3. 拒绝非必要权限授权
        </Text>

        <Button
          className="agree-btn"
          onClick={() => Taro.navigateBack()}
        >
          我已阅读并理解
        </Button>
      </ScrollView>
    </View>
  )
}
