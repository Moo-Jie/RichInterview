import {Component} from 'react';
import {ScrollView, View} from '@tarojs/components';
import './index.scss';

type State = {};

export default class Index extends Component<{}, State> {
  render() {
    return (
      <View className='index-container'>
        <ScrollView className='index-page' scrollY>
          待开发......
        </ScrollView>
      </View>
    );
  }
}
