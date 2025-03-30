import React from "react";
import "./index.css";

/**
 * 全局底部页脚组件
 * @constructor
 */
export default function GlobalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="global-footer">
      <div>
        <a href="https://github.com/Moo-Jie/RichInterview.git" target="_blank">
          © {currentYear} Rich面试刷题平台
        </a>
      </div>
      <div>
        <a href="https://github.com/Moo-Jie" target="_blank">
          关注我： 莫桀
        </a>
      </div>
    </div>
  );
}
