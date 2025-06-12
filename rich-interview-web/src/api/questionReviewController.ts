// @ts-ignore
/* eslint-disable */
import request from "@/libs/request";

/** addQuestionReview POST /api/questionReview/add */
export async function addQuestionReviewUsingPost(
  body: API.QuestionReviewAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong_>("/api/questionReview/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** batchDeleteQuestionReview POST /api/questionReview/batch/delete */
export async function batchDeleteQuestionReviewUsingPost(
  body: number[],
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>("/api/questionReview/batch/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** deleteQuestionReview POST /api/questionReview/delete */
export async function deleteQuestionReviewUsingPost(
  body: API.DeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>("/api/questionReview/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}

/** listQuestionReviewByPage POST /api/questionReview/list/page */
export async function listQuestionReviewByPageUsingPost(
  body: API.QuestionReviewQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageQuestionReview_>(
    "/api/questionReview/list/page",
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

/** batchApproveQuestionReview POST /api/questionReview/review/batch/pass */
export async function batchApproveQuestionReviewUsingPost(
  body: number[],
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>(
    "/api/questionReview/review/batch/pass",
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

/** batchRejectQuestionReview POST /api/questionReview/review/batch/reject */
export async function batchRejectQuestionReviewUsingPost(
  body: number[],
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>(
    "/api/questionReview/review/batch/reject",
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

/** approveQuestionReview POST /api/questionReview/review/pass */
export async function approveQuestionReviewUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.approveQuestionReviewUsingPOSTParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>("/api/questionReview/review/pass", {
    method: "POST",
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** rejectQuestionReview POST /api/questionReview/review/reject */
export async function rejectQuestionReviewUsingPost(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.rejectQuestionReviewUsingPOSTParams,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>(
    "/api/questionReview/review/reject",
    {
      method: "POST",
      params: {
        ...params,
      },
      ...(options || {}),
    }
  );
}

/** updateQuestionReview POST /api/questionReview/update */
export async function updateQuestionReviewUsingPost(
  body: API.QuestionReviewUpdateRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>("/api/questionReview/update", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    data: body,
    ...(options || {}),
  });
}
