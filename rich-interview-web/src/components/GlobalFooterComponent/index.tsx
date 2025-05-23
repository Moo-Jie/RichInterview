import React from "react";
import "./index.css";
import {ConstantBasicMsg} from "@/constant/ConstantBasicMsg";

/**
 * 全局底部页脚组件
 * @constructor
 */
export default function GlobalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="global-footer">
      <div>
        © {currentYear} {ConstantBasicMsg.PROJECT_CHINESE_NAME}
      </div>
      <div>
        关注我：
        <a href="https://github.com/Moo-Jie" target="_blank">
          莫桀
        </a>
      </div>
    </div>
  );
}
