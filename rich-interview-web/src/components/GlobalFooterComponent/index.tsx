import React from "react";
import {ConstantBasicMsg} from "@/constant/ConstantBasicMsg";
import "./index.css";

/**
 * 全局底部页脚组件
 * @constructor
 */
export default function GlobalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="footer-container">
      <div className="global-footer">
        © {currentYear}
        <div className="font-fm">
          {ConstantBasicMsg.PROJECT_CHINESE_NAME}&nbsp;v
          {ConstantBasicMsg.PROJECT_VERSION}
        </div>
      </div>

      <div></div>
    </div>
  );
}
