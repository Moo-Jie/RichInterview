import {Component} from 'react';
import {View, Text, ScrollView, Input} from '@tarojs/components';
import Taro from '@tarojs/taro';
import {AtCard, AtList, AtListItem, AtDrawer} from 'taro-ui';
import {Image} from '@tarojs/components'
import {
  getHotQuestionBanks,
  getNewQuestionBanks,
} from '../../api/questionBank';
import {getHotQuestions, getNewQuestions} from '../../api/question';
import {userLogin, userRegister, getLoginUser} from '../../api/user';
import TagParser from '../../components/TagParserComponent/index';
import dayjs from 'dayjs';
import './index.scss';
import {EventBus} from "../../eventBus";

type State = {
  hotBanks: any[];
  newBanks: any[];
  hotQuestions: any[];
  loading: boolean;
  newQuestions: any[];
  dailyQuestion: any;
  userInfo: any;
  showLoginDrawer: boolean;
  loginForm: {
    userAccount: string;
    userPassword: string;
    userName?: string;
  };
  registerForm: {
    userAccount: string;
    userPassword: string;
    checkPassword: string;
    userName?: string;
  };
  isRegistering: boolean;
  loginLoading: boolean;
  registerLoading: boolean;
};

export default class Index extends Component<{}, State> {
  state: State = {
    hotBanks: [],
    newBanks: [],
    hotQuestions: [],
    loading: true,
    newQuestions: [],
    dailyQuestion: null,
    userInfo: null,
    showLoginDrawer: false,
    loginForm: {
      userAccount: '',
      userPassword: '',
    },
    registerForm: {
      userAccount: '',
      userPassword: '',
      checkPassword: '',
    },
    isRegistering: false,
    loginLoading: false,
    registerLoading: false,
  };

  componentDidMount() {
    this.loadData();
    this.checkLoginStatus();
  }

  async checkLoginStatus() {
    try {
      const token = Taro.getStorageSync('token');
      if (token) {
        const user = await getLoginUser();
        if (user) {
          this.setState({userInfo: user});
        }
      }
    } catch (error) {
      console.error('检查登录状态失败', error);
    }
  }

  async loadData() {
    try {
      const [hotBanks, newBanks, hotQuestions, newQuestions] = await Promise.all([
        getHotQuestionBanks(),
        getNewQuestionBanks(),
        getHotQuestions(),
        getNewQuestions(),
      ]);

      this.setState({
        hotBanks,
        newBanks,
        hotQuestions,
        newQuestions,
        dailyQuestion: newQuestions.length > 0
          ? newQuestions[Math.floor(Math.random() * newQuestions.length)]
          : null,
        loading: false,
      });
    } catch (error) {
      Taro.showToast({title: '数据加载失败', icon: 'none'});
      this.setState({loading: false});
    }
  }

  handleNavigateToUserCenter = () => {
    Taro.navigateTo({ url: '/pages/user/index' });
  };

  handleNavigateToBank(bankId: string) {
    Taro.navigateTo({url: `/pages/questionBank/index?id=${bankId}`});
  }

  handleNavigateToQuestion(questionId: string) {
    Taro.navigateTo({url: `/pages/question/index?id=${questionId}`});
  }

  handleOpenLoginDrawer = () => {
    this.setState({showLoginDrawer: true});
  };

  handleCloseLoginDrawer = () => {
    this.setState({
      showLoginDrawer: false,
      isRegistering: false,
      loginForm: {userAccount: '', userPassword: ''},
      registerForm: {userAccount: '', userPassword: '', checkPassword: ''},
    });
  };

  handleLoginInputChange = (field: keyof State['loginForm'], value: string) => {
    this.setState(prevState => ({
      loginForm: {
        ...prevState.loginForm,
        [field]: value,
      },
    }));
  };

  handleRegisterInputChange = (field: keyof State['registerForm'], value: string) => {
    this.setState(prevState => ({
      registerForm: {
        ...prevState.registerForm,
        [field]: value,
      },
    }));
  };

  handleLoginSubmit = async () => {
    const {userAccount, userPassword} = this.state.loginForm;
    if (!userAccount || !userPassword) {
      Taro.showToast({title: '请输入账号和密码', icon: 'none'});
      return;
    }

    this.setState({loginLoading: true});

    try {
      const response = await userLogin({userAccount, userPassword});
      if (response && response.code === 0 && response.data) {
        const userVO = response.data;
        Taro.setStorageSync('userInfo', userVO);

        EventBus.emit('userUpdate', userVO);

        this.setState({
          userInfo: userVO,
          showLoginDrawer: false
        });
      } else {
        Taro.showToast({title: '登录失败，请重试，或联系管理员', icon: 'none'});
      }
    } catch (error) {
      console.error('登录出错', error);
      Taro.showToast({title: '登录失败，请重试，或联系管理员', icon: 'none'});
    } finally {
      this.setState({loginLoading: false});
    }
  };

  handleRegisterSubmit = async () => {
    const {registerForm} = this.state;
    const {userAccount, userPassword, checkPassword} = registerForm;

    if (!userAccount || !userPassword || !checkPassword) {
      Taro.showToast({title: '请填写完整信息', icon: 'none'});
      return;
    }

    if (userPassword !== checkPassword) {
      Taro.showToast({title: '两次密码输入不一致', icon: 'none'});
      return;
    }

    this.setState({registerLoading: true});

    try {
      const userId = await userRegister(registerForm);
      if (userId > 0) {
        Taro.showToast({title: '注册成功', icon: 'success'});
        this.handleLoginSubmit();
      } else {
        Taro.showToast({title: '注册失败，请重试', icon: 'none'});
      }
    } catch (error) {
      console.error('注册出错', error);
      Taro.showToast({title: '注册失败，请重试', icon: 'none'});
    } finally {
      this.setState({registerLoading: false});
    }
  };

  switchToRegister = () => {
    this.setState({isRegistering: true});
  };

  switchToLogin = () => {
    this.setState({isRegistering: false});
  };

  handleLogout = () => {
    Taro.removeStorageSync('token');
    this.setState({userInfo: null});
    Taro.showToast({title: '已退出登录', icon: 'success'});
  };

  renderLoginDrawer() {
    const {
      showLoginDrawer,
      isRegistering,
      loginForm,
      registerForm,
      loginLoading,
      registerLoading
    } = this.state;

    return (
      <AtDrawer
        show={showLoginDrawer}
        onClose={this.handleCloseLoginDrawer}
        right={false}
        width="75%"
      >
        <View className="login-drawer">
          <Text className="login-title">{isRegistering ? '注册账号' : '用户登录'}</Text>
          {!isRegistering ? (
            <View className="login-form">
              <Input
                className="login-input"
                value={loginForm.userAccount}
                placeholder="请输入账号"
                onInput={(e) => this.handleLoginInputChange('userAccount', e.detail.value)}
              />
              <Input
                className="login-input"
                value={loginForm.userPassword}
                password
                placeholder="请输入密码"
                onInput={(e) => this.handleLoginInputChange('userPassword', e.detail.value)}
              />
              <View
                className={`login-button ${loginLoading ? 'loading' : ''}`}
                onClick={this.handleLoginSubmit}
              >
                {loginLoading ? '登录中...' : '登录'}
              </View>
              <Text className="switch-text" onClick={this.switchToRegister}>
                没有账号？去注册
              </Text>
            </View>
          ) : (
            <View className="login-form">
              <Input
                className="login-input"
                value={registerForm.userAccount}
                placeholder="请输入账号"
                onInput={(e) => this.handleRegisterInputChange('userAccount', e.detail.value)}
              />
              <Input
                className="login-input"
                value={registerForm.userPassword}
                password
                placeholder="请输入密码"
                onInput={(e) => this.handleRegisterInputChange('userPassword', e.detail.value)}
              />
              <Input
                className="login-input"
                value={registerForm.checkPassword}
                password
                placeholder="请确认密码"
                onInput={(e) => this.handleRegisterInputChange('checkPassword', e.detail.value)}
              />
              <View
                className={`login-button ${registerLoading ? 'loading' : ''}`}
                onClick={this.handleRegisterSubmit}
              >
                {registerLoading ? '注册中...' : '注册'}
              </View>
              <Text className="switch-text" onClick={this.switchToLogin}>
                已有账号？去登录
              </Text>
            </View>
          )}
        </View>
      </AtDrawer>
    );
  }

  render() {
    const {hotBanks, newBanks, hotQuestions, loading, dailyQuestion, userInfo} = this.state;

    if (loading) {
      return (
        <View className='loading-container'>
          <Text>数据加载中...</Text>
        </View>
      );
    }

    return (
      <View className='index-container'>
        {/* 右上角用户头像/登录状态 */}
        <View className="user-avatar-container" onClick={userInfo ? this.handleNavigateToUserCenter : this.handleOpenLoginDrawer}>
          {userInfo ? (
            <View className="user-info">
              <View className="avatar-with-shine">
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
              <Text className="user-name">{userInfo.userName || '用户'}</Text>
              <Text className="logout-btn" onClick={this.handleLogout}>退出登录</Text>
            </View>
          ) : (
            <View className="not-logged-container">
              <Text className="login-text">点击 登录/注册 </Text>
            </View>
          )}
        </View>

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
                    <Text className='stat'>👁️🗨 {bank.viewNum || 0}</Text>
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
                  note={`👁️🗨 ${question.viewNum} | 👍🏻 ${question.starNum}`}
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

        {/* 登录抽屉 */}
        {this.renderLoginDrawer()}
      </View>
    );
  }
}
