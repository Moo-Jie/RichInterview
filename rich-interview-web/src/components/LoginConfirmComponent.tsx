"use client";
import {Modal} from "antd";
import {useRouter} from "next/navigation";
import {memo} from "react";

interface LoginConfirmModalProps {
  visible: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const LoginConfirmModal = memo(
  ({ visible, onConfirm, onCancel }: LoginConfirmModalProps) => {
    const router = useRouter();

    const handleOk = () => {
      router.push("/user/userLogin");
      onConfirm?.();
    };

    return (
      <Modal
        title="登录提示"
        open={visible}
        onOk={handleOk}
        onCancel={onCancel}
        okText="去登录"
        cancelText="取消"
        centered
        destroyOnHidden
      >
        使用该功能登录后免费，是否立即登录？
      </Modal>
    );
  },
);

export default LoginConfirmModal;
