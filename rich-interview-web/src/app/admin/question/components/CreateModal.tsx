import {addQuestionUsingPost} from "@/api/questionController";
import {ProColumns, ProTable} from "@ant-design/pro-components";
import {App, Modal} from "antd";
import React from "react";

interface Props {
  visible: boolean;
  columns: ProColumns<API.Question>[];
  onSubmit: (values: API.QuestionAddRequest) => void;
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
  const handleAdd = async (fields: API.QuestionAddRequest) => {
    const hide = message.loading("正在添加");
    try {
      await addQuestionUsingPost(fields);
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
    //   源：https://procomponents.ant.design/components/modal-form#modalformdrawerform-demo-modal-form
    <Modal
      destroyOnClose
      title={"新建"}
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
        onSubmit={async (values: API.QuestionAddRequest) => {
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
