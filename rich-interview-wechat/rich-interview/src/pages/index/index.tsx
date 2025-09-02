  import React, {Component} from 'react';
  import {View, Text, ScrollView, Input, Textarea} from '@tarojs/components';
  import Taro from '@tarojs/taro';
  import {AtCard, AtList, AtListItem, AtDrawer, AtIcon} from 'taro-ui';
  import {Image} from '@tarojs/components';
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

  // 隐私保护指引组件
  const PrivacyPolicyGuide: React.FC = () => {
    return (
      <View className="privacy-guide">
        <Text>
          登录/注册即代表你同意:
        </Text>
        <Text
          className="privacy-link"
          onClick={() => Taro.navigateTo({ url: '/pages/privacy/index' })}
        >
          《用户隐私保护指引》
        </Text>
      </View>
    );
  };

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
      userName: string;
      phoneNumber: string;
      email: string;
      grade: string;
      workExperience: string;
      expertiseDirection: string;
      userAavatar: string;
      userProfile: string;
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
        userName: '',
        phoneNumber: '',
        email: '',
        grade: '',
        workExperience: '',
        expertiseDirection: '',
        userAavatar: '',
        userProfile: '',
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
          getHotQuestionBanks(10),
          getNewQuestionBanks(10),
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
      Taro.switchTab({url: '/pages/user/index'});
    };

    handleNavigateToBank(questionBankId: string) {
      if (!this.state.userInfo) {
        this.handleOpenLoginDrawer();
        return;
      }
      Taro.navigateTo({url: `/pages/questionBank/index?id=${questionBankId}`});
    }

    handleNavigateToQuestion(questionId: string) {
      if (!this.state.userInfo) {
        this.handleOpenLoginDrawer();
        return;
      }
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
        registerForm: {
          userAccount: '',
          userPassword: '',
          checkPassword: '',
          userName: '',
          phoneNumber: '',
          email: '',
          grade: '',
          workExperience: '',
          expertiseDirection: '',
          userAavatar: '',
          userProfile: '',
        },
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
      const {loginForm, registerForm} = this.state;
      const userAccount = loginForm.userAccount || registerForm.userAccount;
      const userPassword = loginForm.userPassword || registerForm.userPassword;

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

          // 刷新当前页面
          const pages = Taro.getCurrentPages();
          if (pages.length > 0) {
            const currentPage = pages[pages.length - 1];
            Taro.reLaunch({url: `/${currentPage.route}`});
          }
        } else {
          const errorMsg = response?.message || '登录失败，请重试';
          Taro.showToast({title: errorMsg, icon: 'none'});
        }
      } catch (error) {
        console.error('登录出错', error);
        Taro.showToast({title: `登录失败: ${error.message}`, icon: 'none'});
      } finally {
        this.setState({loginLoading: false});
      }
    };

    handleRegisterSubmit = async () => {
      const {registerForm} = this.state;
      const {
        userAccount,
        userPassword,
        checkPassword,
        userName,
        phoneNumber,
        email,
        grade,
        workExperience,
        expertiseDirection,
        userAavatar,
        userProfile,
      } = registerForm;

      // 核心字段非空校验
      if (!userAccount || !userPassword || !checkPassword || !userName || !phoneNumber) {
        Taro.showToast({title: '请填写必填信息', icon: 'none'});
        return;
      }

      if (userPassword !== checkPassword) {
        Taro.showToast({title: '两次密码输入不一致', icon: 'none'});
        return;
      }

      // 手机号格式校验
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(phoneNumber)) {
        Taro.showToast({title: '请输入有效的手机号码', icon: 'none'});
        return;
      }

      this.setState({registerLoading: true});

      try {
        // 构造完整的注册数据
        const registerData = {
          userAccount,
          userPassword,
          checkPassword,
          userName,
          phoneNumber,
          email: email,
          grade: grade,
          workExperience: workExperience,
          expertiseDirection: expertiseDirection,
          userAavatar: userAavatar,
          userProfile: userProfile,
        };

        const userId = await userRegister(registerData);
        if (userId > 0) {
          Taro.showToast({title: '注册成功', icon: 'success'});
          // 自动登录
          await this.handleLoginSubmit();
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

    handleNavigateToOfficialWebsite = () => {
      const url = 'https://richdu.cn/';
      Taro.setClipboardData({
        data: url,
        success: () => {
          Taro.showToast({
            title: '链接已复制，请粘贴到浏览器打开',
            icon: 'none'
          });
        }
      });
    };

    renderLoginForm() {
      const {loginForm, loginLoading} = this.state;

      return (
        <ScrollView scrollY className="login-drawer">
          <View className="login-form">
            <View className="input-group">
              <AtIcon prefixClass='fa' value='user' size={18} className='input-icon'/>
              <Input
                className="login-input"
                value={loginForm.userAccount}
                placeholder="请输入账号"
                onInput={(e) => this.handleLoginInputChange('userAccount', e.detail.value)}
              />
            </View>

            <View className="input-group">
              <AtIcon prefixClass='fa' value='lock' size={18} className='input-icon'/>
              <Input
                className="login-input"
                value={loginForm.userPassword}
                password
                placeholder="请输入密码"
                onInput={(e) => this.handleLoginInputChange('userPassword', e.detail.value)}
              />
            </View>

            <View
              className={`login-button ${loginLoading ? 'loading' : ''}`}
              onClick={this.handleLoginSubmit}
            >
              {loginLoading ? <AtIcon prefixClass='fa' value='  ner' size={20} className='loading-icon'/> : null}
              {loginLoading ? '登录中...' : '登录'}
            </View>

            {/*<View className="third-login">*/}
            {/*  <Text className="divider">其他登录方式</Text>*/}
            {/*  <View className="third-icons">*/}
            {/*    <View className="icon-item" onClick={() => Taro.showToast({ title: '微信登录', icon: 'none' })}>*/}
            {/*      <AtIcon prefixClass='fa' value='weixin' size={30} color='#09BB07' />*/}
            {/*    </View>*/}
            {/*    <View className="icon-item" onClick={() => Taro.showToast({ title: 'QQ登录', icon: 'none' })}>*/}
            {/*      <AtIcon prefixClass='fa' value='qq' size={30} color='#12B7F5' />*/}
            {/*    </View>*/}
            {/*  </View>*/}
            {/*</View>*/}

            {/* 添加隐私指引 */}
            <PrivacyPolicyGuide />

            <Text className="switch-text" onClick={this.switchToRegister}>
              没有账号？<Text className="highlight">去注册</Text>
            </Text>
          </View>
        </ScrollView>
      );
    }

    renderRegisterForm() {
      const {registerForm, registerLoading} = this.state;

      return (
        <ScrollView scrollY className="login-drawer">
          <Text className="form-section-title">账号信息</Text>
          <View className="form-section">
            <View className="input-group">
              <AtIcon prefixClass='fa' value='user' size={18} className='input-icon'/>
              <Input
                className="form-input"
                value={registerForm.userAccount}
                placeholder="请输入账号*"
                onInput={(e) => this.handleRegisterInputChange('userAccount', e.detail.value)}
              />
            </View>

            <View className="input-group">
              <AtIcon prefixClass='fa' value='lock' size={18} className='input-icon'/>
              <Input
                className="form-input"
                value={registerForm.userPassword}
                password
                placeholder="请输入密码*"
                onInput={(e) => this.handleRegisterInputChange('userPassword', e.detail.value)}
              />
            </View>

            <View className="input-group">
              <AtIcon prefixClass='fa' value='lock' size={18} className='input-icon'/>
              <Input
                className="form-input"
                value={registerForm.checkPassword}
                password
                placeholder="请确认密码*"
                onInput={(e) => this.handleRegisterInputChange('checkPassword', e.detail.value)}
              />
            </View>
          </View>

          <Text className="form-section-title">个人信息</Text>
          <View className="form-section">
            <View className="input-group">
              <AtIcon prefixClass='fa' value='id-card' size={16} className='input-icon'/>
              <Input
                className="form-input"
                value={registerForm.userName}
                placeholder="请输入用户名*"
                onInput={(e) => this.handleRegisterInputChange('userName', e.detail.value)}
              />
            </View>

            <View className="input-group">
              <AtIcon prefixClass='fa' value='phone' size={18} className='input-icon'/>
              <Input
                className="form-input"
                value={registerForm.phoneNumber}
                type="number"
                placeholder="请输入手机号*"
                maxlength={11}
                onInput={(e) => this.handleRegisterInputChange('phoneNumber', e.detail.value)}
              />
            </View>

            <View className="input-group">
              <AtIcon prefixClass='fa' value='envelope' size={16} className='input-icon'/>
              <Input
                className="form-input"
                value={registerForm.email}
                placeholder="请输入邮箱"
                onInput={(e) => this.handleRegisterInputChange('email', e.detail.value)}
              />
            </View>
          </View>

          <Text className="form-section-title">教育/职业信息</Text>
          <View className="form-section">
            <View className="input-group">
              <AtIcon prefixClass='fa' value='graduation-cap' size={16} className='input-icon'/>
              <Input
                className="form-input"
                value={registerForm.grade}
                placeholder="年级/学位"
                onInput={(e) => this.handleRegisterInputChange('grade', e.detail.value)}
              />
            </View>

            <View className="input-group">
              <AtIcon prefixClass='fa' value='briefcase' size={16} className='input-icon'/>
              <Input
                className="form-input"
                value={registerForm.workExperience}
                placeholder="工作经验"
                onInput={(e) => this.handleRegisterInputChange('workExperience', e.detail.value)}
              />
            </View>

            <View className="input-group">
              <AtIcon prefixClass='fa' value='star' size={16} className='input-icon'/>
              <Input
                className="form-input"
                value={registerForm.expertiseDirection}
                placeholder="擅长方向"
                onInput={(e) => this.handleRegisterInputChange('expertiseDirection', e.detail.value)}
              />
            </View>
          </View>

          <Text className="form-section-title">个人简介</Text>
          <View className="form-section">
            <Textarea
              className="form-textarea"
              value={registerForm.userProfile}
              placeholder="请简单介绍一下自己..."
              onInput={(e) => this.handleRegisterInputChange('userProfile', e.detail.value)}
            />
          </View>

          <View className="form-note">
            <Text>注：带*号为必填项，其他信息可在个人中心补充</Text>
          </View>

          {/* 添加隐私指引 */}
          <PrivacyPolicyGuide />

          <View
            className={`register-button ${registerLoading ? 'loading' : ''}`}
            onClick={this.handleRegisterSubmit}
          >
            {registerLoading ? <AtIcon prefixClass='fa' value='  ner' size={20} className='loading-icon'/> : null}
            {registerLoading ? '注册中...' : '立即注册'}
          </View>

          <Text className="switch-text" onClick={this.switchToLogin}>
            已有账号？<Text className="highlight">去登录</Text>
          </Text>
        </ScrollView>
      );
    }

    renderLoginDrawer() {
      const {showLoginDrawer, isRegistering} = this.state;

      return (
        <AtDrawer
          show={showLoginDrawer}
          onClose={this.handleCloseLoginDrawer}
          right={false}
          width="90%"
        >
          <View className="login-drawer">
            <Text className="login-title">{isRegistering ? '注册账号' : '用户登录'}</Text>
            <View className="form-spacer"/>
            {!isRegistering ? this.renderLoginForm() : this.renderRegisterForm()}
          </View>
        </AtDrawer>
      );
    }

    renderLoading() {
      return (
        <View className='loading-container'>
          <AtIcon prefixClass='fa' value='  ner' size={40} color='#3B82F6'/>
          <Text className='loading-text'>数据加载中...</Text>
        </View>
      );
    }

    render() {
      const {hotBanks, newBanks, hotQuestions, loading, dailyQuestion, userInfo} = this.state;

      if (loading) {
        return this.renderLoading();
      }

      return (
        <View className='index-container'>
          {/* 顶部用户信息区域 */}
          <View className="user-header">
            <View
              className="user-info-container"
              onClick={userInfo ? this.handleNavigateToUserCenter : this.handleOpenLoginDrawer}
            >
              {userInfo ? (
                <>
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
                  <Text className="user-name">{userInfo.userName || '用户'}</Text>
                </>
              ) : (
                <View className="avatar-container">
                  <AtIcon prefixClass='fa' value='user-circle' size={28} className='login-icon'/>
                  <Text className="official-website-btn">点击登录/注册</Text>
                </View>
              )}
            </View>

            <View
              className="official-website-btn"
              onClick={this.handleNavigateToOfficialWebsite}
            >
              <AtIcon prefixClass='fa' value='external-link' size={16}/>
              <Text>访问官网</Text>
            </View>
          </View>

          <ScrollView className='index-page' scrollY>
            {/* 每日一刷模块 */}
            <AtCard title="📅 每日一刷" className='section-card' note={"精选题目每日一刷"}>
              <View className='custom-list-item'>
                <AtListItem
                  title={dailyQuestion.title}
                  note={
                    <View className='note-container'>
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
            <AtCard title="🔥 热门题库 TOP10" note={"社区精选题库"} className='section-card'>
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
                      <Text className='stat'>浏览： {bank.viewNum || 0}</Text>
                      <Text className='stat'>点赞：{bank.starNum || 0}</Text>
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
            <AtCard title="🔥 热门题目 TOP10" note={"社区精选题目"} className='section-card'>
              <AtList>
                {hotQuestions.map(question => (
                  <AtListItem
                    key={question.id}
                    title={question.title}
                    note={`浏览： ${question.viewNum} | 点赞：${question.starNum}`}
                    arrow='right'
                    onClick={() => this.handleNavigateToQuestion(question.questionId)}
                  />
                ))}
              </AtList>
            </AtCard>

            {/* 最新题库列表 */}
            <AtCard title="📚 最新题库" note={"社区最新题库"} className='section-card'>
              <AtList>
                {newBanks.map(bank => (
                  <AtListItem
                    key={bank.id}
                    title={bank.title}
                    note={`${bank.description} | 最近更新：${dayjs(bank.updateTime).format('YYYY-MM-DD HH:mm')}`}
                    arrow='right'
                    onClick={() => this.handleNavigateToBank(bank.id)}
                  />
                ))}
              </AtList>
            </AtCard>

            {/* 最新题目模块 */}
            <AtCard title="🆕 最新题目" note={"社区最新题目"} className='section-card'>
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

          {/* 底部栏占位 */}
          <View className="footer-placeholder"/>
        </View>
      );
    }
  }
