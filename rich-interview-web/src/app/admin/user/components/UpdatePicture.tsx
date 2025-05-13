import {App, Button, List, Modal, Spin, Typography, Upload} from "antd";
import React, {useState} from "react";
import {InboxOutlined} from "@ant-design/icons";
import {uploadImageUsingPost} from "@/api/fileDetailController";
import "./index.css";
import {updateUserUsingPost} from "@/api/userController";

interface Props {
  oldData?: API.QuestionBank;
  visible: boolean;
  onSubmit: (values: API.QuestionBankUpdateRequest) => void;
  onCancel: () => void;
}

interface FileItem {
  uid: string;
  filename: string;
  status?: string;
  url?: string;
}

const UpdateUserAvatarModal: React.FC<Props> = ({
  oldData,
  visible,
  onSubmit,
  onCancel,
}) => {
  const { message } = App.useApp();
  const [fileList, setFileList] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      const res = await uploadImageUsingPost(file);
      // @ts-ignore
      if (res.code === 0 && res.data) {
        setFileList([
          {
            uid: file.name,
            filename: file.name,
            status: "done",
            // @ts-ignore
            url: res.data,
          },
        ]);
        return res.data;
      }
      // @ts-ignore
      message.error(res.msg || "上传失败");
    } catch (e) {
      message.error("上传服务不可用");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!fileList[0]?.url) {
      message.error("请先上传题库头像");
      return;
    }

    const success = await updateUserUsingPost({
      ...oldData,
      userAvatar: fileList[0].url,
      id: oldData?.id,
    } as API.QuestionBankUpdateRequest);

    if (success) {
      onSubmit?.(oldData!);
      onCancel?.();
    }
  };

  return (
    <Modal
      title="更新用户头像"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
        >
          提交更新
        </Button>,
      ]}
    >
      <Upload.Dragger
        maxCount={1}
        accept="image/png, image/jpeg"
        showUploadList={false}
        customRequest={async ({ file }) => handleUpload(file as File)}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">拖拽或点击上传题库头像</p>
        <p className="ant-upload-hint">支持PNG/JPG格式，建议尺寸500x500</p>
      </Upload.Dragger>

      <List
        bordered
        dataSource={fileList}
        renderItem={(item) => (
          <List.Item
            actions={[
              <Button
                type="link"
                onClick={() => navigator.clipboard.writeText(item.url!)}
              >
                复制URL
              </Button>,
            ]}
          >
            <List.Item.Meta
              title={item.filename}
              description={
                <Typography.Text copyable>{item.url}</Typography.Text>
              }
            />
            {loading ? (
              <Spin />
            ) : (
              <img src={item.url} style={{ width: 60, height: 60 }} />
            )}
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default UpdateUserAvatarModal;
