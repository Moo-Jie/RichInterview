import { addUserUsingPost } from "@/api/userController";
import { ProColumns, ProTable } from "@ant-design/pro-components";
import { message, Modal } from "antd";
import React from "react";
import { Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { uploadFileUsingPost } from "@/api/fileController";

interface Props {
  visible: boolean;
  columns: ProColumns<API.User>[];
  onSubmit: (values: API.UserAddRequest) => void;
  onCancel: () => void;
}

/**
 * 添加节点
 * @param fields
 */
const handleAdd = async (fields: API.UserAddRequest) => {
  const hide = message.loading("正在添加");
  try {
    await addUserUsingPost(fields);
    hide();
    message.success("创建成功");
    return true;
  } catch (error: any) {
    hide();
    message.error("创建失败，" + error.message);
    return false;
  }
};

/**
 * 创建弹窗
 * @param props
 * @constructor
 */
const CreateModal: React.FC<Props> = (props) => {
  const { visible, columns, onSubmit, onCancel } = props;
  const avatarColumn: ProColumns<API.User> = {
    title: "用户头像",
    dataIndex: "userAvatar",
    valueType: "image",
    // 添加表单值转换器
    formItemProps: {
      rules: [{ required: true }],
    },
    // 修复类型转换问题
      // @ts-ignore
    convertValue: (value) => value || "",
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

  // 合并列配置
  const mergedColumns = columns.map((column) =>
    column.dataIndex === "userAvatar" ? avatarColumn : column,
  );
  return (
    <Modal
      destroyOnClose
      title={"创建"}
      open={visible}
      footer={null}
      onCancel={() => {
        onCancel?.();
      }}
    >
      <ProTable
        type="form"
        columns={mergedColumns}
        onSubmit={async (values: API.UserAddRequest) => {
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
