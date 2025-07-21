import request from '../libs/request';

// 统一响应格式
interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

interface PaginationResponse {
  records: any[];
}

interface DetailResponse {
  data: any;
}

interface QuestionQueryParams {
  current?: number;
  pageSize?: number;
  sortField?: string;
  sortOrder?: 'ascend' | 'descend';
  title?: string;
  content?: string;
  tags?: string[];
  searchText?: string;
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
): Promise<{ records: any[]; total: number }> => {
  try {
    const res = await request<ApiResponse<PaginationResponse>>({
      url: '/api/question/list/page/vo',
      method: 'POST',
      data: {
        current: params.current || 1,
        pageSize: params.pageSize || 10,
        sortField: params.sortField || 'createTime',
        sortOrder: params.sortOrder || 'descend',
        searchText: params.searchText,
        tags: params.tags
      }
    });
    return {
      records: res.data?.records || [],
      // @ts-ignore
      total: res.data?.total || 0
    };
  } catch (error) {
    return {records: [], total: 0};
  }
};
