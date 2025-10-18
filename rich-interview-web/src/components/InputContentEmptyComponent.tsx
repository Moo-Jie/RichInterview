"use client";
import {Modal} from "antd";
import {memo} from "react";

interface InputContentEmptyProps {
  visible: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const InputContentEmptyComponent = memo(
  ({ visible, onCancel }: InputContentEmptyProps) => {
    return (
      <Modal
        title="提示"
        open={visible}
        onCancel={onCancel}
        centered
        destroyOnHidden
        onOk={onCancel}
        cancelButtonProps={{
          style: {
            display: "none",
          },
        }}
      >
        输入内容为空,如：HTTP 和 HTTPS 的区别是什么？
      </Modal>
    );
  },
);

export default InputContentEmptyComponent;
