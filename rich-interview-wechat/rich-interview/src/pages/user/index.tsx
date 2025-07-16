import {Component} from 'react';
import {View, Text, ScrollView} from '@tarojs/components';
import Taro from '@tarojs/taro';
import {AtCard, AtList, AtListItem} from 'taro-ui';
import {Image} from '@tarojs/components';
import {getLoginUser} from '../../api/user';
import './index.scss';

type State = {
  userInfo: any;
  loading: boolean;
  stats: {
    totalQuestions: number;
    correctRate: number;
    consecutiveDays: number;
    badges: string[];
  };
};

export default class UserCenter extends Component<{}, State> {
  state: State = {
    userInfo: null,
    loading: true,
    stats: {
      totalQuestions: 0,
      correctRate: 0,
      consecutiveDays: 0,
      badges: [],
    },
  };

  async componentDidMount() {
    await this.loadUserData();
  }

  async loadUserData() {
    try {
      const user = await getLoginUser();
      if (user) {
        // 模拟用户统计数据
        const stats = {
          totalQuestions: Math.floor(Math.random() * 500) + 100,
          correctRate: Math.floor(Math.random() * 30) + 70,
          consecutiveDays: Math.floor(Math.random() * 100) + 1,
          badges: ['初来乍到', '本站新人'],
        };

        this.setState({
          userInfo: user,
          stats,
          loading: false,
        });
      } else {
        Taro.showToast({title: '请先登录', icon: 'none'});
        setTimeout(() => {
          Taro.switchTab({url: '/pages/index/index'});
        }, 1500);
      }
    } catch (error) {
      console.error('加载用户数据失败', error);
      Taro.showToast({title: '加载失败', icon: 'none'});
      this.setState({loading: false});
    }
  }

  handleEditProfile = () => {
    Taro.navigateTo({url: '/pages/user/edit/index'});
  };

  handleLogout = () => {
    Taro.removeStorageSync('token');
    Taro.removeStorageSync('userInfo');
    Taro.showToast({title: '已退出登录', icon: 'success'});
    setTimeout(() => {
      Taro.switchTab({url: '/pages/index/index'});
    }, 1500);
  };

  render() {
    const {userInfo, loading, stats} = this.state;

    if (loading) {
      return (
        <View className='loading-container'>
          <Text>加载中...</Text>
        </View>
      );
    }

    if (!userInfo) {
      return (
        <View className='no-user-container'>
          <Text>未登录</Text>
        </View>
      );
    }

    return (
      <ScrollView className='user-center-container' scrollY>
        {/* 用户信息卡片 */}
        <View className='user-profile-card'>
          <View className='avatar-container'>
            {userInfo.userAvatar ? (
              <Image
                src={userInfo.userAvatar}
                className='user-avatar'
                mode='aspectFill'
              />
            ) : (
              <View className='avatar-placeholder'>
                <Text className='avatar-text'>
                  {userInfo.userName?.charAt(0) || '?'}
                </Text>
              </View>
            )}
          </View>

          <View className='user-info'>
            <Text className='user-name'>{userInfo.userName || '未命名用户'}</Text>
            <Text className='user-role'>{userInfo.userRole === 'admin' ? '管理员' : '普通用户'}</Text>
          </View>

          <View className='edit-btn' onClick={this.handleEditProfile}>
            <Text>编辑资料</Text>
          </View>
        </View>

        {/* 学习统计 */}
        <AtCard title='学习统计' className='stats-card'>
          <View className='stats-grid'>
            <View className='stat-item'>
              <Text className='stat-value'>{stats.totalQuestions}</Text>
              <Text className='stat-label'>刷题总数</Text>
            </View>
            <View className='stat-item'>
              <Text className='stat-value'>{stats.consecutiveDays}</Text>
              <Text className='stat-label'>连续打卡</Text>
            </View>
          </View>
        </AtCard>

        {/* 成就徽章 */}
        <AtCard title='成就徽章' className='badges-card'>
          <View className='badges-container'>
            {stats.badges.map((badge, index) => (
              <View key={index} className='badge-item'>
                <View className='badge-icon'>
                  <Text>🏆</Text>
                </View>
                <Text className='badge-name'>{badge}</Text>
              </View>
            ))}
          </View>
        </AtCard>

        {/* 个人信息 */}
        <AtCard title='个人信息' className='info-card'>
          <AtList>
            <AtListItem title='签名' extraText={userInfo.userProfile || '这个用户很懒，什么也没留下'}/>
            <AtListItem title='邮箱' extraText={userInfo.email || '未设置'}/>
            <AtListItem title='手机' extraText={userInfo.phoneNumber || '未设置'}/>
            <AtListItem title='学历' extraText={userInfo.grade || '未设置'}/>
            <AtListItem title='工作经验' extraText={userInfo.workExperience || '未设置'}/>
            <AtListItem title='专业方向' extraText={userInfo.expertiseDirection || '未设置'}/>
          </AtList>
        </AtCard>

        {/* 操作按钮 */}
        <View className='action-buttons'>
          <View className='action-btn primary' onClick={this.handleEditProfile}>
            <Text>编辑资料</Text>
          </View>
          <View className='action-btn logout' onClick={this.handleLogout}>
            <Text>退出登录</Text>
          </View>
        </View>
      </ScrollView>
    );
  }
}
