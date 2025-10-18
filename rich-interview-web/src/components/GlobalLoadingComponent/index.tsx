import {LoadingOutlined} from "@ant-design/icons";
import {Modal} from "antd";
import "./index.css";

interface GlobalLoadingProps {
  visible: boolean;
  message?: string;
}

export default function GlobalLoading({ visible, message = "页面正在加载中..." }: GlobalLoadingProps) {
  return (
    <Modal
      open={visible}
      footer={null}
      closable={false}
      centered={false}
      width={400}
      className="global-loading-modal"
      style={{ top: 100 }}
      maskStyle={{
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className="global-loading-content">
        <div className="loading-animation">
          <LoadingOutlined className="loading-spinner" />
        </div>
        <div className="loading-message">{message}</div>
        <div className="loading-tips">请稍候，正在为您跳转页面...</div>
      </div>
    </Modal>
  );
}