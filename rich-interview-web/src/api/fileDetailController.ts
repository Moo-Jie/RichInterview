/* eslint-disable */
import request from "@/libs/request";

/** upload POST /api/upload */
export async function uploadUsingPost(
  body: {},
  file?: File,
  options?: { [key: string]: any },
) {
  const formData = new FormData();

  if (file) {
    formData.append("file", file);
  }

  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele];

    if (item !== undefined && item !== null) {
      if (typeof item === "object" && !(item instanceof File)) {
        if (item instanceof Array) {
          item.forEach((f) => formData.append(ele, f || ""));
        } else {
          formData.append(ele, JSON.stringify(item));
        }
      } else {
        formData.append(ele, item);
      }
    }
  });

  return request<API.FileInfo>("/api/upload", {
    method: "POST",
    data: formData,
    // @ts-ignore
    requestType: "form",
    ...(options || {}),
  });
}

/** uploadImage POST /api/upload-image */
export async function uploadImageUsingPost(
  file: File, // 将file作为主要参数
  options?: { [key: string]: any },
) {
  const formData = new FormData();
  formData.append("file", file);

  return request<string>("/api/upload-image", {
    method: "POST",
    data: formData,
    // @ts-ignore
    requestType: "form",
    ...(options || {}),
  });
}

/** uploadPlatform POST /api/upload-platform */
export async function uploadPlatformUsingPost1(
  body: {},
  file?: File,
  options?: { [key: string]: any },
) {
  const formData = new FormData();

  if (file) {
    formData.append("file", file);
  }

  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele];

    if (item !== undefined && item !== null) {
      if (typeof item === "object" && !(item instanceof File)) {
        if (item instanceof Array) {
          item.forEach((f) => formData.append(ele, f || ""));
        } else {
          formData.append(ele, JSON.stringify(item));
        }
      } else {
        formData.append(ele, item);
      }
    }
  });

  return request<API.FileInfo>("/api/upload-platform", {
    method: "POST",
    data: formData,
    // @ts-ignore
    requestType: "form",
    ...(options || {}),
  });
}

/** uploadPlatform POST /api/upload-request */
export async function uploadPlatformUsingPost(options?: {
  [key: string]: any;
}) {
  return request<API.FileInfo>("/api/upload-request", {
    method: "POST",
    ...(options || {}),
  });
}

/** upload2 POST /api/upload2 */
export async function upload2UsingPost(
  body: {},
  file?: File,
  options?: { [key: string]: any },
) {
  const formData = new FormData();

  if (file) {
    formData.append("file", file);
  }

  Object.keys(body).forEach((ele) => {
    const item = (body as any)[ele];

    if (item !== undefined && item !== null) {
      if (typeof item === "object" && !(item instanceof File)) {
        if (item instanceof Array) {
          item.forEach((f) => formData.append(ele, f || ""));
        } else {
          formData.append(ele, JSON.stringify(item));
        }
      } else {
        formData.append(ele, item);
      }
    }
  });

  return request<string>("/api/upload2", {
    method: "POST",
    data: formData,
    // @ts-ignore
    requestType: "form",
    ...(options || {}),
  });
}
