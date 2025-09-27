import {Component} from 'react';
import {Text, View} from '@tarojs/components';
import {AtCard, AtIcon, AtListItem} from 'taro-ui';
import TagParser from '../TagParserComponent/index';
import {getPreviousQuestion} from '../../api/user';
import './index.scss';

interface State {
  previousQuestion: any;
  loading: boolean;
}

interface Props {
  userInfo: any;
  onNavigateToQuestion: (questionId: string) => void;
}

export default class PreviousQuestionCard extends Component<Props, State> {
  state: State = {
    previousQuestion: null,
    loading: true,
  };

  async componentDidMount() {
    await this.loadPreviousQuestion();
  }

  async componentDidUpdate(prevProps: Props) {
    // 当用户登录状态发生变化时重新加载数据
    if (prevProps.userInfo !== this.props.userInfo) {
      await this.loadPreviousQuestion();
    }
  }

  loadPreviousQuestion = async () => {
    const {userInfo} = this.props;

    if (!userInfo) {
      this.setState({
        previousQuestion: null,
        loading: false
      });
      return;
    }

    this.setState({loading: true});

    try {
      const question = await getPreviousQuestion();
      this.setState({
        previousQuestion: question,
        loading: false
      });
    } catch (error) {
      console.error('获取上次刷题记录失败', error);
      this.setState({
        previousQuestion: null,
        loading: false
      });
    }
  };

  handleQuestionClick = () => {
    const {previousQuestion} = this.state;
    const {onNavigateToQuestion} = this.props;

    if (previousQuestion && onNavigateToQuestion) {
      onNavigateToQuestion(previousQuestion.id);
    }
  };

  renderContent = () => {
    const {userInfo} = this.props;
    const {previousQuestion, loading} = this.state;

    if (!userInfo) {
      return (
        <View className="previous-question-empty">
          <AtIcon prefixClass='fa' value='user-circle' size={32} className='empty-icon'/>
          <Text className="empty-text">登录后查看上次刷题记录</Text>
        </View>
      );
    }

    if (loading) {
      return (
        <View className="previous-question-loading">
          <AtIcon prefixClass='fa' value='spinner' size={24} className='loading-icon'/>
          <Text className="loading-text">加载中...</Text>
        </View>
      );
    }

    if (!previousQuestion) {
      return (
        <View className="previous-question-empty">
          <AtIcon prefixClass='fa' value='book-open' size={32} className='empty-icon'/>
          <Text className="empty-text">暂无刷题记录</Text>
          <Text className="empty-subtitle">开始你的第一道题吧！</Text>
        </View>
      );
    }

    return (
      <View className="previous-question-content">
        <AtListItem
          title={previousQuestion.title}
          note={
            <View className='note-container'>
              <TagParser tagList={[
                ...(previousQuestion.tagList?.filter((t: string) => t?.trim()) || ["暂未设定"]),
                previousQuestion.type?.trim()
              ].filter(Boolean)}/>
            </View>
          }
          arrow='right'
          onClick={this.handleQuestionClick}
        />
      </View>
    );
  };

  render() {
    return (
      <AtCard
        title="🔖 上次刷到"
        className='previous-question-card section-card'
        note={"继续上次的学习进度"}
      >
        {this.renderContent()}
      </AtCard>
    );
  }
}
