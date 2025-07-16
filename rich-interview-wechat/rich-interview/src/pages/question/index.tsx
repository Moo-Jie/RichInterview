import { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { AtCard, AtTag } from 'taro-ui'
import { getQuestionDetail } from '../../api/question'
import TagParser from '../../components/TagParserComponent'
import dayjs from 'dayjs'
import './index.scss'

type QuestionDetail = {
  id: string
  title: string
  content: string
  tagList: string[]
  viewNum: number
  starNum: number
  createTime: string
  updateTime: string
  difficulty: string
}

export default class QuestionDetailPage  extends Component {
  state = {
    loading: true,
    question: {} as QuestionDetail
  }

  componentDidMount() {
    const { questionId } = Taro.getCurrentInstance().router?.params || {}
    if (questionId) {
      this.loadData(questionId)
    }
  }

  async loadData(questionId: string) {
    try {
      const question = await getQuestionDetail(questionId)
      this.setState({
        question,
        loading: false
      })
    } catch (error) {
      Taro.showToast({ title: '题目加载失败', icon: 'none' })
      Taro.navigateBack()
    }
  }

  render() {
    const { question, loading } = this.state

    if (loading) {
      return (
        <View className='loading-container'>
          <Text>加载中...</Text>
        </View>
      )
    }

    return (
      <ScrollView className='question-detail-page' scrollY>
        <AtCard title="题目详情">
          <View className='header'>
            <Text className='title'>{question.title}</Text>
            <Text className='meta'>
              {dayjs(question.createTime).format('YYYY-MM-DD')} 创建 ·
              难度：{question.difficulty}
            </Text>
          </View>

          <View className='stats'>
            <AtTag type='primary' circle>👁️‍🗨  {question.viewNum}</AtTag>
            <AtTag type='primary' circle>❤️ {question.starNum}</AtTag>
          </View>

          <TagParser tagList={question.tagList} />

          <View className='content'>
            <Text>{question.content}</Text>
          </View>
        </AtCard>
      </ScrollView>
    )
  }
}
