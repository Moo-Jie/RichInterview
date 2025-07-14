// import {Component} from 'react'
// import {View, Text, ScrollView} from '@tarojs/components'
// import Taro from '@tarojs/taro'
// import {AtCard, AtTag} from 'taro-ui'
// import {getQuestionBankDetail} from '../../../services/ questionBankController'
// import TagParser from '../../../components/TagParserComponent'
// import dayjs from 'dayjs'
// import './index.scss'
//
// type QuestionBankDetail = {
//   id: string
//   title: string
//   content: string
//   tagList: string[]
//   viewNum: number
//   starNum: number
//   createTime: string
//   updateTime: string
//   difficulty: string
// }
//
// export default class QuestionBankDetailPage extends Component {
//   state = {
//     loading: true,
//     questionBank: {} as QuestionBankDetail
//   }
//
//   componentDidMount() {
//     const {questionBankId} = Taro.getCurrentInstance().router?.params || {}
//     if (questionBankId) {
//       this.loadData(questionBankId)
//     }
//   }
//
//   async loadData(questionBankId: string) {
//     try {
//       const questionBank = await getQuestionBankDetail(questionBankId)
//       this.setState({
//         questionBank,
//         loading: false
//       })
//     } catch (error) {
//       Taro.showToast({title: '题目加载失败', icon: 'none'})
//       Taro.navigateBack()
//     }
//   }
//
//   render() {
//     const {questionBank, loading} = this.state
//
//     if (loading) {
//       return (
//         <View className='loading-container'>
//           <Text>加载中...</Text>
//         </View>
//       )
//     }
//
//     return (
//       <ScrollView className=' questionBank-detail-page' scrollY>
//         <AtCard title="题目详情">
//           <View className='header'>
//             <Text className='title'>{questionBank.title}</Text>
//             <Text className='meta'>
//               {dayjs(questionBank.createTime).format('YYYY-MM-DD')} 创建 ·
//               难度：{questionBank.difficulty}
//             </Text>
//           </View>
//
//           <View className='stats'>
//             <AtTag type='primary' circle>👁️‍🗨 {questionBank.viewNum}</AtTag>
//             <AtTag type='primary' circle>❤️ {questionBank.starNum}</AtTag>
//           </View>
//
//           <TagParser tagList={questionBank.tagList}/>
//
//           <View className='content'>
//             <Text>{questionBank.content}</Text>
//           </View>
//         </AtCard>
//       </ScrollView>
//     )
//   }
// }
