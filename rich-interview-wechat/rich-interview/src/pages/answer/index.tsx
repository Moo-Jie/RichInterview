import {Component} from 'react';
import {ScrollView, View, Text, Textarea} from '@tarojs/components';
import Taro from '@tarojs/taro';
import {AtButton, AtIcon, AtTag, AtModal, AtModalHeader, AtModalContent, AtModalAction} from 'taro-ui';
import {addComment, listCommentVoByPage, likeComment, CommentVO} from '../../api/comment';
import dayjs from 'dayjs';
import './index.scss';
import MarkdownRenderer from "../../components/MarkdownRenderer";

interface State {
  questionId: string;
  loading: boolean;
  comments: CommentVO[];
  current: number;
  pageSize: number;
  total: number;
  sortField: 'createTime' | 'thumbNum';
  sortOrder: 'desc' | 'asc';
  newContent: string;
  submitting: boolean;
  showMarkdownHelp: boolean;
}

export default class AnswerPage extends Component<{}, State> {
  state: State = {
    questionId: '',
    loading: true,
    comments: [],
    current: 1,
    pageSize: 10,
    total: 0,
    sortField: 'createTime',
    sortOrder: 'desc',
    newContent: '',
    submitting: false,
    showMarkdownHelp: false,
  };

  componentDidMount() {
    const {id} = Taro.getCurrentInstance().router?.params || {};
    if (!id) {
      Taro.showToast({title: '题目ID不存在', icon: 'none'});
      setTimeout(() => Taro.navigateBack(), 500);
      return;
    }
    this.setState({questionId: String(id)}, () => this.fetchComments(true));
  }

  fetchComments = async (reset = false) => {
    const {questionId, current, pageSize, sortField, sortOrder, comments} = this.state;
    try {
      this.setState({loading: true});
      const res = await listCommentVoByPage({
        questionId,
        current: reset ? 1 : current,
        pageSize,
        sortField,
        sortOrder,
      });
      this.setState({
        comments: reset ? res.records : comments.concat(res.records || []),
        total: res.total || 0,
        current: reset ? 1 : current,
      });
    } catch (error) {
      Taro.showToast({title: '加载回答失败', icon: 'none'});
    } finally {
      this.setState({loading: false});
    }
  };

  handleLoadMore = () => {
    const {comments, total, current} = this.state;
    if (comments.length >= total) return;
    this.setState({current: current + 1}, () => this.fetchComments());
  };

  handleLike = async (commentId: number, index: number) => {
    try {
      const ok = await likeComment(commentId);
      if (ok) {
        this.setState(prev => {
          const next = [...prev.comments];
          const item = next[index];
          if (item) {
            item.thumbNum = (item.thumbNum || 0) + 1;
          }
          return {comments: next} as State;
        });
        Taro.showToast({title: '已点赞', icon: 'success'});
      }
    } catch (error) {
      Taro.showToast({title: '点赞失败', icon: 'none'});
    }
  };

  handleSubmit = async () => {
    const {newContent, questionId} = this.state;
    if (!newContent || newContent.trim().length < 2) {
      Taro.showToast({title: '请填写至少2字内容', icon: 'none'});
      return;
    }
    try {
      this.setState({submitting: true});
      await addComment({content: newContent.trim(), questionId});
      Taro.showToast({title: '提交成功', icon: 'success'});
      this.setState({newContent: '', current: 1}, () => this.fetchComments(true));
    } catch (error) {
      Taro.showToast({title: '提交失败，请重试', icon: 'none'});
    } finally {
      this.setState({submitting: false});
    }
  };

  switchSort = (type: 'latest' | 'hot') => {
    this.setState({
      sortField: type === 'hot' ? 'thumbNum' : 'createTime',
      sortOrder: 'desc',
      current: 1,
    }, () => this.fetchComments(true));
  };

  handleShowMarkdownHelp = () => {
    this.setState({showMarkdownHelp: true});
  };

  handleCloseMarkdownHelp = () => {
    this.setState({showMarkdownHelp: false});
  };

  render() {
    const {comments, loading, total, newContent, submitting, sortField, showMarkdownHelp} = this.state;

    return (
      <ScrollView className='answer-page' scrollY onScrollToLower={this.handleLoadMore}>
        <View className='page-header'>
          <Text className='title'>回答本题</Text>
          <View className='sort-tabs'>
            <AtTag className='at-tag' active={sortField === 'createTime'}
                   onClick={() => this.switchSort('latest')}>最新</AtTag>
            <AtTag className='at-tag' active={sortField === 'thumbNum'}
                   onClick={() => this.switchSort('hot')}>最热</AtTag>
          </View>
        </View>

        <View className='editor-card'>
          <Text className='section-title'>写下你的回答</Text>
          <View className='section-desc-container'>
            <View className='help-icon'>
              <AtIcon value='help' size={20} color='#3b82f6' onClick={this.handleShowMarkdownHelp}/>
              <Text className='section-desc'>【支持 Markdown 格式】</Text>
            </View>
          </View>
          <Textarea
            value={newContent}
            onInput={e => this.setState({newContent: e.detail.value})}
            maxlength={2000}
            placeholder='请输入你的回答...'
            className='textarea'
            autoHeight
          />
          <AtButton type='primary' loading={submitting} onClick={this.handleSubmit}
                    className='submit-btn'>提交回答</AtButton>
        </View>

        <View className='list-header'>
          <Text className='section-title'>所有回答 ({total})</Text>
        </View>

        {comments.length === 0 && !loading ? (
          <View className='empty-state'>
            <Text className='empty-icon'>💭</Text>
            <Text className='empty-title'>暂无回答</Text>
            <Text className='empty-desc'>成为第一个回答这个问题的人吧！</Text>
          </View>
        ) : (
          <View className='comment-list'>
            {comments.map((item, idx) => (
              <View key={item.id} className='comment-card'>
                <View className='comment-header'>
                  <Text className='comment-user'>{item.user?.userName || '匿名用户'}</Text>
                  <Text
                    className='comment-time'>{item.createTime ? dayjs(item.createTime).format('YYYY-MM-DD HH:mm') : ''}</Text>
                </View>
                <View className='comment-content'>
                  <MarkdownRenderer content={item.content} />
                </View>
                <View className='comment-actions'>
                  <View className='action' onClick={() => this.handleLike(item.id, idx)}>
                    <AtIcon value='heart' size='16' color='#e94848'/>
                    <Text className='action-text'>{item.thumbNum || 0}</Text>
                  </View>
                </View>
              </View>
            ))}
            {!loading && comments.length < total && (
              <View className='load-more'>
                <AtButton size='small' onClick={this.handleLoadMore}>加载更多</AtButton>
              </View>
            )}
            {loading && (
              <View className='loading'>
                <Text>加载中...</Text>
              </View>
            )}
          </View>
        )}

        <AtModal isOpened={showMarkdownHelp} onClose={this.handleCloseMarkdownHelp} className='markdown-help-modal'>
          <AtModalHeader>Markdown 格式示例</AtModalHeader>
          <AtModalContent>
            <View className='markdown-tutorial'>
              <View className='tutorial-item'>
                <Text className='tutorial-label'>一级标题：</Text>
                <Text className='tutorial-example'># 一级标题内容</Text>
              </View>
              <View className='tutorial-item'>
                <Text className='tutorial-label'>二级标题：</Text>
                <Text className='tutorial-example'>## 二级标题内容</Text>
              </View>
              <View className='tutorial-item'>
                <Text className='tutorial-label'>三级标题：</Text>
                <Text className='tutorial-example'>### 三级标题内容</Text>
              </View>
              <View className='tutorial-item'>
                <Text className='tutorial-label'>高亮：</Text>
                <Text className='tutorial-example'>` 高亮内容 `</Text>
              </View>
              <View className='tutorial-item'>
                <Text className='tutorial-label'>代码块：</Text>
                <Text className='tutorial-example'>``` {'\n'} 代码块内容 {'\n'} ```</Text>
              </View>
            </View>
          </AtModalContent>
          <AtModalAction>
            <AtButton onClick={this.handleCloseMarkdownHelp}>确定</AtButton>
          </AtModalAction>
        </AtModal>
      </ScrollView>
    );
  }
}
