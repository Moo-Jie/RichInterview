import { updateQuestionReviewUsingPost } from "@/api/questionReviewController";
import { ProColumns, ProTable } from "@ant-design/pro-components";
import { App, Modal } from "antd";
import React from "react";

interface Props {
  oldData?: API.QuestionReview;
  visible: boolean;
  columns: ProColumns<API.QuestionReview>[];
  onSubmit: () => void;
  onCancel: () => void;
}

const UpdateModal: React.FC<Props> = (props) => {
  const { oldData, visible, columns, onSubmit, onCancel } = props;
  const { message } = App.useApp();

  const handleUpdate = async (fields: API.QuestionReviewUpdateRequest) => {
    const hide = message.loading("正在更新");
    try {
      await updateQuestionReviewUsingPost({
        ...fields,
        id: oldData?.id,
      });
      hide();
      message.success("更新成功");
      return true;
    } catch (error: any) {
      hide();
      message.error("更新失败，" + error.message);
      return false;
    }
  };

  if (!oldData) return null;

  return (
    <Modal
      destroyOnHidden
      title="完善题目内容"
      width="1000px"
      open={visible}
      footer={null}
      onCancel={onCancel}
    >
      <ProTable
        type="form"
        columns={columns}
        form={{
          initialValues: {
            ...oldData,
            // 转换 tags 字段为数组格式
            tags: oldData?.tags ? JSON.parse(oldData.tags) : [],
          },
        }}
        onSubmit={async (values) => {
          const success = await handleUpdate(
            values as API.QuestionReviewUpdateRequest,
          );
          if (success) onSubmit();
        }}
      />
    </Modal>
  );
};

export default UpdateModal;