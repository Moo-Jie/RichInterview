// @ts-ignore
/* eslint-disable */
import request from "@/libs/request";

/** getMockInterviewById GET /api/mockInterview/${param0} */
export async function getMockInterviewByIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getMockInterviewByIdUsingGETParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BaseResponseMockInterview_>(
    `/api/mockInterview/${param0}`,
    {
      method: "GET",
      params: { ...queryParams },
      ...(options || {}),
    },
  );
}

/** addMockInterview POST /api/mockInterview/add */
export async function addMockInterviewUsingPost(
  body: API.MockInterviewAddRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseLong_>("/api/mockInterview/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** doChatEvent POST /api/mockInterview/chatEvent */
export async function doChatEventUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.doChatEventUsingPOSTParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseString_>("/api/mockInterview/chatEvent", {
    method: "POST",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** deleteMockInterview POST /api/mockInterview/delete */
export async function deleteMockInterviewUsingPost(
  body: API.DeleteRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseBoolean_>("/api/mockInterview/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** listAdminMockInterviewByPage POST /api/mockInterview/list/page/admin */
export async function listAdminMockInterviewByPageUsingPost(
  body: API.MockInterviewQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageMockInterview_>(
    "/api/mockInterview/list/page/admin",
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

/** listMyMockInterviewByPage POST /api/mockInterview/list/page/my */
export async function listMyMockInterviewByPageUsingPost(
  body: API.MockInterviewQueryRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponsePageMockInterview_>(
    "/api/mockInterview/list/page/my",
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
