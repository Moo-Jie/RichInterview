import { useEffect, useRef, useState } from "react";
import { incrementFieldUsingPost } from "@/api/questionHotspotController";
import { message } from "antd";

export default function useQuestionViewNumIncrementFieldHook(
  questionId?: number,
) {
  const [loading, setLoading] = useState(true);
  // 预防 SSR 和C SR 渲染阶段重复请求
  const hasFetched = useRef(false); // 新增 ref 用于追踪请求状态

  const doFetch = async () => {
    setLoading(true);
    try {
      await incrementFieldUsingPost({
        fieldType: "viewNum",
        questionId: questionId || 0,
      });
    } catch (e: any) {
      message.error("浏览量更新失败: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (questionId && !hasFetched.current) {
      hasFetched.current = true;
      doFetch();
    }
  }, [questionId]); // questionId 变化时都会重新请求

  return { loading };
}
