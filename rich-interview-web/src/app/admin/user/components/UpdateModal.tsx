import { updateUserUsingPost } from "@/api/userController";
import { ProColumns, ProTable } from "@ant-design/pro-components";
import { Button, message, Modal, Upload } from "antd";
import React from "react";
import { UploadOutlined } from "@ant-design/icons";
import { uploadFileUsingPost } from "@/api/fileController";

interface Props {
  oldData?: API.User;
  visible: boolean;
  columns: ProColumns<API.User>[];
  onSubmit: (values: API.UserAddRequest) => void;
  onCancel: () => void;
}

/**
 * 更新节点
 *
 * @param fields
 */
const handleUpdate = async (fields: API.UserUpdateRequest) => {
  const hide = message.loading("正在更新");
  try {
    await updateUserUsingPost(fields);
    hide();
    message.success("更新成功");
    return true;
  } catch (error: any) {
    hide();
    message.error("更新失败，" + error.message);
    return false;
  }
};

/**
 * 更新弹窗
 * @param props
 * @constructor
 */
const UpdateModal: React.FC<Props> = (props) => {
  const { oldData, visible, columns, onSubmit, onCancel } = props;
  const avatarColumn: ProColumns<API.User> = {
    title: "用户头像",
    dataIndex: "userAvatar",
    valueType: "image",
    // 添加表单值转换器
    formItemProps: {
      rules: [{ required: true }],
    },
    // @ts-ignore
    convertValue: (value) => value || "",
    // 修复类型转换问题
    renderFormItem: (_, { value, onChange }) => (
      <Upload
        name="avatar"
        listType="picture"
        maxCount={1}
        beforeUpload={(file) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            // 明确传递base64字符串
            // @ts-ignore
            onChange(reader.result?.toString() || "");
          };
          return false;
        }}
          // @ts-ignore
        onRemove={() => onChange("")}
      >
        <Button icon={<UploadOutlined />}>
          {value ? "更换头像" : "上传头像"}
        </Button>
      </Upload>
    ),
  };
  if (!oldData) {
    return <></>;
  }
  const mergedColumns = columns.map((column) =>
    column.dataIndex === "userAvatar" ? avatarColumn : column,
  );
  return (
    <Modal
      destroyOnClose
      title={"更新"}
      open={visible}
      footer={null}
      onCancel={() => {
        onCancel?.();
      }}
    >
      <ProTable
        type="form"
        columns={mergedColumns}
        form={{
          initialValues: oldData,
        }}
        onSubmit={async (values: API.UserAddRequest) => {
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
