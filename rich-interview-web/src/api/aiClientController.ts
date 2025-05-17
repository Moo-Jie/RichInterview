// @ts-ignore
/* eslint-disable */
import request from "@/libs/request";

/** setDefaultRole PUT /api/ai/config/role */
export async function setDefaultRoleUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.setDefaultRoleUsingPUTParams,
  options?: { [key: string]: any },
) {
  return request<any>("/api/ai/config/role", {
    method: "PUT",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** setMaxWaitTime PUT /api/ai/config/timeout */
export async function setMaxWaitTimeUsingPut(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.setMaxWaitTimeUsingPUTParams,
  options?: { [key: string]: any },
) {
  return request<any>("/api/ai/config/timeout", {
    method: "PUT",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** queryAI POST /api/ai/query */
export async function queryAiUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.queryAIUsingPOSTParams,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponseString_>("/api/ai/query", {
    method: "POST",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
