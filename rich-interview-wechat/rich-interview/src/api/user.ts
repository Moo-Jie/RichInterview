import request from '../libs/request'
import Taro from '@tarojs/taro'

// 用户信息接口
export interface UserVO {
  id: number
  userName?: string
  userAvatar?: string
  userProfile?: string
  phoneNumber?: string
  email?: string
  grade?: string
  workExperience?: string
  expertiseDirection?: string
  userRole?: string
  previousQuestionID?: number
  createTime?: Date
}

// 统一响应格式
export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

// 登录响应接口
export interface LoginResponse {
  token?: string;
  userInfo: UserVO;
}

// 注册参数接口
export interface RegisterParams {
  userAccount: string
  userPassword: string
  checkPassword: string
  userName?: string
  phoneNumber?: string
  email?: string
}

// 登录参数接口
export interface LoginParams {
  userAccount: string
  userPassword: string
}

// 错误处理枚举
export enum UserErrorCode {
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  VALIDATION_ERROR = 400,
  SERVER_ERROR = 500
}

// 统一错误处理函数
const handleApiError = (error: any, defaultMessage: string): void => {
  const err = error as Error;
  let message = defaultMessage;

  if (err.message.includes('401') || err.message.includes('未授权')) {
    message = '登录状态已过期，请重新登录';
    // 清除本地存储
    Taro.removeStorageSync('token');
    Taro.removeStorageSync('userInfo');
  } else if (err.message.includes('403')) {
    message = '权限不足';
  } else if (err.message.includes('404')) {
    message = '请求的资源不存在';
  } else if (err.message.includes('500')) {
    message = '服务器内部错误';
  } else if (err.message) {
    message = err.message;
  }

  console.error(defaultMessage, err);
  Taro.showToast({
    title: message,
    icon: 'none',
    duration: 2000
  });
}

// 获取认证头
const getAuthHeader = (): Record<string, string> => {
  const token = Taro.getStorageSync('token');
  return token ? { 'satoken': token } : {};
}

/**
 * 用户注册服务
 */
export const userRegister = async (params: RegisterParams): Promise<number> => {
  try {
    // 参数验证
    if (!params.userAccount || !params.userPassword || !params.checkPassword) {
      throw new Error('请填写完整的注册信息');
    }

    if (params.userPassword !== params.checkPassword) {
      throw new Error('两次输入的密码不一致');
    }

    const response = await request<ApiResponse<number>>({
      url: '/api/user/register',
      method: 'POST',
      data: params
    });

    if (response && response.code === 0 && response.data !== undefined) {
      Taro.showToast({
        title: '注册成功',
        icon: 'success',
        duration: 2000
      });
      return response.data;
    }

    throw new Error(response?.message || '注册失败');
  } catch (error) {
    handleApiError(error, '用户注册失败');
    return -1;
  }
}

/**
 * 用户登录服务
 */
export const userLogin = async (params: LoginParams): Promise<LoginResponse | null> => {
  try {
    // 参数验证
    if (!params.userAccount || !params.userPassword) {
      throw new Error('请填写完整的登录信息');
    }

    const response = await request<ApiResponse<LoginResponse>>({
      url: '/api/user/login',
      method: 'POST',
      data: params
    });

    if (response && response.code === 0 && response.data) {
      // 保存token和用户信息
      if (response.data.token) {
        Taro.setStorageSync('token', response.data.token);
      }
      if (response.data.userInfo) {
        Taro.setStorageSync('userInfo', response.data.userInfo);
      }

      Taro.showToast({
        title: '登录成功',
        icon: 'success',
        duration: 2000
      });

      return response.data;
    }

    throw new Error(response?.message || '登录失败');
  } catch (error) {
    handleApiError(error, '用户登录失败');
    return null;
  }
}

/**
 * 获取当前登录用户信息
 */
export const getLoginUser = async (): Promise<UserVO | null> => {
  try {
    const authHeader = getAuthHeader();

    if (!authHeader.satoken) {
      throw new Error('未检测到登录状态');
    }

    console.log('获取当前登录用户信息');

    const response = await request<ApiResponse<UserVO>>({
      url: '/api/user/get/login',
      method: 'GET',
      header: authHeader
    });

    if (response?.code === 0 && response.data) {
      // 更新本地存储的用户信息
      Taro.setStorageSync('userInfo', response.data);
      return response.data;
    }

    throw new Error(response?.message || '获取用户信息失败');
  } catch (error) {
    handleApiError(error, '获取用户信息失败');
    return null;
  }
}

/**
 * 安全登出服务
 */
export const userLogout = (): Promise<void> => {
  return new Promise((resolve) => {
    try {
      // 清除所有本地存储
      Taro.removeStorageSync('token');
      Taro.removeStorageSync('userInfo');

      Taro.showToast({
        title: '已安全登出',
        icon: 'success',
        duration: 1500,
        complete: () => resolve()
      });
    } catch (error) {
      console.error('登出过程中发生错误', error);
      resolve();
    }
  });
}

/**
 * Token验证服务
 */
export const validateToken = (): boolean => {
  try {
    return !!Taro.getStorageSync<string>('token')
  } catch (error) {
    console.error('Token验证失败', error)
    return false
  }
}

// 更新用户信息参数接口（对应后端UserUpdateMyRequest）
export interface UserUpdateMyRequest {
  userName?: string;
  userAvatar?: string;
  userProfile?: string;
  userPassword?: string;
  checkPassword?: string;
  phoneNumber?: string;
  email?: string;
  grade?: string;
  workExperience?: string;
  expertiseDirection?: string;
  previousQuestionID?: number; // Long类型前端用number
}

// 签到记录响应类型
interface SignInRecordResponse {
  code: number;
  data: number[]; // 返回的是签到日期序号数组
  message?: string;
}

/**
 * 更新个人信息
 */
export const updateUserInfo = async (params: UserUpdateMyRequest): Promise<UserVO | null> => {
  try {
    const authHeader = getAuthHeader();

    if (!authHeader.satoken) {
      throw new Error('请先登录');
    }

    // 参数验证
    if (!params || Object.keys(params).length === 0) {
      throw new Error('请提供要更新的信息');
    }

    const response = await request<ApiResponse<boolean>>({
      url: '/api/user/update/my',
      method: 'POST',
      header: authHeader,
      data: params
    });

    if (response?.code === 0) {
      // 更新成功后重新获取用户信息并返回
      const updatedUserInfo = await getLoginUser();
      return updatedUserInfo;
    }

    throw new Error(response?.message || '更新失败');
  } catch (error) {
    console.error('更新用户信息失败:', error);
    throw error; // 直接抛出原始错误，让调用方处理
  }
}

/**
 * 用户签到
 */
export const addUserSignIn = async (): Promise<boolean> => {
  try {
    const authHeader = getAuthHeader();

    if (!authHeader.satoken) {
      throw new Error('请先登录');
    }

    const response = await request<ApiResponse<boolean>>({
      url: '/api/user/add/sign_in',
      method: 'POST',
      header: authHeader
    });

    if (response?.code === 0) {
      Taro.showToast({
        title: '签到成功',
        icon: 'success',
        duration: 2000
      });
      return response.data;
    }
    throw new Error(response?.message || '签到失败');
  } catch (error) {
    handleApiError(error, '用户签到失败');
    return false;
  }
}

/**
 * 获取用户签到记录
 * @param year 查询年份（如2025）
 */
export const getUserSignInRecord = async (year: number): Promise<number[]> => {
  try {
    const authHeader = getAuthHeader();
    if (!authHeader.satoken) {
      handleApiError({ code: UserErrorCode.UNAUTHORIZED, message: '请先登录' }, '请先登录');
      return [];
    }

    // 参数验证
    if (!year || year < 2020 || year > new Date().getFullYear() + 1) {
      handleApiError({ code: UserErrorCode.VALIDATION_ERROR, message: '年份参数无效' }, '年份参数无效');
      return [];
    }

    const response = await request<SignInRecordResponse>({
      url: `/api/user/get/sign_in?year=${year}`,
      method: 'GET',
      header: authHeader
    });

    if (response?.code === 0 && Array.isArray(response.data)) {
      return response.data;
    }
    throw new Error(response?.message || '获取签到记录失败');
  } catch (error) {
    handleApiError(error, '获取签到记录失败');
    return [];
  }
}

/**
 * 获取上次刷题记录
 * @returns 上次刷题的题目信息
 */
export const getPreviousQuestion = async (): Promise<any | null> => {
  try {
    const authHeader = getAuthHeader();
    if (!authHeader.satoken) {
      handleApiError({ code: UserErrorCode.UNAUTHORIZED, message: '请先登录' }, '请先登录');
      return null;
    }

    // 先获取用户信息，包含previousQuestionID
    const userInfo = await getLoginUser();
    if (!userInfo || !userInfo.previousQuestionID) {
      console.log('用户暂无刷题记录');
      return null;
    }

    // 根据previousQuestionID获取题目详情
    const questionResponse = await request<ApiResponse<any>>({
      url: `/api/question/get/vo?id=${userInfo.previousQuestionID}`,
      method: 'GET',
      header: authHeader
    });

    if (questionResponse?.code === 0 && questionResponse.data) {
      return questionResponse.data;
    }

    throw new Error(questionResponse?.message || '获取题目详情失败');
  } catch (error) {
    handleApiError(error, '获取上次刷题记录失败');
    return null;
  }
}
