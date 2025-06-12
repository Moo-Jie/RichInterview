import {useEffect, useRef, useState} from "react";
import {message} from "antd";
import {updateMyUserUsingPost} from "@/api/userController";

/**
 * 添加用户刷题签到记录钩子
 * @param questionId
 * @returns 加载状态
 */
const useAddUserPreviousQuestionRecordHook = (questionId?: number) => {
  const [loading, setLoading] = useState(true);
  // 预防 SSR 和C SR 渲染阶段重复请求
  const hasFetched = useRef(false);

  const doFetch = async () => {
    setLoading(true);
    try {
      await updateMyUserUsingPost(
        { previousQuestionID: questionId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
    } catch (e: any) {
      message.error("刷题记录更新失败: " + e.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (questionId && !hasFetched.current) {
      hasFetched.current = true;
      doFetch();
    }
  }, [questionId]); // questionId 变化时都会重新请求

  return { loading };
};

export default useAddUserPreviousQuestionRecordHook;
