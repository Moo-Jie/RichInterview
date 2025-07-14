import {Component} from 'react'
import {View, Text, ScrollView} from '@tarojs/components'
import Taro from '@tarojs/taro'
import {AtCard, AtList, AtListItem} from 'taro-ui'
import {
  getHotQuestionBanks,
  getNewQuestionBanks,
} from '../../services/questionBank'
import {getHotQuestions, getNewQuestions} from '../../services/question'
import TagParser from '../../components/TagParserComponent/index'
import dayjs from 'dayjs'
import './index.scss'

type State = {
  hotBanks: any[],
  newBanks: any[],
  hotQuestions: any[],
  loading: boolean,
  newQuestions: any[],
  dailyQuestion: any
}

export default class Index extends Component<{}, State> {
  state: State = {
    hotBanks: [],
    newBanks: [],
    hotQuestions: [],
    loading: true,
    newQuestions: [],
    dailyQuestion: null
  }

  componentDidMount() {
    this.loadData()
  }

  async loadData() {
    try {
      const [hotBanks, newBanks, hotQuestions, newQuestions] = await Promise.all([
        getHotQuestionBanks(),
        getNewQuestionBanks(),
        getHotQuestions(),
        getNewQuestions()
      ])

      this.setState({
        hotBanks,
        newBanks,
        hotQuestions,
        newQuestions,
        dailyQuestion: newQuestions.length > 0
          ? newQuestions[Math.floor(Math.random() * newQuestions.length)]
          : null,
        loading: false,
      })
    } catch (error) {
      Taro.showToast({title: '数据加载失败', icon: 'none'})
      this.setState({loading: false})
    }
  }

  handleNavigateToBank(bankId: string) {
    Taro.navigateTo({url: `/packageQuestionBank/pages/questionBank/index?id=${bankId}`})
  }

  handleNavigateToQuestion(questionId: string) {
    Taro.navigateTo({url: `/packageQuestion/pages/question/index?id=${questionId}`})
  }

  render() {
    const {hotBanks, newBanks, hotQuestions, loading, dailyQuestion} = this.state

    if (loading) {
      return (
        <View className='loading-container'>
          <Text>数据加载中...</Text>
        </View>
      )
    }

    return (
      <ScrollView className='index-page' scrollY>
        {/* 每日一刷模块 */}
        <AtCard title="📅 每日一刷" className='section-card'>
          <View className='custom-list-item'>
            <AtListItem
              title={dailyQuestion.title}
              note={
                <View className='note-container'>
                  <Text>每日精选题目</Text>
                  <TagParser tagList={[
                    ...(dailyQuestion.tagList?.filter((t: string) => t?.trim()) || ["暂未设定"]),
                    dailyQuestion.type?.trim()
                  ].filter(Boolean)}/>
                </View>
              }
              arrow='right'
              onClick={() => this.handleNavigateToQuestion(dailyQuestion.id)}
            />
          </View>
        </AtCard>
        {/* 热门题库排行榜 */}
        <AtCard title="  热门题库 TOP10" className='section-card'>
          <ScrollView scrollX className='hot-list'>
            {hotBanks.map((bank, index) => (
              <View
                key={bank.questionBankId}
                className='hot-item'
                onClick={() => this.handleNavigateToBank(bank.questionBankId)}
              >
                <Text className='rank'>{index + 1}.</Text>
                <Text className='title'>{bank.title}</Text>
                <View className='stats'>
                  <Text className='stat'>👁️‍🗨 {bank.viewNum || 0}</Text>
                  <Text className='stat'>👍🏻 {bank.starNum || 0}</Text>
                </View>
                <View className='stats'>
                  <Text
                    className='stat description'>📝 {bank.description?.slice(0, 10)}{bank.description?.length > 10 ? '...' : ''}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </AtCard>

        {/* 热门题目排行榜 */}
        <AtCard title="  热门题目 TOP10" className='section-card'>
          <AtList>
            {hotQuestions.map(question => (
              <AtListItem
                key={question.id}
                title={question.title}
                note={`👁️‍🗨 ${question.viewNum} | 👍🏻 ${question.starNum}`}
                arrow='right'
                onClick={() => this.handleNavigateToQuestion(question.id)}
              />
            ))}
          </AtList>
        </AtCard>

        {/* 最新题库列表 */}
        <AtCard title=" 最新题库" className='section-card'>
          <AtList>
            {newBanks.map(bank => (
              <AtListItem
                key={bank.id}
                title={bank.title}
                note={` ${bank.description} | 最近更新：${dayjs(bank.updateTime).format('YYYY-MM-DD HH:mm')}`}
                arrow='right'
                onClick={() => this.handleNavigateToBank(bank.id)}
              />
            ))}
          </AtList>
        </AtCard>

        {/* 最新题目模块 */}
        <AtCard title=" 最新题目" className='section-card'>
          <AtList>
            {this.state.newQuestions.map(question => (
              <View key={question.id} className='custom-list-item'>
                <AtListItem
                  title={question.title}
                  note={
                    <View className='note-container'>
                      <Text>{`最近更新：${dayjs(question.createTime).format('YYYY-MM-DD HH:mm')}`}</Text>
                      <TagParser tagList={[
                        ...(question.tagList?.filter((t: string) => t?.trim()) || ["暂未设定"]),
                        question.type?.trim()
                      ].filter(Boolean)}/>
                    </View>
                  }
                  arrow='right'
                  onClick={() => this.handleNavigateToQuestion(question.id)}
                />
              </View>
            ))}
          </AtList>
        </AtCard>
      </ScrollView>
    )
  }
}
