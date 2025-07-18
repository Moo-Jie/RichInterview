import {Component} from 'react';
import {View, Text, ScrollView} from '@tarojs/components';
import Taro from '@tarojs/taro';
import {AtCard, AtList, AtListItem, AtIcon} from 'taro-ui';
import {getHotQuestionBanks, listQuestionBankVOByPage} from '../../api/questionBank';
import './index.scss';
import dayjs from "dayjs";

type State = {
  banks: any[];
  loading: boolean;
};

export default class QuestionBanks extends Component<{}, State> {
  state: State = {
    banks: [],
    loading: true,
  };

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    try {
      // 并行获取基础数据和热点数据
      const [basicData, hotspotData] = await Promise.all([
        listQuestionBankVOByPage({
          pageSize: 100,
          sortField: 'createTime',
          sortOrder: 'descend'
        }),
        getHotQuestionBanks()
      ]);

      // 合并数据
      // @ts-ignore
      const banks = basicData.map(bank => {
        const hotspot = hotspotData.find(h => h.questionBankId === bank.id);
        return {
          ...bank,
          viewNum: hotspot?.viewNum || 0,
          starNum: hotspot?.starNum || 0
        };
      });

      this.setState({banks, loading: false});
    } catch (error) {
      Taro.showToast({title: '数据加载失败', icon: 'none'});
      this.setState({loading: false});
    }
  }

  handleNavigateToBank = (bankId: string) => {
    Taro.navigateTo({url: `/pages/questionBank/index?id=${bankId}`});
  };

  render() {
    const {banks, loading} = this.state;

    return (
      <View className='banks-container'>
        <ScrollView className='banks-page' scrollY>
          <AtCard title="📚 全部题库" note={`共 ${banks.length} 个题库`}>
            {loading ? (
              <Text className='loading-text'>加载中...</Text>
            ) : banks.length === 0 ? (
              <Text className='empty-text'>暂无题库数据</Text>
            ) : (
              <AtList>
                {banks.map((bank, index) => (
                  <AtListItem
                    key={bank.id}
                    title={`${index + 1}. ${bank.title}`}
                    note={
                      <View className='bank-info'>
                        <Text className='description'>{bank.description}</Text>
                        <View className='meta-stats'>
                          <View className='stats'>
                            <AtIcon value='eye' size='14' color='#666'/>
                            <Text className='stat'>{bank.viewNum || 0}</Text>
                            <AtIcon value='heart-2' size='14' color='#eb5757' className='heart-icon'/>
                            <Text className='stat'>{bank.starNum || 0}</Text>
                          </View>
                          <Text className='update-time'>
                            <AtIcon value='clock' size='14'/>
                            {dayjs(bank.updateTime).format('YYYY-MM-DD')}
                          </Text>
                        </View>
                      </View>
                    }
                    arrow='right'
                    onClick={() => this.handleNavigateToBank(bank.id)}
                  />
                ))}
              </AtList>
            )}
          </AtCard>
        </ScrollView>
      </View>
    );
  }
}
