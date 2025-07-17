import {Component} from 'react'
import {View, Text, ScrollView} from '@tarojs/components'
import Taro from '@tarojs/taro'
import {AtIcon, AtTag} from 'taro-ui'
import {getQuestionDetail, getQuestionHotspotDetail} from '../../api/question'
import TagParser from '../../components/TagParserComponent'
import dayjs from 'dayjs'
import './index.scss'
import {UserVO} from "../../api/user";

type QuestionDetail = {
  answer: string
  content: string
  createTime: string
  updateTime: string
  id: string
  questionBankId: string
  reviewMessage: string
  reviewStatus: number
  reviewTime: string
  reviewerId: string
  source: string
  tagList: string[]
  tags: string
  title: string
  userId: string
  user: UserVO
  answerSupplement?: string
}

type QuestionHotspotDetail = {
  answer?: string
  collectNum?: number
  commentNum?: number
  content?: string
  createTime?: string
  forwardNum?: number
  id?: number
  questionId?: number
  starNum?: number
  tagList: string[]
  title?: string
  updateTime?: string
  viewNum?: number
}

type State = {
  loading: boolean
  error: boolean
  starred: boolean
  question: QuestionDetail | null
  questionHotspotDetail: QuestionHotspotDetail | null
}

export default class QuestionDetailPage extends Component<{}, State> {
  state: State = {
    loading: true,
    error: false,
    starred: false,
    question: null,
    questionHotspotDetail: null
  }

  componentDidMount() {
    const {id} = Taro.getCurrentInstance().router?.params || {}
    if (id) {
      this.loadData(id)
    } else {
      Taro.showToast({title: '缺少题目ID', icon: 'none'})
      setTimeout(() => Taro.navigateBack(), 1500)
    }
  }

  async loadData(questionId: string) {
    try {
      const question = await getQuestionDetail(questionId)
      const questionHotspotDetail = await getQuestionHotspotDetail(questionId)
      // 添加数据校验
      if (!question || question.isDelete) {
        throw new Error('题目不存在');
      }
      if (!questionHotspotDetail || questionHotspotDetail.isDelete) {
        throw new Error('题目热点不存在');
      }
      this.setState({
        question: {
          ...question,
          id: String(question.id),
          createTime: dayjs(question.createTime).format('YYYY-MM-DD'),
          updateTime: dayjs(question.updateTime).format('YYYY-MM-DD')
        },
        loading: false,
        starred: question.starNum > 0,
        questionHotspotDetail: {
          ...questionHotspotDetail
        }
      })
    } catch (error) {
      Taro.showToast({title: '题目加载失败', icon: 'none'})
      this.setState({error: true, loading: false})
      setTimeout(() => Taro.navigateBack(), 2000)
    }
  }

  handleShare = () => {
    Taro.showToast({
      title: '已生成分享卡片',
      icon: 'success'
    })
    // TODO 分享二维码生成，并弹窗长按可保存
  }

  handleGoBack = () => {
    Taro.navigateBack()
  }

  render() {
    const {question, questionHotspotDetail, loading, error} = this.state

    if (loading) {
      return (
        <View className='login-prompt-container'>
          <View className='login-prompt-card'>
            <Text className='prompt-icon'>📝</Text>
            <Text className='prompt-title'>题目加载中</Text>
            <Text className='prompt-desc'>请稍候，精彩内容马上呈现</Text>
          </View>
        </View>
      )
    }

    if (error || !question || !questionHotspotDetail) {
      return (
        <View className='login-prompt-container'>
          <View className='login-prompt-card'>
            <Text className='prompt-icon'>⚠️</Text>
            <Text className='prompt-title'>题目加载失败</Text>
            <Text className='prompt-desc'>请稍后再试或返回重试</Text>
          </View>
        </View>
      )
    }

    return (
      <ScrollView className='question-detail-page' scrollY>
        {/* 顶部操作栏 */}
        <View className='action-bar'>
          <View className='action-btn' onClick={this.handleGoBack}>
            <AtIcon value='chevron-left' size='18' color='#fff'/>
          </View>
          <View className='action-btn' onClick={this.handleShare}>
            <AtIcon value='share' size='18' color='#fff'/>
          </View>
        </View>

        {/* 题目详情卡片 */}
        <View className='content-card'>
          <View className='header'>
            <Text className='title'>{question.title}</Text>
            <Text className='meta'>
              最近维护时间 {dayjs(question.updateTime).format('YYYY-MM-DD')}
            </Text>
          </View>

          <View className='stats'>
            <AtTag type='primary' circle>
              <AtIcon value='heart' size='12'/>
              {questionHotspotDetail.viewNum}
            </AtTag>
            <AtTag type='primary' circle>
              <AtIcon value='eye' size='12'/>
              {questionHotspotDetail.starNum}
            </AtTag>
          </View>

          <TagParser tagList={question.tagList}/>

          <View className='content'>
            <Text>{question.content}</Text>
          </View>

          <View className='content'>
            <Text>{question.answer}</Text>
          </View>
        </View>
      </ScrollView>
    )
  }
}
