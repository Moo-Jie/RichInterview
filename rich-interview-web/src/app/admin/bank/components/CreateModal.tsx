import { addQuestionBankUsingPost } from "@/api/questionBankController";
import { ProColumns, ProTable } from "@ant-design/pro-components";
import {App, Button, Modal, Upload} from "antd";
import React from "react";
import {UploadOutlined} from "@ant-design/icons";

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
