import {addQuestionBankUsingPost} from "@/api/questionBankController";
import {ProColumns, ProTable} from "@ant-design/pro-components";
import {App, Modal} from "antd";
import React from "react";

interface Props {
  visible: boolean;
  columns: ProColumns<API.QuestionBank>[];
  onSubmit: (values: API.QuestionBankAddRequest) => void;
  onCancel: () => void;
}

/**
 * 创建弹窗
 * @param props
 * @constructor
 */
const CreateModal: React.FC<Props> = (props) => {
  const { visible, columns, onSubmit, onCancel } = props;
  const { message } = App.useApp();

  /**
   * 添加节点
   * @param fields
   */
  const handleAdd = async (fields: API.QuestionBankAddRequest) => {
    const hide = message.loading("正在添加");
    try {
      await addQuestionBankUsingPost(fields);
      hide();
      message.success("创建成功");
      return true;
    } catch (error: any) {
      hide();
      message.error("创建失败，" + error.message);
      return false;
    }
  };
  return (
    <Modal
      destroyOnHidden
      title={"创建"}
      open={visible}
      footer={null}
      onCancel={() => {
        onCancel?.();
      }}
    >
      <ProTable
        type="form"
        columns={columns}
        onSubmit={async (values: API.QuestionBankAddRequest) => {
          const success = await handleAdd(values);
          if (success) {
            onSubmit?.(values);
          }
        }}
      />
    </Modal>
  );
};
export default CreateModal;
