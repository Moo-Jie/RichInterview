// @ts-ignore
/* eslint-disable */
import request from "@/libs/request";

/** getQuestionHotspotVOByQuestionId GET /api/questionHotspot/get/vo/byQuestionId */
export async function getQuestionHotspotVoByQuestionIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getQuestionHotspotVOByQuestionIdUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseQuestionHotspotVO_>(
    "/api/questionHotspot/get/vo/byQuestionId",
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** incrementField POST /api/questionHotspot/increment */
export async function incrementFieldUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.incrementFieldUsingPOSTParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>("/api/questionHotspot/increment", {
    method: "POST",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** listQuestionHotspotByPage POST /api/questionHotspot/list/page */
export async function listQuestionHotspotByPageUsingPost(
  body: API.QuestionHotspotQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageQuestionHotspot_>(
    "/api/questionHotspot/list/page",
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

/** listQuestionHotspotVOByPage POST /api/questionHotspot/list/page/vo */
export async function listQuestionHotspotVoByPageUsingPost(
  body: API.QuestionHotspotQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageQuestionHotspotVO_>(
    "/api/questionHotspot/list/page/vo",
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

/** updateQuestionHotspot POST /api/questionHotspot/update */
export async function updateQuestionHotspotUsingPost(
  body: API.QuestionHotspotUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>("/api/questionHotspot/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
