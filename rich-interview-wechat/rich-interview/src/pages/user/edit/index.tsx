import {Component} from 'react';
import Taro from '@tarojs/taro';
import {Image, ScrollView, Text, View} from '@tarojs/components';
import {AtButton, AtInput, AtTextarea, AtToast} from 'taro-ui';
import {EventBus} from '../../../eventBus';
import {getLoginUser, updateUserInfo, UserUpdateMyRequest, UserVO} from '../../../api/user';
import './index.scss';

interface State {
  userInfo: UserVO | null;
  formData: UserUpdateMyRequest;
  loading: boolean;
  isSaving: boolean;
  showToast: boolean;
  toastMessage: string;
  avatarTempPath: string | null;
  // 用于标记字段错误
  errors: {
    userName?: boolean;
    phoneNumber?: boolean;
    email?: boolean;
  };
}

export default class UserEditPage extends Component<{}, State> {
  state: State = {
    userInfo: null,
    formData: {
      userName: '',
      userProfile: '',
      phoneNumber: '',
      email: '',
      grade: '',
      workExperience: '',
      expertiseDirection: '',
      userAvatar: ''
    },
    loading: true,
    isSaving: false,
    showToast: false,
    toastMessage: '',
    avatarTempPath: null,
    errors: {}
  };

  async componentDidMount() {
    await this.loadUserData();
  }

  loadUserData = async () => {
    try {
      const user = await getLoginUser();
      if (!user) {
        Taro.showToast({title: '请先登录', icon: 'none'});
        setTimeout(() => Taro.switchTab({url: '/pages/index/index'}), 1500);
        return;
      }

      // 过滤掉可能的null值
      const filteredUser: UserVO = Object.fromEntries(
        Object.entries(user).filter(([_, v]) => v !== null)
      ) as UserVO;

      this.setState({
        userInfo: filteredUser,
        formData: {
          userName: filteredUser.userName || '',
          userProfile: filteredUser.userProfile || '',
          phoneNumber: filteredUser.phoneNumber || '',
          email: filteredUser.email || '',
          grade: filteredUser.grade || '',
          workExperience: filteredUser.workExperience || '',
          expertiseDirection: filteredUser.expertiseDirection || '',
          userAvatar: filteredUser.userAvatar || ''
        },
        loading: false
      });
    } catch (error) {
      console.error('加载用户数据失败', error);
      Taro.showToast({title: '加载失败', icon: 'none'});
      this.setState({loading: false});
    }
  };

  handleInputChange = (field: keyof UserUpdateMyRequest, value: string) => {
    // 清除字段错误状态
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [field]: value
      },
      errors: {
        ...prevState.errors,
        [field]: false
      }
    }));
  };

  // 验证表单函数
  validateForm = (): boolean => {
    const {formData} = this.state;
    const errors = {
      userName: !formData.userName?.trim(),
      phoneNumber: formData.phoneNumber ?
        !/^1[3-9]\d{9}$/.test(formData.phoneNumber) :
        false,
      email: formData.email ?
        !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email) :
        false
    };

    this.setState({errors});

    if (errors.userName || errors.phoneNumber || errors.email) {
      let message = '请填写完整必要信息';
      if (errors.userName) message = '用户名不能为空';
      else if (errors.phoneNumber) message = '手机号格式不正确';
      else if (errors.email) message = '邮箱格式不正确';

      this.showToast(message);
      return false;
    }
    return true;
  };

  showToast = (message: string) => {
    this.setState({
      showToast: true,
      toastMessage: message
    });
    setTimeout(() => this.setState({showToast: false}), 2000);
  };

  handleSave = async () => {
    if (!this.validateForm()) return;

    this.setState({isSaving: true});
    try {
      // 如果有临时头像路径，先上传头像
      if (this.state.avatarTempPath) {
        // 这里需要实现实际的上传功能（需要后端API支持）
        // 伪代码: const avatarUrl = await uploadAvatar(this.state.avatarTempPath);
        // 在实际应用中替换以下两行
        const avatarUrl = `https://temp-avatar.com/${Date.now()}.jpg`;
        this.handleInputChange('userAvatar', avatarUrl);
      }

      await updateUserInfo(this.state.formData);
      this.showToast('保存成功');

      // 通知用户中心更新数据
      EventBus.emit('userUpdate', this.state.formData);

      // 延迟返回
      setTimeout(() => Taro.navigateBack(), 1500);
    } catch (error) {
      console.error('保存失败', error);
      this.showToast('保存失败，请重试');
    } finally {
      this.setState({isSaving: false});
    }
  };

  handleChooseAvatar = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sourceType: ['album', 'camera'],
        sizeType: ['compressed']
      });

      if (res.tempFilePaths.length > 0) {
        const tempPath = res.tempFilePaths[0];
        this.setState({
          avatarTempPath: tempPath
        });
      }
    } catch (error) {
      console.error('选择头像失败', error);
      this.showToast('选择头像失败');
    }
  };

  handleBack = () => {
    Taro.navigateBack();
  };

  render() {
    const {
      userInfo,
      loading,
      formData,
      isSaving,
      showToast,
      toastMessage,
      avatarTempPath,
      errors
    } = this.state;

    if (loading || !userInfo) {
      return <View className="loading-container">加载中...</View>;
    }

    // 头像处理（优先使用临时选择的）
    const displayAvatar = avatarTempPath || formData.userAvatar || userInfo.userAvatar;

    return (
      <ScrollView className="edit-container">
        {/* 头部区域 */}
        <View className="edit-header">
          <View className="back-btn" onClick={this.handleBack}>
            <Text>返回</Text>
          </View>
          <Text className="title">编辑资料</Text>
        </View>

        {/* 头像编辑区 */}
        <View className="avatar-section">
          <View className="avatar-container" onClick={this.handleChooseAvatar}>
            {displayAvatar ? (
              <Image src={displayAvatar} className="avatar" mode="aspectFill"/>
            ) : (
              <View className="avatar-placeholder">
                <Text className="icon">&#xe64e;</Text>
              </View>
            )}
            <View className="edit-mask">
              <Text className="edit-text">更换</Text>
            </View>
          </View>
          <Text className="avatar-hint">点击头像更换</Text>
        </View>

        {/* 表单编辑区 */}
        <View className="form-section">
          {/* 必填字段（带星号） */}
          <View className="form-group">
            <Text className={`form-label ${errors.userName ? 'error' : ''}`}>
              用户名 <Text className="required">*</Text>
            </Text>
            <AtInput
              name="userName"
              value={formData.userName}
              onChange={(value: string) => this.handleInputChange('userName', value)}
              placeholder="请输入用户名"
              maxlength={20}
              clear
              error={errors.userName}
            />
          </View>

          {/* 个人简介 */}
          <View className="form-group">
            <Text className="form-label">个人简介</Text>
            <AtTextarea
              value={formData.userProfile || ''}
              onChange={(value: string) => this.handleInputChange('userProfile', value)}
              placeholder="一句话介绍自己..."
              count={false}
            />
          </View>

          {/* 联系信息（多必填） */}
          <View className="form-group">
            <Text className={`form-label ${errors.phoneNumber ? 'error' : ''}`}>
              手机号 <Text className="required">*</Text>
            </Text>
            <AtInput
              name="phoneNumber"
              type="phone"
              value={formData.phoneNumber}
              onChange={(value: string) => this.handleInputChange('phoneNumber', value)}
              placeholder="请输入手机号码"
              maxlength={11}
              clear
              error={errors.phoneNumber}
            />
          </View>

          <View className="form-group">
            <Text className={`form-label ${errors.email ? 'error' : ''}`}>
              邮箱 <Text className="required">*</Text>
            </Text>
            <AtInput
              name="email"
              type="text"
              value={formData.email}
              onChange={(value: string) => this.handleInputChange('email', value)}
              placeholder="请输入邮箱"
              clear
              error={errors.email}
            />
          </View>

          {/* 职业信息 */}
          <View className="form-group">
            <Text className="form-label">学历</Text>
            <AtInput
              name="grade"
              value={formData.grade}
              onChange={(value: string) => this.handleInputChange('grade', value)}
              placeholder="例: 本科"
              clear
            />
          </View>

          <View className="form-group">
            <Text className="form-label">工作经验</Text>
            <AtInput
              name="workExperience"
              value={formData.workExperience}
              onChange={(value: string) => this.handleInputChange('workExperience', value)}
              placeholder="例: 3年前端开发经验"
              clear
            />
          </View>

          <View className="form-group">
            <Text className="form-label">专业方向</Text>
            <AtInput
              name="expertiseDirection"
              value={formData.expertiseDirection}
              onChange={(value: string) => this.handleInputChange('expertiseDirection', value)}
              placeholder="例: 前端开发"
              clear
            />
          </View>
        </View>

        {/* 操作按钮 */}
        <View className="action-buttons">
          <AtButton
            className="save-btn"
            type="primary"
            onClick={this.handleSave}
            loading={isSaving}
            disabled={isSaving}
          >
            保存修改
          </AtButton>
        </View>

        {/* 提示消息 */}
        <AtToast
          isOpened={showToast}
          text={toastMessage}
          status={toastMessage.includes('成功') ? 'success' : 'error'}
          duration={1500}
        />
      </ScrollView>
    );
  }
}
