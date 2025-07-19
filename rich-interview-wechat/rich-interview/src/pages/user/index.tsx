import {Component} from 'react';
import {View, Text, ScrollView} from '@tarojs/components';
import Taro from '@tarojs/taro';
import {AtCard, AtList, AtListItem, AtButton, AtIcon} from 'taro-ui';
import {Image} from '@tarojs/components';
import {getLoginUser} from '../../api/user';
import {addUserSignIn, getUserSignInRecord} from '../../api/user'; // 导入签到相关API
import {EventBus} from "../../eventBus";
import './index.scss';

type State = {
  userInfo: any;
  loading: boolean;
  stats: {
    correctRate: number;
    consecutiveDays: number;
    badges: string[];
  };
  totalQuestions: number;
  signInRecords: number[]; // 存储签到记录
  todaySigned: boolean; // 记录今天是否已签到
  currentYear: number; // 当前年份
  todayIndex: number; // 今天在一年中的序号
  currentMonth: number; // 新增当前月份状态
};

export default class UserCenter extends Component<{}, State> {
  state: State = {
    userInfo: null,
    loading: true,
    currentMonth: new Date().getMonth(),
    stats: {
      correctRate: 0,
      consecutiveDays: 0,
      badges: [],
    },
    signInRecords: [],
    totalQuestions: 0,
    todaySigned: false,
    currentYear: new Date().getFullYear(),
    todayIndex: this.getDayOfYear(new Date()),
  };

  changeMonth = (offset: number) => {
    this.setState(prevState => {
      const newDate = new Date(prevState.currentYear, prevState.currentMonth + offset);
      return {
        currentYear: newDate.getFullYear(),
        currentMonth: newDate.getMonth()
      };
    });
  };

  // 计算日期在一年中的序号
  getDayOfYear(date: Date): number {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  // 根据总问题数计算成就徽章
  calculateBadges = (total: number): string[] => {
    // 当totalQuestions为0时不计算徽章
    if (total === 0) return [];

    if (total < 7) {
      return ['初来乍到', '本站新人'];
    } else if (total >= 7 && total < 30) {
      return ['突飞猛进', '奋斗者'];
    } else {
      return ['刷题老油条', '突飞猛进', '奋斗者'];
    }
  }

  async componentDidMount() {
    EventBus.on('userUpdate', this.handleUserUpdate);
    EventBus.on('userLogout', this.handleUserLogout);
    await this.loadUserData();
  }

  componentWillUnmount() {
    EventBus.off('userUpdate', this.handleUserUpdate);
    EventBus.off('userLogout', this.handleUserLogout);
  }

  handleUserUpdate = (userVO: any) => {
    this.setState({userInfo: userVO});
  };

  handleUserLogout = () => {
    this.setState({userInfo: null});
  };

  // 处理签到功能
  handleSignIn = async () => {
    try {
      const result = await addUserSignIn();
      if (result) {
        Taro.showToast({
          title: '签到成功！',
          icon: 'success',
          success: () => {
            // 移除重定向逻辑，直接更新状态
            this.setState({todaySigned: true}, async () => {
              await this.loadSignInData();
              this.updateConsecutiveDays();
            });
          }
        });
      }
    } catch (error) {
      Taro.showToast({title: '签到失败，请重试', icon: 'none'});
      console.error('签到失败:', error);
    }
  };

  // 加载签到数据
  loadSignInData = async () => {
    try {
      // 修改响应解构方式
      const records = await getUserSignInRecord(this.state.currentYear);
      this.setState(prevState => ({
        signInRecords: records,
        todaySigned: records.includes(this.state.todayIndex),
        totalQuestions: records.length,
        stats: {
          ...prevState.stats,
          badges: this.calculateBadges(records.length)
        }
      }));
    } catch (error) {
      console.error('加载签到记录失败:', error);
    }
  };

  // 根据签到记录计算连续打卡天数
  updateConsecutiveDays = () => {
    const {signInRecords, todayIndex} = this.state;
    const recordSet = new Set(signInRecords);
    let consecutive = 0;
    let day = todayIndex;

    while (recordSet.has(day)) {
      consecutive++;
      // 检查前一天
      day--;
    }

    this.setState(prevState => ({
      stats: {
        ...prevState.stats,
        consecutiveDays: consecutive
      }
    }));
  };


  async loadUserData() {
    try {
      const user = await getLoginUser();
      if (user) {
        // 加载用户签到数据
        await this.loadSignInData();

        // 初始化统计数据
        const stats = {
          totalQuestions: 0,
          correctRate: Math.floor(Math.random() * 30) + 70,
          consecutiveDays: 0,
          badges: ['初来乍到', '本站新人'],
        };

        this.setState({
          userInfo: user,
          stats,
          loading: false,
        }, () => {
          // 状态更新后计算连续打卡天数
          this.updateConsecutiveDays();
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
    EventBus.emit('userLogout', null);

    const pages = Taro.getCurrentPages();
    if (pages.length > 0) {
      const currentPage = pages[pages.length - 1];
      Taro.reLaunch({url: `/${currentPage.route}`});
    }

    setTimeout(() => {
      Taro.switchTab({url: '/pages/index/index'});
    }, 300);
  };

  // 渲染签到日历视图
  renderSignInCalendar() {
    const {signInRecords, currentYear, currentMonth} = this.state;

    // 生成月份切换按钮
    const MonthSwitcher = () => (
      <View className="month-switcher">
        <AtIcon
          value="chevron-left"
          onClick={() => this.changeMonth(-1)}
          className="switch-icon"
        />
        <AtIcon
          value="chevron-right"
          onClick={() => this.changeMonth(1)}
          className="switch-icon"
        />
      </View>
    );

    // 生成当月日期数据（修改为使用 state 中的当前年月）
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const monthDays = Array.from({length: daysInMonth}, (_, i) => {
      const date = new Date(currentYear, currentMonth, i + 1);
      return {
        day: i + 1,
        dayOfYear: this.getDayOfYear(date),
        isToday: this.getDayOfYear(date) === this.getDayOfYear(new Date())
      };
    });

    return (
      <View className="signin-calendar">
        <View className="calendar-header">
          <Text className="calendar-title">
            {currentYear}年{currentMonth + 1}月
          </Text>
          <MonthSwitcher/>
        </View>
        <View className="calendar-grid">
          {monthDays.map(({day, dayOfYear, isToday}) => {
            const isSigned = signInRecords.includes(dayOfYear);
            return (
              <View
                key={day}
                className={`calendar-day
                ${isToday ? 'today' : ''}
                ${isSigned ? 'signed' : ''}`}
              >
                <Text>{day}</Text>
                {isToday && !isSigned && (
                  <View className="today-indicator">今</View>
                )}
              </View>
            );
          })}
        </View>
      </View>
    );
  }

  render() {
    const {userInfo, loading, stats, todaySigned, totalQuestions} = this.state;

    if (loading || !userInfo) {
      return (
        <View className="login-prompt-container">
          <View className="login-prompt-card">
            <Text className="prompt-icon">🔒</Text>
            <Text className="prompt-title">请先登录</Text>
            <Text className="prompt-desc">登录后即可查看个人中心</Text>
            <View className="login-button" onClick={this.handleLogout}>
              <Text>立即登录</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <ScrollView className="user-center-container" scrollY>
        {/* 用户信息卡片 */}
        <View className="user-profile-card">
          <View className="avatar-container">
            {userInfo.userAvatar ? (
              <Image
                src={userInfo.userAvatar}
                className="user-avatar"
                mode="aspectFill"
              />
            ) : (
              <View className="avatar-placeholder">
                <Text className="avatar-text">
                  {userInfo.userName?.charAt(0) || '?'}
                </Text>
              </View>
            )}
          </View>

          <View className="user-info">
            <Text className="user-name">{userInfo.userName || '未命名用户'}</Text>
            <Text className="user-role">{userInfo.userRole === 'admin' ? '管理员' : '普通用户'}</Text>
          </View>

          <View className="edit-btn" onClick={this.handleEditProfile}>
            <Text>编辑资料</Text>
          </View>
        </View>

        {/* 学习统计 */}
        <AtCard title="学习统计" className="stats-card">
          <View className="stats-grid">
            <View className="stat-item">
              <Text className="stat-value">{totalQuestions}</Text>
              <Text className="stat-label">打卡天数</Text>
            </View>
            <View className="stat-item">
              <Text className="stat-value">{stats.consecutiveDays}</Text>
              <Text className="stat-label">本月连续打卡</Text>
            </View>
          </View>

          {/* 签到按钮 */}
          <View className="signin-button-container">
            <AtButton
              type="primary"
              className={`signin-button ${todaySigned ? 'signed' : ''}`}
              onClick={this.handleSignIn}
              disabled={todaySigned}
            >
              {todaySigned ? (
                <>
                  <AtIcon value="check" size="16" color="#ffffff"/>
                  <Text>今日已签到</Text>
                </>
              ) : (
                <Text>双击签到</Text>
              )}
            </AtButton>
          </View>
        </AtCard>

        {/* 签到日历 */}
        {this.renderSignInCalendar()}

        {/* 成就徽章 */}
        <AtCard title="成就徽章" className="badges-card">
          <View className="badges-container">
            {stats.badges.map((badge, index) => (
              <View key={index} className="badge-item">
                <View className="badge-icon">
                  <Text>🏆</Text>
                </View>
                <Text className="badge-name">{badge}</Text>
              </View>
            ))}
          </View>
        </AtCard>

        {/* 个人信息 */}
        <AtCard title="个人信息" className="info-card">
          <AtList>
            <AtListItem title="签名" extraText={userInfo.userProfile || '这个用户很懒，什么也没留下'}/>
            <AtListItem title="邮箱" extraText={userInfo.email || '未设置'}/>
            <AtListItem title="手机" extraText={userInfo.phoneNumber || '未设置'}/>
            <AtListItem title="学历" extraText={userInfo.grade || '未设置'}/>
            <AtListItem title="工作经验" extraText={userInfo.workExperience || '未设置'}/>
            <AtListItem title="专业方向" extraText={userInfo.expertiseDirection || '未设置'}/>
          </AtList>
        </AtCard>

        {/* 操作按钮 */}
        <View className="action-buttons">
          <View className="action-btn primary" onClick={this.handleEditProfile}>
            <Text>编辑资料</Text>
          </View>
          <View className="action-btn logout" onClick={this.handleLogout}>
            <Text>退出登录</Text>
          </View>
        </View>
      </ScrollView>
    );
  }
}
