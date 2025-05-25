// @ts-ignore
/* eslint-disable */
import request from "@/libs/request";

/** getQuestionBankHotspotVOByQuestionBankId GET /api/questionBankHotspot/get/vo/byQuestionBankId */
export async function getQuestionBankHotspotVoByQuestionBankIdUsingGet(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.getQuestionBankHotspotVOByQuestionBankIdUsingGETParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseQuestionBankHotspotVO_>(
    "/api/questionBankHotspot/get/vo/byQuestionBankId",
    {
      method: "GET",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** incrementField POST /api/questionBankHotspot/increment */
export async function incrementFieldUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.incrementBankFieldUsingPOSTParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>(
    "/api/questionBankHotspot/increment",
    {
      method: "POST",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** listQuestionBankHotspotByPage POST /api/questionBankHotspot/list/page */
export async function listQuestionBankHotspotByPageUsingPost(
  body: API.QuestionBankHotspotQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageQuestionBankHotspot_>(
    "/api/questionBankHotspot/list/page",
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

/** listQuestionBankHotspotVOByPage POST /api/questionBankHotspot/list/page/vo */
export async function listQuestionBankHotspotVoByPageUsingPost(
  body: API.QuestionBankHotspotQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageQuestionBankHotspotVO_>(
    "/api/questionBankHotspot/list/page/vo",
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

/** updateQuestionBankHotspot POST /api/questionBankHotspot/update */
export async function updateQuestionBankHotspotUsingPost(
  body: API.QuestionBankHotspotUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>("/api/questionBankHotspot/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
