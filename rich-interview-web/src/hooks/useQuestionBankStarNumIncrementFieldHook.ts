import { useRef, useState } from "react";
import { incrementFieldUsingPost } from "@/api/questionBankHotspotController";
import { message } from "antd";

/**
 * 题库点赞钩子
 * @param questionBankId 题库ID
 */
export default function useQuestionBankStarNumIncrementFieldHook(
  questionBankId?: number,
) {
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  const incrementStar = async () => {
    if (!questionBankId) return;

    setLoading(true);
    try {
      await incrementFieldUsingPost({
        fieldType: "starNum",
        questionBankId: questionBankId,
      });
      return true;
    } catch (e: any) {
      message.error("题库点赞失败: " + e.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { incrementStar, loading };
}
