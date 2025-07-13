import {Component, PropsWithChildren} from 'react'
import {Text, View} from '@tarojs/components'
import {AtButton} from 'taro-ui'

import "taro-ui/dist/style/components/button.scss" // 按需引入
import './index.scss'

export default class Index extends Component<PropsWithChildren> {
  componentDidMount() {
  }

  componentWillUnmount() {
  }

  componentDidShow() {
  }

  componentDidHide() {
  }

  render() {
    return (
      <View className='index'>
        <Text>Hello world!</Text>
        <AtButton type='primary'>I need Taro UI</AtButton>
        <Text>Taro UI 支持 Vue 了吗？</Text>
        <AtButton>按钮文案</AtButton>
        <AtButton type='primary'>按钮文案</AtButton>
        <AtButton type='secondary'>按钮文案</AtButton>
      </View>
    )
  }
}
