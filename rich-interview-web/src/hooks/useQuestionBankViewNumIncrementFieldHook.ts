import {useEffect, useRef, useState} from "react";
import {incrementFieldUsingPost} from "@/api/questionBankHotspotController";
import {message} from "antd";

export default function useQuestionBankViewNumIncrementFieldHook(
  questionBankId?: number,
) {
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  const doFetch = async () => {
    setLoading(true);
    try {
      await incrementFieldUsingPost({
        fieldType: "viewNum",
        questionBankId: questionBankId || 0,
      });
    } catch (e: any) {
      message.error("题库浏览量更新失败: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (questionBankId && !hasFetched.current) {
      hasFetched.current = true;
      doFetch();
    }
  }, [questionBankId]);

  return { loading };
}
