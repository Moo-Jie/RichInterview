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
 * 获取热门题目
 */
export const getHotQuestions = async (): Promise<any[]> => {
  try {
    const res = await request<ApiResponse<PaginationResponse>>({
      url: '/api/questionHotspot/list/page/vo',
      method: 'POST',
      data: {pageSize: 10, sortField: 'viewNum', sortOrder: 'descend'}
    });
    return res.data?.records || [];
  } catch (error) {
    console.error('获取热门题目失败', error);
    return [];
  }
};
