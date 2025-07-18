import {Component} from 'react';
import Taro from '@tarojs/taro';
import {View, ScrollView, Text} from '@tarojs/components';
import {AtSearchBar, AtList, AtListItem, AtInput, AtTag, AtIcon} from 'taro-ui';
import {searchQuestions} from '../../api/question';
import './index.scss';

type State = {
  searchParams: {
    searchText?: string; // 主搜索条件（整合标题检索）
    tags: string[];      // 标签检索
    sortField: string;
    sortOrder: 'ascend' | 'descend';
  };
  current: number;
  pageSize: number;
  questions: any[];
  total: number;
  loading: boolean;
  inputTag: string;
};

export default class QuestionSearch extends Component<{}, State> {
  state: State = {
    searchParams: {
      searchText: '',
      tags: [],
      sortField: 'createTime',
      sortOrder: 'descend'
    },
    current: 1,
    pageSize: 10,
    questions: [],
    total: 0,
    loading: false,
    inputTag: ''
  };

  componentDidMount() {
    this.loadData();
  }

  async loadData(isLoadMore = false) {
    this.setState({loading: true});
    try {
      const params = {
        ...this.state.searchParams,
        current: this.state.current,
        pageSize: this.state.pageSize
      };

      const {records, total} = await searchQuestions(params);

      this.setState(prev => ({
        questions: isLoadMore ? [...prev.questions, ...records] : records,
        total,
        current: isLoadMore ? prev.current : 1,
        loading: false
      }));
    } catch (error) {
      Taro.showToast({title: '加载失败', icon: 'none'});
      this.setState({loading: false});
    }
  }

  // 主搜索条件变更
  handleSearchChange = (value: string) => {
    this.setState(prev => ({
      searchParams: {...prev.searchParams, searchText: value}
    }));
  };

  // 触发搜索
  triggerSearch = () => {
    this.setState({current: 1}, () => this.loadData());
  };

  // 标签输入
  handleTagInput = (value: string) => {
    this.setState({inputTag: value});
  };

  // 添加标签
  addTag = () => {
    const {inputTag, searchParams} = this.state;
    if (inputTag && !searchParams.tags.includes(inputTag)) {
      this.setState(prev => ({
        searchParams: {
          ...prev.searchParams,
          tags: [...prev.searchParams.tags, inputTag]
        },
        inputTag: ''
      }), () => this.triggerSearch()); // 添加标签后触发搜索
    }
  };

  // 移除标签
  removeTag = (index: number) => {
    this.setState(prev => ({
      searchParams: {
        ...prev.searchParams,
        tags: prev.searchParams.tags.filter((_, i) => i !== index)
      }
    }), () => this.triggerSearch()); // 移除标签后触发搜索
  };

  // 加载更多
  onReachBottom = () => {
    if (this.state.questions.length < this.state.total && !this.state.loading) {
      this.setState(
        prev => ({current: prev.current + 1}),
        () => this.loadData(true)
      );
    }
  };

  render() {
    const {questions, loading, total, searchParams, inputTag} = this.state;

    return (
      <View className='question-container'>
        <View className='search-header'>
          <AtSearchBar
            value={searchParams.searchText || ''}
            onChange={this.handleSearchChange}
            onActionClick={this.triggerSearch}
            onConfirm={this.triggerSearch}
            placeholder='输入题目关键词 / 内容'
          />

          <View className='tag-section'>
            <AtInput
              name='tag'
              border={false}
              type='text'
              placeholder='输入标签（如：Spring Boot）'
              value={inputTag}
              onChange={this.handleTagInput}
              onConfirm={this.addTag}
            />
            <View className='tag-list'>
              {searchParams.tags.map((tag, index) => (
                <AtTag
                  key={tag}
                  className='tag-item'
                  type='primary'
                  circle
                  onClick={() => this.removeTag(index)}
                >
                  {tag}
                </AtTag>
              ))}
            </View>
          </View>
        </View>

        <ScrollView
          scrollY
          className='result-list'
          onScrollToLower={this.onReachBottom}
        >
          <AtList>
            {questions.map((q) => (
              <AtListItem
                key={q.id}
                title={q.title}
                note={
                  <View className='question-info'>
                    {q.tagList?.length > 0 && (
                      <View className='tags'>
                        {q.tagList.map(tag => (
                          <Text className='tag' key={tag}>#{tag}</Text>
                        ))}
                      </View>
                    )}
                    <View className='meta'>
                      <Text className='date'>
                        <AtIcon value='calendar' size={14}/>
                        {new Date(q.createTime).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                }
                arrow='right'
                onClick={() => Taro.navigateTo({
                  url: `/pages/question/index?id=${q.id}`
                })}
              />
            ))}
          </AtList>

          {loading && <Text className='loading'>加载中...</Text>}
          {!loading && questions.length === 0 && (
            <Text className='empty-text'>暂无相关题目</Text>
          )}
          {!loading && questions.length > 0 && questions.length >= total && (
            <Text className='no-more'>没有更多了~</Text>
          )}
        </ScrollView>
      </View>
    );
  }
}
