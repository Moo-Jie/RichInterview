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
}

// 统一响应格式
interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

// 登录响应接口
interface LoginResponse {
  code: number;
  data: UserVO;
  message?: string;
}

// 注册参数接口
interface RegisterParams {
  userAccount: string
  userPassword: string
  checkPassword: string
  userName?: string
  phoneNumber?: string
  email?: string
}

// 登录参数接口
interface LoginParams {
  userAccount: string
  userPassword: string
}

/**
 * 用户注册服务
 */
export const userRegister = async (params: RegisterParams): Promise<number> => {
  try {
    const response = await request<ApiResponse<number>>({
      url: '/api/user/register',
      method: 'POST',
      data: params
    })

    if (response && response.code === 0 && response.data !== undefined) {
      return response.data
    }

    throw new Error(response?.message || '注册失败')
  } catch (error) {
    const err = error as Error
    console.error('用户注册失败', err.message)
    Taro.showToast({title: '注册失败: ' + err.message, icon: 'none'})
    return -1
  }
}

/**
 * 用户登录服务
 */
export const userLogin = async (params: LoginParams): Promise<ApiResponse<LoginResponse>> => {
    return await request<ApiResponse<LoginResponse>>({
      url: '/api/user/login',
      method: 'POST',
      data: params
    });
}

/**
 * 获取当前登录用户信息
 */
export const getLoginUser = async (): Promise<UserVO | null> => {
  try {
    // 安全获取Token
    const token = Taro.getStorageSync('token')

    console.log('获取当前登录用户信息 携带 token', token)

    if (!token) {
      throw new Error('未未检测到登录状态（保存 token）')
    }

    // 带认证头的请求
    const response = await request<ApiResponse<UserVO>>({
      url: '/api/user/get/login',
      method: 'GET',
      header: {
        'satoken': token
      }
    })

    // 安全的响应处理
    if (response?.code === 0 && response.data) {
      return response.data
    }

    throw new Error(response?.message || '获取用户信息失败')
  } catch (error) {
    const err = error as Error

    // Token失效处理
    if (err.message.includes('401') || err.message.includes('未授权')) {
      Taro.removeStorageSync('token')
      Taro.removeStorageSync('userInfo')
      Taro.showToast({title: '登录状态已过期', icon: 'none'})
    } else {
      console.error('获取用户信息失败', err.message)
    }

    return null
  }
}

/**
 * 安全登出服务
 */
export const userLogout = (): void => {
  Taro.removeStorageSync('token')
  Taro.removeStorageSync('userInfo')
  Taro.showToast({title: '已安全登出', icon: 'success'})
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
