import {Input} from "antd";
import {useRouter} from "next/navigation";
import "./index.css";
import {SearchOutlined} from "@ant-design/icons";
import React from "react";

interface Props {}

/**
 * 搜索条通用组件
 * @constructor
 * 搜索输入框组件，包含搜索功能和快捷创建按钮
 * 基于Ant Design的Input组件封装，支持防抖和快捷操作
 */
const SearchInputComponent = (props: Props) => {
  const router = useRouter();

  return (
    <div
      className="search-input"
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
          //   TODO 适配 ES 搜索
          router.push(`/questions?q=${value}`);
        }}
      />
    </div>
  );
};
export default SearchInputComponent;
