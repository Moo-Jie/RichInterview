import { updateQuestionBankUsingPost } from "@/api/questionBankController";
import { ProColumns, ProTable } from "@ant-design/pro-components";
import { App, Button, Modal, Upload } from "antd";
import React from "react";
import { UploadOutlined } from "@ant-design/icons";

interface Props {
  oldData?: API.QuestionBank;
  visible: boolean;
  columns: ProColumns<API.QuestionBank>[];
  onSubmit: (values: API.QuestionBankUpdateRequest) => void;
  onCancel: () => void;
}

/**
 * 更新弹窗
 * @param props
 * @constructor
 */
const UpdateModal: React.FC<Props> = (props) => {
  const { oldData, visible, columns, onSubmit, onCancel } = props;
  const avatarColumn: ProColumns<API.User> = {
    title: "题库头像",
    dataIndex: "picture",
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
          {value ? "更换题库图片" : "上传题库图片"}
        </Button>
      </Upload>
    ),
  };
  // 表格列配置合并
  const mergedColumns = columns.map((column) =>
    column.dataIndex === "picture" ? avatarColumn : column,
  );
  const { message } = App.useApp();
  /**
   * 更新节点
   *
   * @param fields
   */
  const handleUpdate = async (fields: API.QuestionBankUpdateRequest) => {
    const hide = message.loading("正在更新");
    try {
      await updateQuestionBankUsingPost(fields);
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
        onSubmit={async (values: API.QuestionBankAddRequest) => {
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
