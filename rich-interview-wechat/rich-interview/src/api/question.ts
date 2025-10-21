import request from '../libs/request';
import Taro from '@tarojs/taro';

// 统一响应格式
interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

interface PaginationResponse<T = any> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

interface DetailResponse {
  data: any;
}

// 题目相关接口定义
export interface Question {
  id?: string;
  title: string;
  content: string;
  tags?: string[];
  answer?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  source?: string;
  userId?: string;
  createTime?: Date;
  updateTime?: Date;
  isDelete?: number;
  viewNum?: number;
  starNum?: number;
  favourNum?: number;
  thumbNum?: number;
}

export interface QuestionAddRequest {
  title: string;
  content: string;
  tags?: string[];
  answer?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  source?: string;
}

export interface QuestionUpdateRequest {
  id: string;
  title?: string;
  content?: string;
  tags?: string[];
  answer?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  source?: string;
}

export interface QuestionEditRequest {
  id: string;
  title?: string;
  content?: string;
  tags?: string[];
  answer?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  source?: string;
}

export interface QuestionQueryParams {
  current?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
  title?: string;
  content?: string;
  tags?: string[];
  searchText?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  userId?: string;
}

const FIELD_TYPES = {
  VIEW_NUM: 'viewNum',
  STAR_NUM: 'starNum',
} as const;

/**
 * 增加题目浏览量
 * @param questionId 题目ID
 */
export const incrementViewCount = async (questionId: string): Promise<boolean> => {
  try {
    const res = await request<ApiResponse<boolean>>({
      url: `/api/questionHotspot/increment?questionId=${questionId}&fieldType=${FIELD_TYPES.VIEW_NUM}`,
      method: 'POST',
    });
    return res.data || false;
  } catch (error) {
    console.error('增加点赞量失败', error);
    return false;
  }
};

/**
 * 增加题目点赞量
 * @param questionId 题目ID
 */
export const incrementStarCount = async (questionId: string): Promise<boolean> => {
  try {
    const res = await request<ApiResponse<boolean>>({
      url: `/api/questionHotspot/increment?questionId=${questionId}&fieldType=${FIELD_TYPES.STAR_NUM}`,
      method: 'POST',
    });
    return res.data || false;
  } catch (error) {
    console.error('增加点赞量失败', error);
    return false;
  }
};

/**
 * 获取热门题目
 */
export const getHotQuestions = async (): Promise<any[]> => {
  try {
    const res = await request<ApiResponse<PaginationResponse>>({
      url: '/api/questionHotspot/list/page/vo',
      method: 'POST',
      data: {
        pageSize: 10,
        sortField: 'viewNum',
        sortOrder: 'descend'
      }
    });
    return res.data?.records || [];
  } catch (error) {
    console.error('获取热门题目失败', error);
    return [];
  }
};

/**
 * 最新题目接口
 */
export const getNewQuestions = async (): Promise<any[]> => {
  try {
    const res = await request<ApiResponse<PaginationResponse>>({
      url: '/api/question/list/page/vo',
      method: 'POST',
      data: {
        pageSize: 10,
        sortField: 'createTime',
        sortOrder: 'descend'
      }
    });
    return res.data?.records || [];
  } catch (error) {
    console.error('获取最新题目失败', error);
    return [];
  }
};

/**
 * 获取题目详情
 */
export const getQuestionDetail = async (questionId: string): Promise<any> => {
  try {
    const res = await request<ApiResponse<DetailResponse>>({
      url: `/api/question/get/vo?id=${questionId}`,
      method: 'GET',
    });
    return res.data || null;
  } catch (error) {
    console.error('获取题目详情失败', error);
    throw error;
  }
}

/**
 * 获取题目热点详情
 */
export const getQuestionHotspotDetail = async (questionId: string): Promise<any> => {
  try {
    const res = await request<ApiResponse<DetailResponse>>({
      url: '/api/questionHotspot/get/vo/byQuestionId',
      method: 'GET',
      data: {
        questionId: questionId
      }
    });
    return res.data || null;
  } catch (error) {
    console.error('获取题目详情失败', error);
    throw error;
  }
}

/**
 * 题目分页检索接口
 * @param params 包含分页参数和搜索条件的对象
 */
export const searchQuestions = async (
  params: QuestionQueryParams
): Promise<{ records: Question[]; total: number }> => {
  try {
    const res = await request<ApiResponse<PaginationResponse<Question>>>({
      url: '/api/question/list/page/vo',
      method: 'POST',
      data: {
        current: params.current || 1,
        pageSize: params.pageSize || 10,
        sortField: params.sortField || 'createTime',
        sortOrder: params.sortOrder || 'descend',
        searchText: params.searchText,
        tags: params.tags,
        difficulty: params.difficulty,
        userId: params.userId
      }
    });
    return {
      records: res.data?.records || [],
      total: res.data?.total || 0
    };
  } catch (error) {
    console.error('搜索题目失败', error);
    return {records: [], total: 0};
  }
};

/**
 * 添加题目
 * @param questionData 题目数据
 */
export const addQuestion = async (questionData: QuestionAddRequest): Promise<string | null> => {
  try {
    const res = await request<ApiResponse<string>>({
      url: '/api/question/add',
      method: 'POST',
      data: questionData
    });
    
    if (res.code === 0 && res.data) {
      Taro.showToast({
        title: '添加成功',
        icon: 'success'
      });
      return res.data;
    } else {
      throw new Error(res.message || '添加失败');
    }
  } catch (error) {
    const err = error as Error;
    console.error('添加题目失败', err.message);
    Taro.showToast({
      title: `添加失败: ${err.message}`,
      icon: 'none'
    });
    return null;
  }
};

/**
 * 删除题目
 * @param questionId 题目ID
 */
export const deleteQuestion = async (questionId: string): Promise<boolean> => {
  try {
    const res = await request<ApiResponse<boolean>>({
      url: '/api/question/delete',
      method: 'POST',
      data: { id: questionId }
    });
    
    if (res.code === 0) {
      Taro.showToast({
        title: '删除成功',
        icon: 'success'
      });
      return true;
    } else {
      throw new Error(res.message || '删除失败');
    }
  } catch (error) {
    const err = error as Error;
    console.error('删除题目失败', err.message);
    Taro.showToast({
      title: `删除失败: ${err.message}`,
      icon: 'none'
    });
    return false;
  }
};

/**
 * 更新题目
 * @param questionData 题目更新数据
 */
export const updateQuestion = async (questionData: QuestionUpdateRequest): Promise<boolean> => {
  try {
    const res = await request<ApiResponse<boolean>>({
      url: '/api/question/update',
      method: 'POST',
      data: questionData
    });
    
    if (res.code === 0) {
      Taro.showToast({
        title: '更新成功',
        icon: 'success'
      });
      return true;
    } else {
      throw new Error(res.message || '更新失败');
    }
  } catch (error) {
    const err = error as Error;
    console.error('更新题目失败', err.message);
    Taro.showToast({
      title: `更新失败: ${err.message}`,
      icon: 'none'
    });
    return false;
  }
};

/**
 * 编辑题目
 * @param questionData 题目编辑数据
 */
export const editQuestion = async (questionData: QuestionEditRequest): Promise<boolean> => {
  try {
    const res = await request<ApiResponse<boolean>>({
      url: '/api/question/edit',
      method: 'POST',
      data: questionData
    });
    
    if (res.code === 0) {
      Taro.showToast({
        title: '编辑成功',
        icon: 'success'
      });
      return true;
    } else {
      throw new Error(res.message || '编辑失败');
    }
  } catch (error) {
    const err = error as Error;
    console.error('编辑题目失败', err.message);
    Taro.showToast({
      title: `编辑失败: ${err.message}`,
      icon: 'none'
    });
    return false;
  }
};

/**
 * 根据ID获取题目
 * @param questionId 题目ID
 */
export const getQuestionById = async (questionId: string): Promise<Question | null> => {
  try {
    const res = await request<ApiResponse<Question>>({
      url: `/api/question/get?id=${questionId}`,
      method: 'GET'
    });
    
    if (res.code === 0 && res.data) {
      return res.data;
    } else {
      throw new Error(res.message || '获取题目失败');
    }
  } catch (error) {
    const err = error as Error;
    console.error('获取题目失败', err.message);
    return null;
  }
};

/**
 * 获取当前用户的题目列表
 * @param params 查询参数
 */
export const getMyQuestions = async (
  params: Omit<QuestionQueryParams, 'userId'>
): Promise<{ records: Question[]; total: number }> => {
  try {
    const res = await request<ApiResponse<PaginationResponse<Question>>>({
      url: '/api/question/my/list/page/vo',
      method: 'POST',
      data: {
        current: params.current || 1,
        pageSize: params.pageSize || 10,
        sortField: params.sortField || 'createTime',
        sortOrder: params.sortOrder || 'descend',
        searchText: params.searchText,
        tags: params.tags,
        difficulty: params.difficulty
      }
    });
    
    return {
      records: res.data?.records || [],
      total: res.data?.total || 0
    };
  } catch (error) {
    console.error('获取我的题目失败', error);
    return {records: [], total: 0};
  }
};

/**
 * 批量删除题目
 * @param questionIds 题目ID数组
 */
export const batchDeleteQuestions = async (questionIds: string[]): Promise<boolean> => {
  try {
    const deletePromises = questionIds.map(id => deleteQuestion(id));
    const results = await Promise.all(deletePromises);
    
    const successCount = results.filter(result => result).length;
    
    if (successCount === questionIds.length) {
      Taro.showToast({
        title: '批量删除成功',
        icon: 'success'
      });
      return true;
    } else {
      Taro.showToast({
        title: `删除了${successCount}/${questionIds.length}个题目`,
        icon: 'none'
      });
      return false;
    }
  } catch (error) {
    const err = error as Error;
    console.error('批量删除题目失败', err.message);
    Taro.showToast({
      title: `批量删除失败: ${err.message}`,
      icon: 'none'
    });
    return false;
  }
};

/**
 * 获取题目统计信息
 */
export const getQuestionStats = async (): Promise<{
  total: number;
  easy: number;
  medium: number;
  hard: number;
} | null> => {
  try {
    // 分别获取不同难度的题目数量
    const [totalRes, easyRes, mediumRes, hardRes] = await Promise.all([
      searchQuestions({ pageSize: 1 }),
      searchQuestions({ pageSize: 1, difficulty: 'EASY' }),
      searchQuestions({ pageSize: 1, difficulty: 'MEDIUM' }),
      searchQuestions({ pageSize: 1, difficulty: 'HARD' })
    ]);
    
    return {
      total: totalRes.total,
      easy: easyRes.total,
      medium: mediumRes.total,
      hard: hardRes.total
    };
  } catch (error) {
    console.error('获取题目统计失败', error);
    return null;
  }
};
