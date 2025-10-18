import {Input} from "antd";
import {useRouter} from "next/navigation";
import "./index.css";
import {SearchOutlined} from "@ant-design/icons";
import React from "react";

interface Props {
  onLoadingChange?: (loading: boolean, message?: string) => void;
}

/**
 * 搜索条通用组件
 * @constructor
 * 搜索输入框组件，包含搜索功能和快捷创建按钮
 * 基于Ant Design的Input组件封装，支持防抖和快捷操作
 */
const SearchInputComponent = (props: Props) => {
  const { onLoadingChange } = props;
  const router = useRouter();

  return (
    <div
      aria-hidden
      style={{
        display: "flex",
        alignItems: "center",
        marginInlineEnd: 24,
      }}
      // 阻止事件冒泡和默认行为，防止影响其他组件的交互
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <Input.Search
        style={{
          borderRadius: 5,
          marginInlineEnd: 15,
        }}
        prefix={<SearchOutlined />}
        placeholder="搜索面试题目"
        maxLength={20}
        variant="borderless"
        onSearch={(value) => {
          // 显示加载动画
          onLoadingChange?.(true, `正在搜索 "${value}"...`);
          
          // 使用 URLSearchParams 构造查询参数
          const params = new URLSearchParams();
          params.set("q", value);
          
          // 延迟跳转，确保加载动画显示
          setTimeout(() => {
            // 跳转
            router.push(`/questions?${params.toString()}`);
            
            // 页面跳转后隐藏加载动画（延迟一点时间确保页面开始加载）
            setTimeout(() => {
              onLoadingChange?.(false);
            }, 500);
          }, 100);
        }}
      />
    </div>
  );
};
export default SearchInputComponent;
