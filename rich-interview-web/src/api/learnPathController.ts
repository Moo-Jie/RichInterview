// @ts-ignore
/* eslint-disable */
import request from "@/libs/request";

/** addLearnPath POST /api/learnPath/add */
export async function addLearnPathUsingPost(
  body: API.LearnPathAddRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseLong_>("/api/learnPath/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** deleteLearnPath POST /api/learnPath/delete */
export async function deleteLearnPathUsingPost(
  body: API.DeleteRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>("/api/learnPath/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** editLearnPath POST /api/learnPath/edit */
export async function editLearnPathUsingPost(
  body: API.LearnPathEditRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>("/api/learnPath/edit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** getLearnPathVOById GET /api/learnPath/get/vo */
export async function getLearnPathVoByIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getLearnPathVOByIdUsingGETParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseLearnPathVO_>("/api/learnPath/get/vo", {
    method: "GET",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** listLearnPathByPage POST /api/learnPath/list/page */
export async function listLearnPathByPageUsingPost(
  body: API.LearnPathQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageLearnPath_>("/api/learnPath/list/page", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** listLearnPathVOByPage POST /api/learnPath/list/page/vo */
export async function listLearnPathVoByPageUsingPost(
  body: API.LearnPathQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageLearnPathVO_>(
    "/api/learnPath/list/page/vo",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    },
  );
}

/** listMyLearnPathVOByPage POST /api/learnPath/my/list/page/vo */
export async function listMyLearnPathVoByPageUsingPost(
  body: API.LearnPathQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageLearnPathVO_>(
    "/api/learnPath/my/list/page/vo",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: body,
      ...(options || {}),
    },
  );
}

/** updateLearnPath POST /api/learnPath/update */
export async function updateLearnPathUsingPost(
  body: API.LearnPathUpdateRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>("/api/learnPath/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
