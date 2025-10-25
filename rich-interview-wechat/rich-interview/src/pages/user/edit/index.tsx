import {Component} from 'react';
import Taro from '@tarojs/taro';
import {Image, ScrollView, Text, View} from '@tarojs/components';
import {AtButton, AtInput, AtTextarea, AtToast} from 'taro-ui';
import {EventBus} from '../../../eventBus';
import {getLoginUser, updateUserInfo, UserUpdateMyRequest, UserVO} from '../../../api/user';
import {chooseAndUploadAvatar} from '../../../api/upload';
import './index.scss';

interface State {
  userInfo: UserVO | null;
  formData: UserUpdateMyRequest;
  loading: boolean;
  isSaving: boolean;
  showToast: boolean;
  toastMessage: string;
  isUploadingAvatar: boolean;
  hasChanges: boolean; // 标记是否有未保存的更改
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
    isUploadingAvatar: false,
    hasChanges: false,
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
    this.setState(prevState => ({
      formData: {
        ...prevState.formData,
        [field]: value
      },
      // 清除对应字段的错误状态
      errors: {
        ...prevState.errors,
        [field]: false
      },
      // 标记有更改
      hasChanges: true
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
      // 调用更新API，直接返回更新后的用户信息
      const updatedUserInfo = await updateUserInfo(this.state.formData);

      if (updatedUserInfo) {
        this.setState({
          userInfo: updatedUserInfo,
          hasChanges: false // 重置更改状态
        });

        // 通知用户中心更新数据
        EventBus.emit('userUpdate', updatedUserInfo);

        this.showToast('保存成功');

        // 延迟返回
        setTimeout(() => Taro.navigateBack(), 1500);
      } else {
        this.showToast('保存失败，请重试');
      }
    } catch (error) {
      console.error('保存失败', error);

      // 根据错误类型提供更详细的错误信息
      let errorMessage = '保存失败，请重试';
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('未授权')) {
          errorMessage = '登录状态已过期，请重新登录';
        } else if (error.message.includes('403')) {
          errorMessage = '权限不足，无法修改用户信息';
        } else if (error.message.includes('网络')) {
          errorMessage = '网络连接失败，请检查网络后重试';
        } else if (error.message) {
          errorMessage = error.message;
        }
      }

      this.showToast(errorMessage);
    } finally {
      this.setState({isSaving: false});
    }
  };

  handleChooseAvatar = async () => {
    try {
      this.setState({isUploadingAvatar: true});

      const avatarUrl = await chooseAndUploadAvatar();

      if (avatarUrl) {
        // 更新表单数据中的头像URL
        this.handleInputChange('userAvatar', avatarUrl);
      } else {
        this.showToast('头像上传失败，请重试');
      }
    } catch (error) {
      console.error('上传头像失败', error);
      this.showToast('上传头像失败');
    } finally {
      this.setState({isUploadingAvatar: false});
    }
  };

  handleBack = async () => {
    const {hasChanges} = this.state;

    if (hasChanges) {
      try {
        const result = await Taro.showModal({
          title: '确认离开',
          content: '您有未保存的更改，确定要离开吗？',
          confirmText: '离开',
          cancelText: '取消'
        });

        if (result.confirm) {
          Taro.navigateBack();
        }
      } catch (error) {
        console.error('显示确认对话框失败:', error);
        Taro.navigateBack();
      }
    } else {
      Taro.navigateBack();
    }
  };

  render() {
    const {
      userInfo,
      loading,
      formData,
      isSaving,
      showToast,
      toastMessage,
      isUploadingAvatar,
      errors
    } = this.state;

    if (loading || !userInfo) {
      return <View className="loading-container">加载中...</View>;
    }

    // 头像处理（优先使用表单中的头像）
    const displayAvatar = formData.userAvatar || userInfo.userAvatar;

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
          <View
            className={`avatar-container ${isUploadingAvatar ? 'uploading' : ''}`}
            onClick={isUploadingAvatar ? undefined : this.handleChooseAvatar}
          >
            {displayAvatar ? (
              <Image src={displayAvatar} className="avatar" mode="aspectFill"/>
            ) : (
              <View className="avatar-placeholder">
                <Text className="icon">&#xe64e;</Text>
              </View>
            )}
            <View className="edit-mask">
              <Text className="edit-text">
                {isUploadingAvatar ? '上传中...' : '更换'}
              </Text>
            </View>
          </View>
          <Text className="avatar-hint">
            {isUploadingAvatar ? '正在上传头像' : '点击头像更换'}
          </Text>
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
