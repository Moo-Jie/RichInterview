import { useEffect, useState } from "react";
import { message } from "antd";
import { addUserSignInUsingPost } from "@/api/userController";

/**
 * 添加用户刷题签到记录钩子
 * （由于服务端渲染，拿不到用户登录数据，所以在客户端阶段时，再请求一次来执行签到操作）
 * @param props
 * @constructor
 */
const useAddUserSignInRecordHook = () => {
  // 签到状态
  const [loading, setLoading] = useState<boolean>(true);

  // 请求后端执行签到
  const doFetch = async () => {
    // 如果已经在加载中，就不重复请求了
    setLoading(true);
    try {
      await addUserSignInUsingPost({});
    } catch (e: any) {
      message.error("签到失败，因为" + e.message);
    }
    setLoading(false);
  };

  // 仅在客户端渲染时，请求后端执行签到
  // （由于服务端渲染，拿不到用户登录数据，所以在客户端阶段时，再请求一次来执行签到操作）
  useEffect(() => {
    doFetch();
  }, []);

  // 返回签到状态
  return { loading };
};

export default useAddUserSignInRecordHook;
