import { updateQuestionUsingPost } from "@/api/questionController";
import { ProColumns, ProTable } from "@ant-design/pro-components";
import { App, Modal } from "antd";
import React from "react";


interface Props {
  oldData?: API.Question;
  visible: boolean;
  columns: ProColumns<API.Question>[];
  onSubmit: (values: API.QuestionUpdateRequest) => void;
  onCancel: () => void;
}

/**
 * 更新弹窗
 * @param props
 * @constructor
 */
const UpdateModal: React.FC<Props> = (props) => {
  const { oldData, visible, columns, onSubmit, onCancel } = props;
  const { message } = App.useApp(); // 全局提示和对话框方法
  /**
   * 更新节点
   *
   * @param fields
   */
  const handleUpdate = async (fields: API.QuestionUpdateRequest) => {
    const hide = message.loading("正在更新");
    try {
      await updateQuestionUsingPost(fields);
      hide();
      message.success("更新成功");
      return true;
    } catch (error: any) {
      hide();
      message.error("更新失败，" + error.message);
      return false;
    }
  };
  if (!oldData) {
    return <></>;
  }

  return (
    <Modal
      destroyOnClose
      title={"更新"}
      width="1000px"
      open={visible}
      footer={null}
      onCancel={() => {
        onCancel?.();
      }}
    >
      <ProTable
        type="form"
        columns={columns}
        form={{
          initialValues: oldData,
        }}
        onSubmit={async (values: API.QuestionAddRequest) => {
          const success = await handleUpdate({
            ...values,
            id: oldData?.id as any,
          } as any);
          if (success) {
            onSubmit?.(values);
          }
        }}
      />
    </Modal>
  );
};
export default UpdateModal;
