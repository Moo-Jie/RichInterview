import {LoadingOutlined} from "@ant-design/icons";
import "./index.css";

export default function Loading() {
    return (
        <div
            className="loading-overlay"
            role="status"
            aria-live="polite"
            aria-label="加载中"
        >
            <div className="loading-content">
                <LoadingOutlined className="loading-icon" />
                <p className="loading-text">RICH 正在努力加载中...</p>
            </div>
        </div>
    );
}