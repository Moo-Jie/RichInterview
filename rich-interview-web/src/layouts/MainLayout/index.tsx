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
  LoginOutlined,
  LogoutOutlined,
  QuestionCircleFilled,
  SearchOutlined,
  UserOutlined,
  UserSwitchOutlined,
} from "@ant-design/icons";
import { ProLayout, WaterMark } from "@ant-design/pro-components";
import { App, Dropdown, Input, message, Popover } from "antd";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import GlobalFooter from "@/components/GlobalFooterComponent";
import { sysMenus } from "../../../config/menu";
import { ConstantMsg } from "@/constant/ConstantMsg";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import showMenuByUserAccess from "@/app/Forbidden/showMenuByUserAccess";
import { userLogoutUsingPost } from "@/api/userController";
import { DEFAULT_USER } from "@/constant/ConstantUser";
import { setUserLogin } from "@/store/userLogin";
import AccessEnumeration from "@/access/accessEnumeration";
import SearchInputComponent from "@/components/SearchInputComponent";

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
  // 在Redux状态中获取当前登录用户信息(在其他勾子之前，注意hooks的调用顺序)
  const loginUser = useSelector((state: RootState) => state.userLogin);

  // 使用 Next.js 的导航钩子获取当前路由路径，用于菜单项的高亮状态和页面跳转逻辑
  const pathname = usePathname();
  // mounted用于区分服务端渲染和客户端渲染阶段，避免在服务端渲染时执行客户端逻辑
  // 客户端渲染状态控制，组件没有挂载，故初始化 mounted 状态为 false
  const [mounted, setMounted] = useState(false);
  const [text, setText] = useState<string>("");
  // 在组件首次挂在后，将 mounted 状态设为 true，表示客户端已完成挂载
  useEffect(() => {
    setMounted(true);
  }, []);
  // 路由跳转
  const router = useRouter();
  // 使用 Redux 的 dispatch 函数，触发异步状态更新
  const dispatch = useDispatch<AppDispatch>();
  // Ant Design 的 message 组件，用于显示消息通知
  const { message } = App.useApp();

  // 进行条件渲染控制，在服务端渲染阶段返回null：避免服务端与客户端初始渲染内容不一致导致的 hydration 错误
  // 当 mounted 为 false 时（服务端渲染阶段），返回空内容
  if (!mounted) return null;
  // 服务端渲染完毕后，客户端渲染主布局组件
  return (
    <WaterMark
      height={32}
      width={32}
      fontSize={15}
      content={ConstantMsg.PROJECT_CHINESE_NAME}
    >
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
            src: loginUser.userAvatar,
            size: "small",
            title: loginUser.userName,
            render: (props, dom) => {
              // 登录
              const handleLogin = () => {
                try {
                  if (loginUser.userRole !== AccessEnumeration.NOT_LOGIN) {
                    throw new Error("您已经登录");
                  }
                  router.push("/user/userLogin");
                } catch (e: any) {
                  message.error(e.message);
                }
                return;
              };
              // 退出登录
              const handleLogout = async () => {
                try {
                  if (loginUser.userRole === AccessEnumeration.NOT_LOGIN) {
                    throw new Error("您未登录");
                  }
                  await userLogoutUsingPost();
                  message.success("退出成功，请重新登录");
                  dispatch(setUserLogin(DEFAULT_USER));
                  router.push("/");
                } catch (e: any) {
                  message.error(e.message);
                }
                return;
              };
              const handleSwitchAccount = async () => {
                try {
                  await userLogoutUsingPost();
                  dispatch(setUserLogin(DEFAULT_USER));
                  message.success("请登录新的账号");
                  router.push("/user/userLogin");
                } catch (e: any) {
                  message.error(e.message);
                }
                return;
              };
              const handleViewProfile = () => {
                if (loginUser.userRole === AccessEnumeration.NOT_LOGIN) {
                  message.error("您未登录");
                  return;
                }
                router.push("/user/userCenter");
                return;
              };

              return (
                <Dropdown
                  autoAdjustOverflow={true}
                  menu={{
                    items: [
                      {
                        key: "profile",
                        icon: <UserOutlined />,
                        label: "<个人中心>",
                        onClick: handleViewProfile,
                      },
                      {
                        type: "divider",
                      },
                      {
                        key: "login",
                        icon: <LoginOutlined />,
                        label: "<登录账号>",
                        onClick: handleLogin,
                      },
                      {
                        key: "switch",
                        icon: <UserSwitchOutlined />,
                        label: "<切换账号>",
                        onClick: handleSwitchAccount,
                      },
                      {
                        key: "logout",
                        icon: <LogoutOutlined />,
                        label: "<退出登录>",
                        onClick: handleLogout,
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
              <SearchInputComponent key="search" />,
              <Popover
                key="about"
                content={
                  <div style={{ maxWidth: 300 }}>
                    <h2>系统信息</h2>
                    <h4>当前版本：{ConstantMsg.PROJECT_VERSION}</h4>
                    <h4>维护者：{ConstantMsg.AUTHOR_NAME}</h4>
                    <h4>更新日期：{ConstantMsg.PROJECT_LAST_UPDATE_TIME}</h4>
                  </div>
                }
              >
                <InfoCircleFilled />
              </Popover>,
              <Popover
                key="help"
                content={
                  <div>
                    <div>
                      <h2>常见问题解答</h2>
                      <h3> 1. 如何搜索题目？</h3>
                      <h4>1.1 搜索框搜索：输入关键词进行搜索</h4>
                      <h4>1.2 题库搜索：进入对应主题题库进行查找</h4>
                      <h4>1.3 标签搜索：点击标签进行筛选</h4>
                      <h3>2. 题库更新频率？</h3>
                      <h4>题库会定期更新，将尽量保持内容的最新和全面</h4>
                      <h3>3. 反馈渠道</h3>
                      <h4>
                        请前往
                        <a href="/other/aboutAuthor">【关于作者】</a>
                        查看联系方式，若有侵权内容请联系我
                      </h4>
                    </div>
                  </div>
                }
              >
                <QuestionCircleFilled />
              </Popover>,
              <a
                href={ConstantMsg.REPO_URL}
                key="github"
                title="项目源码"
                target="_blank"
              >
                <GithubFilled key="GithubFilled" />
              </a>,
            ];
          }}
          // 头部标题渲染
          headerTitleRender={(logo, title, _) => {
            return (
              <a href={ConstantMsg.HOME_URL} target="_blank">
                {logo}
                {title}
              </a>
            );
          }}
          // 菜单头部点击处理
          onMenuHeaderClick={(e) => console.log(e)}
          // 菜单项点击处理（路由跳转）
          menuDataRender={() => {
            return showMenuByUserAccess(loginUser, sysMenus);
          }}
          // 菜单渲染
          menuItemRender={(item, dom) => {
            return <Link href={item.path || "/"}>{dom}</Link>;
          }}
          // 底部页脚渲染
          footerRender={() => <GlobalFooter />}
          // 侧边栏底部信息展示
          menuFooterRender={() => <GlobalFooter />}
        >
          {
            // 页面主体内容
            children
          }
        </ProLayout>
      </div>
    </WaterMark>
  );
}
