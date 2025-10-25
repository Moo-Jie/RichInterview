import request from '../libs/request';
import { UserVO } from './user';

// 统一响应格式
interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

// 分页响应
interface PaginationResponse<T = any> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// 请求参数类型
export interface CommentAddRequest {
  content: string;
  questionId: number | string;
}

// 视图对象类型
export interface CommentVO {
  id: number;
  content: string;
  userId: number;
  questionId: number;
  thumbNum?: number;
  createTime?: string;
  updateTime?: string;
  user?: UserVO;
}

/** 新增评论 */
export const addComment = async (
  data: CommentAddRequest,
): Promise<number> => {
  try {
    const res = await request<ApiResponse<number>>({
      url: '/api/comment/add',
      method: 'POST',
      data,
    });
    if (res.code === 0) {
      return res.data;
    }
    throw new Error(res.message || '新增评论失败');
  } catch (error) {
    const err = error as Error;
    console.error('新增评论失败', err.message);
    throw error;
  }
};

/** 分页查询评论（封装） */
export const listCommentVoByPage = async (
  params: {
    questionId: number | string;
    current?: number;
    pageSize?: number;
    sortField?: string;
    sortOrder?: 'asc' | 'desc' | 'ascend' | 'descend';
  },
): Promise<PaginationResponse<CommentVO>> => {
  try {
    const res = await request<ApiResponse<PaginationResponse<CommentVO>>>({
      url: '/api/comment/list/page/vo',
      method: 'POST',
      data: params,
    });
    if (res.code === 0 && res.data) {
      return res.data;
    }
    throw new Error(res.message || '获取评论列表失败');
  } catch (error) {
    const err = error as Error;
    console.error('获取评论列表失败', err.message);
    throw error;
  }
};

/** 根据题目ID获取评论（封装列表） */
export const getCommentVoByQuestionId = async (
  questionId: number | string,
): Promise<CommentVO[]> => {
  try {
    const res = await request<ApiResponse<CommentVO[]>>({
      url: '/api/comment/get/vo',
      method: 'GET',
      data: { questionId },
    });
    if (res.code === 0 && res.data) {
      return res.data;
    }
    throw new Error(res.message || '获取评论失败');
  } catch (error) {
    const err = error as Error;
    console.error('获取评论失败', err.message);
    throw error;
  }
};

/** 点赞评论 */
export const likeComment = async (commentId: number): Promise<boolean> => {
  try {
    const res = await request<ApiResponse<boolean>>({
      url: '/api/comment/like',
      method: 'POST',
      data: { id: commentId },
    });
    if (res.code === 0) {
      return !!res.data;
    }
    throw new Error(res.message || '点赞失败');
  } catch (error) {
    const err = error as Error;
    console.error('点赞失败', err.message);
    throw error;
  }
};
