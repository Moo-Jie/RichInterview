import { updateLearnPathUsingPost } from "@/api/learnPathController";
import { ProColumns, ProTable } from "@ant-design/pro-components";
import { App, Modal } from "antd";
import React from "react";

interface Props {
  oldData?: API.LearnPath;
  visible: boolean;
  columns: ProColumns<API.LearnPath>[];
  onSubmit: (values: API.LearnPathUpdateRequest) => void;
  onCancel: () => void;
}

/**
 * 更新弹窗
 * @param props
 * @constructor
 */
const UpdateModal: React.FC<Props> = (props) => {
  const { oldData, visible, columns, onSubmit, onCancel } = props;
  const { message } = App.useApp();
  /**
   * 更新节点
   *
   * @param fields
   */
  const handleUpdate = async (fields: API.LearnPathUpdateRequest) => {
    const hide = message.loading("正在更新");
    try {
      await updateLearnPathUsingPost(fields);
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

  // 表单转换
  let initValues = { ...oldData };
  if (oldData.tags) {
    initValues.tags = JSON.parse(oldData.tags) || [];
  }

  return (
    <Modal
      destroyOnHidden
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
          initialValues: initValues,
        }}
        onSubmit={async (values: API.LearnPathUpdateRequest) => {
          const success = await handleUpdate({
            ...values,
            id: initValues?.id as any,
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
