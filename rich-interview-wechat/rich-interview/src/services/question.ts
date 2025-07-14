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
    return res.data?.data || null;
  } catch (error) {
    console.error('获取题目详情失败', error);
    throw error;
  }
}
