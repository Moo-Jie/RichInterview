import Taro from '@tarojs/taro'
import { getApiBaseUrl } from '../libs/config';

// 统一响应格式
interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

// 文件信息接口
export interface FileInfo {
  id?: string;
  url: string;
  filename?: string;
  originalFilename?: string;
  basePath?: string;
  path?: string;
  ext?: string;
  contentType?: string;
  size?: number;
  objectId?: string;
  objectType?: string;
  metadata?: Record<string, any>;
  userMetadata?: Record<string, any>;
  thUrl?: string;
  thFilename?: string;
  thSize?: number;
  thContentType?: string;
  attr?: Record<string, any>;
  fileAcl?: string;
  thFileAcl?: string;
  hashInfo?: Record<string, any>;
  uploadId?: string;
  uploadStatus?: number;
  createTime?: Date;
  updateTime?: Date;
}

/**
 * 上传文件（通用）
 * @param filePath 文件路径
 * @param name 表单字段名，默认为'file'
 * @returns Promise<FileInfo | null>
 */
export const uploadFile = async (filePath: string, name: string = 'file'): Promise<FileInfo | null> => {
  try {
    const response = await Taro.uploadFile({
      url: `${getApiBaseUrl()}/api/upload`,
      filePath,
      name,
      header: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.statusCode === 200) {
      const result = JSON.parse(response.data) as FileInfo;
      return result;
    }

    throw new Error(`上传失败，状态码: ${response.statusCode}`);
  } catch (error) {
    const err = error as Error;
    console.error('文件上传失败', err.message);
    Taro.showToast({
      title: `上传失败: ${err.message}`,
      icon: 'none'
    });
    return null;
  }
};

/**
 * 上传图片（优化版，支持压缩）
 * @param filePath 图片文件路径
 * @returns Promise<string | null> 返回图片URL
 */
export const uploadImage = async (filePath: string): Promise<string | null> => {
  try {
    const response = await Taro.uploadFile({
      url: `${getApiBaseUrl()}/api/upload-image`,
      filePath,
      name: 'file',
      header: {
        'Content-Type': 'multipart/form-data'
      }
    });

    if (response.statusCode === 200) {
      const result = JSON.parse(response.data) as ApiResponse<string>;
      if (result.code === 0 && result.data) {
        return result.data;
      }
      throw new Error(result.message || '上传失败');
    }

    throw new Error(`上传失败，状态码: ${response.statusCode}`);
  } catch (error) {
    const err = error as Error;
    console.error('图片上传失败', err.message);
    Taro.showToast({
      title: `上传失败: ${err.message}`,
      icon: 'none'
    });
    return null;
  }
};

/**
 * 选择并上传图片
 * @param options 选择图片的配置选项
 * @returns Promise<string | null> 返回图片URL
 */
export const chooseAndUploadImage = async (options?: {
  count?: number;
  sourceType?: ('album' | 'camera')[];
  sizeType?: ('original' | 'compressed')[];
}): Promise<string | null> => {
  try {
    const chooseResult = await Taro.chooseImage({
      count: options?.count || 1,
      sourceType: options?.sourceType || ['album', 'camera'],
      sizeType: options?.sizeType || ['compressed']
    });

    if (chooseResult.tempFilePaths.length > 0) {
      const filePath = chooseResult.tempFilePaths[0];
      return await uploadImage(filePath);
    }

    return null;
  } catch (error) {
    const err = error as Error;
    console.error('选择并上传图片失败', err.message);
    Taro.showToast({
      title: `操作失败: ${err.message}`,
      icon: 'none'
    });
    return null;
  }
};

/**
 * 上传头像（专用于用户头像上传）
 * @param filePath 头像文件路径
 * @returns Promise<string | null> 返回头像URL
 */
export const uploadAvatar = async (filePath: string): Promise<string | null> => {
  try {
    // 显示上传进度
    Taro.showLoading({
      title: '上传中...',
      mask: true
    });

    const url = await uploadImage(filePath);

    Taro.hideLoading();

    if (url) {
      Taro.showToast({
        title: '上传成功',
        icon: 'success'
      });
    }

    return url;
  } catch (error) {
    Taro.hideLoading();
    const err = error as Error;
    console.error('头像上传失败', err.message);
    Taro.showToast({
      title: `上传失败: ${err.message}`,
      icon: 'none'
    });
    return null;
  }
};

/**
 * 选择并上传头像
 * @returns Promise<string | null> 返回头像URL
 */
export const chooseAndUploadAvatar = async (): Promise<string | null> => {
  try {
    const chooseResult = await Taro.chooseImage({
      count: 1,
      sourceType: ['album', 'camera'],
      sizeType: ['compressed']
    });

    if (chooseResult.tempFilePaths.length > 0) {
      const filePath = chooseResult.tempFilePaths[0];
      return await uploadAvatar(filePath);
    }

    return null;
  } catch (error) {
    const err = error as Error;
    console.error('选择并上传头像失败', err.message);
    Taro.showToast({
      title: `操作失败: ${err.message}`,
      icon: 'none'
    });
    return null;
  }
};

/**
 * 批量上传图片
 * @param filePaths 图片文件路径数组
 * @param onProgress 上传进度回调
 * @returns Promise<string[]> 返回成功上传的图片URL数组
 */
export const uploadMultipleImages = async (
  filePaths: string[],
  onProgress?: (current: number, total: number) => void
): Promise<string[]> => {
  const results: string[] = [];

  try {
    for (let i = 0; i < filePaths.length; i++) {
      onProgress?.(i + 1, filePaths.length);

      const url = await uploadImage(filePaths[i]);
      if (url) {
        results.push(url);
      }
    }

    return results;
  } catch (error) {
    const err = error as Error;
    console.error('批量上传图片失败', err.message);
    Taro.showToast({
      title: `批量上传失败: ${err.message}`,
      icon: 'none'
    });
    return results;
  }
};

/**
 * 获取文件上传进度（用于大文件上传）
 * @param uploadTask 上传任务
 * @param onProgress 进度回调
 */
export const monitorUploadProgress = (
  uploadTask: Taro.UploadTask,
  onProgress: (progress: number) => void
): void => {
  uploadTask.onProgressUpdate((res) => {
    onProgress(res.progress);
  });
};

/**
 * 验证文件类型
 * @param filePath 文件路径
 * @param allowedTypes 允许的文件类型
 * @returns boolean
 */
export const validateFileType = (filePath: string, allowedTypes: string[]): boolean => {
  const extension = filePath.split('.').pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
};

/**
 * 验证文件大小（需要先获取文件信息）
 * @param filePath 文件路径
 * @param maxSize 最大文件大小（字节）
 * @returns Promise<boolean>
 */
export const validateFileSize = async (filePath: string, maxSize: number): Promise<boolean> => {
  try {
    const fileInfo = await Taro.getFileInfo({
      filePath
    });
    // @ts-ignore
    return fileInfo.size <= maxSize;
  } catch (error) {
    console.error('获取文件信息失败', error);
    return false;
  }
};
