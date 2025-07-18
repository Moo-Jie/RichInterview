import request from '../libs/request';
import {UserVO} from "./user";

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
 * 题库视图类型
 */
interface QuestionBankVO {
  id: number;
  title: string;
  description: string;
  userId: number;
  picture: string;
  createTime: Date;
  updateTime: Date;
  user?: UserVO; // 假设存在UserVO类型
  questionsPage?: PaginationResponse;
}

/**
 * 题库热点视图类型
 */
interface QuestionBankHotspotVO {
  id: number;
  questionBankId: number;
  viewNum: number;
  starNum: number;
  forwardNum: number;
  collectNum: number;
  commentNum: number;
  createTime: Date;
  updateTime: Date;
  title: string;
  description: string;
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

/**
 * 根据ID获取题库详情
 * @param id 题库ID
 * @returns 题库详情对象
 */
export const getQuestionBankVOById = async (id: number): Promise<QuestionBankVO | null> => {
  try {

    const res = await request<ApiResponse<QuestionBankVO>>({
      url: '/api/questionBank/get/vo',
      method: 'GET',
      data: {id}
    });
    return res.data || null;
  } catch (error) {
    console.error('获取题库详情失败', error);
    return null;
  }
};

/**
 * 分页获取题库列表
 * @param params 分页参数及查询条件
 * @returns 题库分页数据
 */
export const listQuestionBankVOByPage = async (
  params: any
): Promise<QuestionBankVO[] | null> => {
  try {
    const res = await request<ApiResponse<PaginationResponse>>({
      url: '/api/questionBank/list/page/vo',
      method: 'POST',
      data: params
    });
    return res.data?.records || null;
  } catch (error) {
    console.error('获取题库列表失败', error);
    return null;
  }
};

/**
 * 根据题库ID获取热点信息
 * @param questionBankId 题库ID
 * @returns 题库热点信息对象
 */
export const getQuestionBankHotspotVOByQuestionBankId = async (
  questionBankId: number
): Promise<QuestionBankHotspotVO | null> => {
  try {
    const res = await request<ApiResponse<QuestionBankHotspotVO>>({
      url: '/api/questionBankHotspot/get/vo/byQuestionBankId',
      method: 'GET',
      data: {questionBankId}
    });
    return res.data || null;
  } catch (error) {
    console.error('获取题库热点信息失败', error);
    return null;
  }
};
