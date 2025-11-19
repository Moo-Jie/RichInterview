import {Component, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal} from 'react';
import {Button, Image, ScrollView, Text, View} from '@tarojs/components';
import Taro from '@tarojs/taro';
import {AtCard, AtIcon, AtTag, AtFab, AtSearchBar} from 'taro-ui';
import {
  getQuestionBankHotspotVOByQuestionBankId,
  getQuestionBankVOById,
  incrementStarCount,
  incrementViewCount,
} from '../../api/questionBank';
import TagParser from '../../components/TagParserComponent';
import dayjs from 'dayjs';
import './index.scss';

// 题库详情类型
type QuestionBankDetail = {
  id: number;
  title: string;
  description: string;
  userId: number;
  picture: string;
  createTime: string;
  updateTime: string;
  user: {
    id: number;
    userName: string;
    userAvatar?: string;
  };
  questionsPage?: {
    records: any[];
    current: number;
    pageSize: number;
    total: number;
  };
};

// 题库热点数据类型
type QuestionBankHotspotDetail = {
  id: number;
  questionBankId: number;
  viewNum: number;
  starNum: number;
  forwardNum: number;
  collectNum: number;
  commentNum: number;
  createTime: string;
  updateTime: string;
};

// 页面状态类型
type State = {
  questionBankId: number | null;
  loading: boolean;
  error: boolean;
  bankDetail: QuestionBankDetail | null;
  hotspotDetail: QuestionBankHotspotDetail | null;
  showShareCard: boolean;
  shareCardPath: string;
  canvasRendered: boolean;
  starred: boolean;
  scrollIntoView: string;
  showTopBtn: boolean;
  showBottomBtn: boolean;
  viewportHeight: number;
  searchQuery: string;
};

export default class QuestionBankDetailPage extends Component<{}, State> {
  state: State = {
    questionBankId: null,
    loading: true,
    error: false,
    bankDetail: null,
    hotspotDetail: null,
    showShareCard: false,
    shareCardPath: '',
    canvasRendered: false,
    starred: false,
    scrollIntoView: '',
    showTopBtn: false,
    showBottomBtn: true,
    viewportHeight: Taro.getSystemInfoSync().windowHeight || 0,
    searchQuery: ''
  };

  componentDidMount() {
    const {id} = Taro.getCurrentInstance().router?.params || {};
    if (id) {
      this.setState({}, () => {
        // @ts-ignore
        this.loadData(id);
        incrementViewCount(id).catch(console.error);
      });
    } else {
      Taro.showToast({title: '题库ID不存在', icon: 'error'});
      setTimeout(() => Taro.navigateBack(), 2000);
    }
  }

  // 点赞处理
  handleStar = async () => {
    if (!this.state.questionBankId || this.state.starred) return;

    try {
      const success = await incrementStarCount(this.state.questionBankId.toString());
      if (success) {
        this.setState(prevState => ({
          starred: true,
          hotspotDetail: prevState.hotspotDetail ? {
            ...prevState.hotspotDetail,
            starNum: (prevState.hotspotDetail.starNum || 0) + 1
          } : null
        }));
        Taro.showToast({title: '点赞成功', icon: 'success'});
      }
    } catch (error) {
      Taro.showToast({title: '操作失败，请重试', icon: 'none'});
    }
  };

  scrollToBottom = () => {
    this.setState({scrollIntoView: 'page-bottom'});
    setTimeout(() => this.setState({scrollIntoView: ''}), 50);
  };

  scrollToTop = () => {
    this.setState({scrollIntoView: 'page-top'});
    setTimeout(() => this.setState({scrollIntoView: ''}), 50);
  };

  handleScroll = (e: any) => {
    const detail = e?.detail || {};
    const scrollTop = detail.scrollTop || 0;
    const scrollHeight = detail.scrollHeight || 0;
    const h = this.state.viewportHeight || 0;
    const atTop = scrollTop <= 10;
    const atBottom = scrollTop + h >= scrollHeight - 10;
    this.setState({showTopBtn: !atTop, showBottomBtn: !atBottom});
  };

  handleSearchChange = (value: string) => {
    this.setState({searchQuery: value});
  };

  async loadData(questionBankId: number) {
    if (!questionBankId) return;

    try {
      // 加载题库详情和热点数据
      const [detailRes, hotspotRes] = await Promise.all([
        getQuestionBankVOById(questionBankId),
        getQuestionBankHotspotVOByQuestionBankId(questionBankId)
      ]);

      if (!detailRes || !hotspotRes) {
        throw new Error('题库数据加载失败');
      }

      // 转换日期格式
      const bankDetail = {
        ...detailRes,
        createTime: dayjs(detailRes.createTime).format('YYYY-MM-DD'),
        updateTime: dayjs(detailRes.updateTime).format('YYYY-MM-DD'),
      };

      const hotspotDetail = {
        ...hotspotRes,
        createTime: dayjs(hotspotRes.createTime).format('YYYY-MM-DD'),
        updateTime: dayjs(hotspotRes.updateTime).format('YYYY-MM-DD'),
      };

      this.setState({
        questionBankId,
        // @ts-ignore
        bankDetail,
        hotspotDetail,
        loading: false,
        starred: false
      });
    } catch (error) {
      Taro.showToast({
        title: '题库数据加载失败',
        icon: 'none',
      });
      this.setState({error: true, loading: false});
      setTimeout(() => Taro.navigateBack(), 3000);
    }
  }

  // 导航到题目详情
  navigateToQuestion = (questionId: number) => {
    Taro.navigateTo({url: `/pages/question/index?id=${questionId}`});
  };

  // 处理返回操作
  handleGoBack = () => {
    Taro.navigateBack();
  };

  // 刷新题库数据
  handleRefresh = () => {
    this.setState({loading: true}, () => {
      this.loadData(this.state.questionBankId!);
    });
  };

  render() {
    const {
      bankDetail,
      hotspotDetail,
      loading,
      error
    } = this.state;

    if (loading) {
      return (
        <View className='loading-container'>
          <AtIcon value='loading-2' size='30' color='#4a6eff'></AtIcon>
          <Text className='loading-text'>题库加载中...</Text>
        </View>
      );
    }

    if (error || !bankDetail || !hotspotDetail) {
      return (
        <View className='error-container'>
          <AtIcon value='close-circle' size='40' color='#ff4d4f'></AtIcon>
          <Text className='error-text'>题库加载失败，请稍后再试</Text>
          <View className='action-buttons'>
            <Button className='refresh-btn' onClick={this.handleGoBack}>返回</Button>
            <Button className='refresh-btn' onClick={this.handleRefresh}>重新加载</Button>
          </View>
        </View>
      );
    }

    const records = bankDetail?.questionsPage?.records || [];
    const q = (this.state.searchQuery || '').trim().toLowerCase();
    const filteredRecords = q
      ? records.filter((question: any) => {
          const title = (question?.title || '').toLowerCase();
          let tagsArr: string[] = [];
          try {
            const parsed = JSON.parse(question?.tags || '[]');
            if (Array.isArray(parsed)) tagsArr = parsed.map((t: any) => String(t || '').toLowerCase());
          } catch {}
          const tagsHit = tagsArr.some(t => t.includes(q));
          return title.includes(q) || tagsHit;
        })
      : records;

    return (
      <View className='question-bank-detail'>
        <ScrollView scrollY scrollWithAnimation scrollIntoView={this.state.scrollIntoView} style={{height: '100vh'}} onScroll={this.handleScroll} className='detail-container'>
          <View id='page-top' style={{height: '1px'}}/>
          {/* 顶部操作栏 */}
          <View className='action-bar'>
            <View className='action-btn' onClick={this.handleGoBack}>
              <AtIcon value='chevron-left' size='20' color='#fff'/>
            </View>
            <View className='action-btn' onClick={this.handleStar}>
              <AtIcon
                value='heart-2'
                size='20'
                color={this.state.starred ? '#e9ccff' : '#fff'}
              />
            </View>
          </View>

          {/* 题库封面 */}
          {bankDetail.picture && (
            <Image
              src={bankDetail.picture}
              className='cover-image'
              mode='aspectFill'
            />
          )}

          {/* 题库基本信息 */}
          <AtCard title='题库信息' className='info-card'>
            <Text className='bank-title'>{bankDetail.title}</Text>
            <Text className='bank-description'>{bankDetail.description}</Text>

            <View className='bank-meta'>
              <View className='bank-stat'>
                <AtIcon value='eye' size='18' color='#8a8a8a'></AtIcon>
                <Text className='stat-value'>{hotspotDetail.viewNum || 0}次浏览</Text>
              </View>

              <View className='bank-stat'>
                <AtIcon value='heart-2' size='18' color='#8a8a8a'></AtIcon>
                <Text className='stat-value'>{hotspotDetail.starNum || 0}次点赞</Text>
              </View>
            </View>

            <View className='bank-tags'>
              {/* @ts-ignore */}
              {(bankDetail.tagList || ['专业题库', '面试必备']).map((tag: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | null | undefined, index: Key | null | undefined) => (
                <AtTag key={index} circle className='bank-tag'>
                  {tag}
                </AtTag>
              ))}
            </View>
          </AtCard>

          <AtCard title='题目搜索' className='info-card'>
            <AtSearchBar
              value={this.state.searchQuery}
              onChange={this.handleSearchChange}
              placeholder='输入关键词，搜索题目'
            />
          </AtCard>

          {/* 题库中的题目列表 */}
          <AtCard title={`题目列表 (${filteredRecords.length})`} className='questions-card'>
            {(filteredRecords.length ?? 0) > 0 ? (
              (filteredRecords || []).map((question, index) => (
                <View
                  key={index}
                  className='question-item'
                  onClick={() => this.navigateToQuestion(question.id)}
                >
                  <Text className='question-index'>{index + 1}.</Text>
                  <View className='question-content'>
                    <Text className='question-title'>{question.title}</Text>
                    {question.tags && (
                      <View className='question-tags'>
                        <TagParser tagList={(() => {
                          try {
                            return JSON.parse(question.tags);
                          } catch (e) {
                            return [];
                          }
                        })()}/>
                      </View>
                    )}
                  </View>
                  <AtIcon value='chevron-right' size='20' color='#8a8a8a'></AtIcon>
                </View>
              ))
            ) : (
              <Text className='no-data'>{q ? '暂无匹配题目' : '此题库暂无题目'}</Text>
            )}
          </AtCard>

          {/* 创建者信息 */}
          <AtCard title='创建者' className='creator-card'>
            <View
              className='creator-info'
            >
              {bankDetail.user.userAvatar ? (
                <Image
                  src={bankDetail.user.userAvatar}
                  className='creator-avatar'
                />
              ) : (
                <View className='avatar-placeholder'>
                  <AtIcon value='user' size='20' color='#fff'></AtIcon>
                </View>
              )}
              <Text className='creator-name'>{bankDetail.user.userName || '匿名用户'}</Text>
            </View>
            <Text className='update-time'>最近维护于：{bankDetail.updateTime}</Text>
          </AtCard>
          <View id='page-bottom' style={{height: '1px'}}/>
        </ScrollView>
        <View className='floating-actions'>
          {this.state.showTopBtn && (
            <AtFab onClick={this.scrollToTop}>
              <AtIcon value='chevron-up' size='16' color='#fff'/>
            </AtFab>
          )}
          {this.state.showBottomBtn && (
            <AtFab onClick={this.scrollToBottom}>
              <AtIcon value='chevron-down' size='16' color='#fff'/>
            </AtFab>
          )}
        </View>
      </View>
    );
  }
}
