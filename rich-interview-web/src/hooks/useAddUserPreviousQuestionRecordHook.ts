import { useEffect } from "react";
import { updateMyUserUsingPost } from "@/api/userController";

const useAddUserPreviousQuestionRecordHook = (questionId?: number) => {
  useEffect(() => {
    const updateRecord = async () => {
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
        console.error("刷题记录更新失败:", e.message);
      }
    };

    if (questionId) {
      updateRecord();
    }
  }, [questionId]);
};

export default useAddUserPreviousQuestionRecordHook;
