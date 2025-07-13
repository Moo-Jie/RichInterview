import {Component} from 'react'
import {View, Text, ScrollView} from '@tarojs/components'
import Taro from '@tarojs/taro'
import {AtCard, AtList, AtListItem} from 'taro-ui'
import './index.scss'

type State = {
  hotBanks: any[],
  newBanks: any[],
  hotQuestions: any[],
  loading: boolean
}

export default class Index extends Component<{}, State> {
  state: State = {
    hotBanks: [],
    newBanks: [],
    hotQuestions: [],
    loading: true
  }

  componentDidMount() {
    this.loadData()
  }

  async loadData() {
    try {
      const [hotBanks, newBanks, hotQuestions] = await Promise.all([
        this.getHotQuestionBanks(),
        this.getNewQuestionBanks(),
        this.getHotQuestions()
      ])

      this.setState({
        hotBanks,
        newBanks,
        hotQuestions,
        loading: false
      })
    } catch (error) {
      Taro.showToast({title: '数据加载失败', icon: 'none'})
    }
  }

  // 获取热门题库
  async getHotQuestionBanks() {
    const res = await Taro.request({
      url: 'http://localhost:8101/api/questionBankHotspot/list/page/vo',
      method: 'POST',
      data: {
        pageSize: 10,
        sortField: 'viewNum',
        sortOrder: 'descend'
      }
    })
    return res.data.data?.records || []
  }

  // 获取最新题库
  async getNewQuestionBanks() {
    const res = await Taro.request({
      url: 'http://localhost:8101/api/questionBank/list/page/vo',
      method: 'POST',
      data: {
        pageSize: 10,
        sortField: 'createTime',
        sortOrder: 'descend'
      }
    })
    return res.data.data?.records || []
  }

  // 获取热门题目
  async getHotQuestions() {
    const res = await Taro.request({
      url: 'http://localhost:8101/api/questionHotspot/list/page/vo',
      method: 'POST',
      data: {
        pageSize: 10,
        sortField: 'viewNum',
        sortOrder: 'descend'
      }
    })
    return res.data.data?.records || []
  }

  handleNavigateToBank(bankId: string) {
    Taro.navigateTo({url: `/pages/questionBanks/index?id=${bankId}`})
  }

  handleNavigateToQuestion(questionId: string) {
    Taro.navigateTo({url: `/pages/questions/index?id=${questionId}`})
  }

  render() {
    const {hotBanks, newBanks, hotQuestions, loading} = this.state

    if (loading) {
      return (
        <View className='loading-container'>
          <Text>数据加载中...</Text>
        </View>
      )
    }

    return (
      <ScrollView className='index-page' scrollY>
        {/* 热门题库排行榜 */}
        <AtCard title="🔥 热门题库 TOP10" className='section-card'>
          <ScrollView scrollX className='hot-list'>
            {hotBanks.map((bank, index) => (
              <View key={bank.id} className='hot-item'
                    onClick={() => this.handleNavigateToBank(bank.questionBankId)}>
                <Text className='rank'>{index + 1}.</Text>
                <Text className='title'>{bank.title}</Text>
                <View className='stats'>
                  <Text className='stat'><Text className='icon'>👀</Text> {bank.viewNum || 0}</Text>
                  <Text className='stat'><Text className='icon'>❤️</Text> {bank.starNum || 0}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </AtCard>

        {/* 最新题库列表 */}
        <AtCard title="📚 最新题库" className='section-card'>
          <AtList>
            {newBanks.map(bank => (
              <AtListItem
                key={bank.id}
                title={bank.title}
                note={`题目数: ${bank.questionCount} | 创建时间: ${bank.createTime}`}
                arrow='right'
                onClick={() => this.handleNavigateToBank(bank.id)}
              />
            ))}
          </AtList>
        </AtCard>

        {/* 热门题目排行榜 */}
        <AtCard title="🔥 热门题目 TOP10" className='section-card'>
          <AtList>
            {hotQuestions.map(question => (
              <AtListItem
                key={question.id}
                title={question.title}
                note={`浏览: ${question.viewNum} | 收藏: ${question.starNum}`}
                arrow='right'
                onClick={() => this.handleNavigateToQuestion(question.questionId)}
              />
            ))}
          </AtList>
        </AtCard>
      </ScrollView>
    )
  }
}
