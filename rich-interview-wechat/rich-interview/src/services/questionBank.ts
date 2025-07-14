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

/**
 * 获取热门题库
 */
export const getHotQuestionBanks = async (): Promise<any[]> => {
  try {
    const res = await request<ApiResponse<PaginationResponse>>({
      url: '/api/questionBankHotspot/list/page/vo',
      method: 'POST',
      data: {pageSize: 10, sortField: 'viewNum', sortOrder: 'descend'}
    });
    return res.data?.records || [];
  } catch (error) {
    console.error('获取热门题库失败', error);
    return [];
  }
};

/**
 * 获取最新题库
 */
export const getNewQuestionBanks = async (): Promise<any[]> => {
  try {
    const res = await request<ApiResponse<PaginationResponse>>({
      url: '/api/questionBank/list/page/vo',
      method: 'POST',
      data: {pageSize: 10, sortField: 'createTime', sortOrder: 'descend'}
    });
    return res.data?.records || [];
  } catch (error) {
    console.error('获取最新题库失败', error);
    return [];
  }
};
