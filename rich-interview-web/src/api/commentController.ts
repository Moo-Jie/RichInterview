// @ts-ignore
/* eslint-disable */
import request from "@/libs/request";

/** addComment POST /api/comment/add */
export async function addCommentUsingPost(
  body: API.CommentAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong_>("/api/comment/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}



/** deleteComment POST /api/comment/delete */
export async function deleteCommentUsingPost(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>("/api/comment/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** getCommentVOByQuestionId GET /api/comment/get/vo */
export async function getCommentVoByQuestionIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getCommentVOByQuestionIdUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseListCommentVO_>("/api/comment/get/vo", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** listCommentVOByPage POST /api/comment/list/page/vo */
export async function listCommentVoByPageUsingPost(
  body: API.CommentQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageCommentVO_>("/api/comment/list/page/vo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** starComment POST /api/comment/like */
export async function starCommentUsingPost(
    body: API.DeleteRequest,
    options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>("/api/comment/like", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** listMyCommentVOByPage POST /api/comment/my/list/page/vo */
export async function listMyCommentVoByPageUsingPost(
  body: API.CommentQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageCommentVO_>(
    "/api/comment/my/list/page/vo",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    }
  );
}
