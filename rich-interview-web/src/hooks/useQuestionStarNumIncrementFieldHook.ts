import { useEffect, useRef, useState } from "react";
import { incrementFieldUsingPost } from "@/api/questionHotspotController";
import { message } from "antd";

export default function useQuestionStarNumIncrementFieldHook(
  questionId?: number,
) {
  const [loading, setLoading] = useState(true);
  // 预防 SSR 和C SR 渲染阶段重复请求
  const hasFetched = useRef(false);

  const incrementStar = async () => {
    if (!questionId) return;

    setLoading(true);
    try {
      await incrementFieldUsingPost({
        fieldType: "starNum",
        questionId: questionId,
      });
      return true;
    } catch (e: any) {
      message.error("点赞数更新失败: " + e.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { incrementStar, loading };
}
