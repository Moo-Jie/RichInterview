"use client";
/**
 * @Date: 2025/3/30 13:47
 * @Author: duRuiChi
 *  基于Ant Design Procomponents布局组件
 *  TODO 动态数据实现
 *  TODO 通用组件进一步抽取
 */

import {
  GithubFilled,
  InfoCircleFilled,
  LogoutOutlined,
  QuestionCircleFilled,
  SearchOutlined,
} from "@ant-design/icons";
import { ProLayout } from "@ant-design/pro-components";
import { Dropdown, Input } from "antd";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import Link from "next/link";
import GlobalFooter from "@/components/GlobalFooterComponent";
import { sysMenus } from "../../../config/menu";
import { ConstantMsg } from "../../../public/constant/ConstantMsg";

/**
 * 搜索输入框组件，包含搜索功能和快捷创建按钮
 * 基于Ant Design的Input组件封装，支持防抖和快捷操作
 */
const SearchInput = () => {
  return (
    <div
      key="SearchOutlined"
      aria-hidden
      style={{
        display: "flex",
        alignItems: "center",
        marginInlineEnd: 24,
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      <Input
        style={{
          borderRadius: 4,
          marginInlineEnd: 12,
        }}
        prefix={<SearchOutlined />}
        placeholder="搜索面试题目"
        variant="borderless"
      />
    </div>
  );
};

/**
 * 子组件内容，用于渲染布局主体区域
 */
interface Props {
  children: React.ReactNode;
}

/**
 * 全局通用主组件
 * - 响应式布局（支持桌面和移动端）
 * - 顶部导航栏（包含品牌LOGO、搜索、用户操作等）
 * - 侧边栏菜单（支持多级路由配置）
 * - 全局状态管理（路由跟踪、用户偏好设置存储）
 */
export default function MainLayout({ children }: Props) {
  // 使用 Next.js 的导航钩子获取当前路由路径，用于菜单项的高亮状态和页面跳转逻辑
  const pathname = usePathname();

  // 客户端渲染状态控制，组件没有挂载，故初始化 mounted 状态为 false
  const [mounted, setMounted] = useState(false);

  // 使用 useEffect 在组件挂载后更新状态，空依赖数组表示该 effect 仅在组件初次渲染时执行
  useEffect(() => {
    // 将 mounted 状态设为 true，表示客户端已完成挂载
    // 这个状态切换用于区分服务端渲染和客户端渲染
    setMounted(true);
  }, []);

  // 进行条件渲染控制，在服务端渲染阶段返回null：避免服务端与客户端初始渲染内容不一致导致的 hydration 错误
  // 当 mounted 为 false 时（服务端渲染阶段），返回空内容
  if (!mounted) return null;

  return (
    <div
      id="mainLayout"
      style={{
        height: "100vh",
        overflow: "auto",
      }}
    >
      <ProLayout
        // 基础布局配置
        layout="top"
        title={ConstantMsg.PROJECT_CHINESE_NAME}
        logo={
          <Image
            src="/assets/pictures/logo.png"
            alt={ConstantMsg.PROJECT_NAME}
            width={35}
            height={35}
          />
        }
        location={{
          pathname,
        }}
        avatarProps={{
          src: "https://rich-tams.oss-cn-beijing.aliyuncs.com/DKD_RichDu/2025/03/09/67cd64943c851694f2a087e7.png",
          size: "small",
          title: "莫桀",
          render: (props, dom) => {
            return (
              <Dropdown
                autoAdjustOverflow={true}
                menu={{
                  items: [
                    {
                      key: "logout",
                      icon: <LogoutOutlined />,
                      label: "退出",
                    },
                  ],
                }}
              >
                {dom}
              </Dropdown>
            );
          },
        }}
        // 顶部操作区配置（搜索、帮助、GitHub链接）
        actionsRender={(props) => {
          if (props.isMobile) return [];
          return [
            <SearchInput key="search" />,
            <InfoCircleFilled key="InfoCircleFilled" />,
            <QuestionCircleFilled key="QuestionCircleFilled" />,
            <a href={ConstantMsg.REPO_URL} key="github" target="_blank">
              <GithubFilled key="GithubFilled" />
            </a>,
          ];
        }}
        // 头部标题渲染逻辑（响应式适配）
        // 标题渲染
        headerTitleRender={(logo, title, _) => {
          return (
            <a href={ConstantMsg.HOME_URL} target="_blank">
              {logo}
              {title}
            </a>
          );
        }}
        // 底部页脚渲染
        footerRender={() => <GlobalFooter />}
        // 侧边栏底部信息展示
        menuFooterRender={() => <GlobalFooter />}
        // 菜单头部点击处理
        onMenuHeaderClick={(e) => console.log(e)}
        // 菜单项点击处理（路由跳转）
        menuDataRender={() => {
          return sysMenus;
        }}
        // 菜单渲染
        menuItemRender={(item, dom) => (
          <Link href={item.path || "/"} target={item.target}>
            {dom}
          </Link>
        )}
      >
        {
          // 页面主体内容
          children
        }
      </ProLayout>
    </div>
  );
}
