import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import "./index.css";

export default function Loading() {
  return (
    <div className="loading-overlay">
      <div className="loading-content">
        <Spin indicator={<LoadingOutlined className="loading-icon" />} />
        <p className="loading-text">加载中... </p>
      </div>
    </div>
  );
}
