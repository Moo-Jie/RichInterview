"use client";

import React, { useState } from "react";
import {
    LoginForm,
    ProForm,
    ProFormSelect,
    ProFormText, ProFormTextArea,
} from "@ant-design/pro-form";
import { App, Button, Card } from "antd";
import {
  CheckCircleTwoTone,
  ExperimentOutlined,
  LockOutlined,
  MailOutlined,
  MobileOutlined,
  ReadOutlined,
  RightCircleTwoTone,
  RobotOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { userRegisterUsingPost } from "@/api/userController";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ConstantBasicMsg } from "@/constant/ConstantBasicMsg";
import "./index.css";
import { Vertify } from "@alex_xu/react-slider-vertify";

function BriefcaseOutlined() {
  return null;
}

/**
 * 用户注册页面
 * @param props
 */
const UserRegisterPage: React.FC = (props) => {
  // 表单状态管理
  const [form] = ProForm.useForm();
  // 路由管理
  const router = useRouter();
  // 提示消息
  const { message } = App.useApp();
  // 验证状态管理
  const [isVerified, setIsVerified] = useState(false);

  /**
   * 提交
   * @param values
   */
  const doSubmit = async (values: any) => {
    try {
      if (!isVerified) {
        message.error("请先完成滑动验证");
        return;
      }
      const res = await userRegisterUsingPost(values);
      if (res.data) {
        message.success("注册成功，请登录");
        // 前往登录页
        router.push("/user/userLogin");
      }
    } catch (e: any) {
      message.error("注册失败，" + e.message);
    }
  };

  return (
    <div id="userRegisterPage">
      <LoginForm<API.UserAddRequest>
        form={form}
        logo={
          <Image
            src="/assets/pictures/logo.png"
            alt={ConstantBasicMsg.PROJECT_CHINESE_NAME}
            width={44}
            height={44}
          />
        }
        title="RICH 智能面试刷题平台"
        subTitle="- 极速注册 -"
        onFinish={doSubmit}
        submitter={{
          searchConfig: {
            submitText: "注册",
          },
        }}
      >
        <ProFormText
          fieldProps={{
            size: "large",
            prefix: <UserOutlined />,
          }}
          name="userAccount"
          placeholder={"请输入账号（4-20位字母/数字）"}
          rules={[
            { required: true, message: "请输入账号" },
            { max: 20, message: "账号长度不能超过20个字符" },
            {
              pattern: /^[a-zA-Z0-9]{4,20}$/,
              message: "账号需4-20位字母或数字",
            },
          ]}
        />
        <ProFormText
          fieldProps={{
            size: "large",
            prefix: <UserOutlined />,
          }}
          name="userName"
          placeholder={"请输入用户名（2-20个字符）"}
          rules={[
            { required: true, message: "请输入用户名" },
            { max: 20, message: "用户名不能超过20个字符" },
          ]}
        />
        <ProFormText
          fieldProps={{
            size: "large",
            prefix: <MobileOutlined />,
          }}
          name="phoneNumber"
          placeholder={"请输入手机号"}
          rules={[
            { required: true, message: "请输入合法手机号！" },
            { pattern: /^1[3-9]\d{9}$/, message: "手机号格式不正确" },
          ]}
        />
        <ProFormText.Password
          name="userPassword"
          fieldProps={{
            size: "large",
            prefix: <LockOutlined />,
          }}
          placeholder={"请输入密码（8-20位）"}
          rules={[
            { required: true, message: "请输入密码！" },
            { min: 8, max: 20, message: "密码长度需8-20位" },
          ]}
        />
        <ProFormText.Password
          name="checkPassword"
          fieldProps={{
            size: "large",
            prefix: <LockOutlined />,
          }}
          placeholder={"请再次输入密码"}
          rules={[
            { required: true, message: "请确认密码" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("userPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("两次输入的密码不一致"));
              },
            }),
          ]}
        />
        <ProFormText
          fieldProps={{
            size: "large",
            prefix: <MailOutlined />,
          }}
          name="email"
          placeholder={"请输入邮箱（选填）"}
          rules={[
            {
              pattern: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/,
              message: "邮箱格式不正确",
            },
            { max: 20, message: "邮箱长度不能超过20个字符" },
          ]}
        />
        <ProFormSelect
          fieldProps={{
            size: "large",
            prefix: <ReadOutlined />,
          }}
          name="grade"
          placeholder={"选择教育阶段（选填）"}
          options={[
            { label: "大学一年级", value: "大学一年级" },
            { label: "大学二年级", value: "大学二年级" },
            { label: "大学三年级", value: "大学三年级" },
            { label: "大学四年级", value: "大学四年级" },
            { label: "研一", value: "研一" },
            { label: "研二", value: "研二" },
            { label: "研三", value: "研三" },
            { label: "高中一年级", value: "高中一年级" },
            { label: "高中二年级", value: "高中二年级" },
            { label: "高中三年级", value: "高中三年级" },
            { label: "初中一年级", value: "初中一年级" },
            { label: "初中二年级", value: "初中二年级" },
            { label: "初中三年级", value: "初中三年级" },
            { label: "初中四年级", value: "初中四年级" },
            { label: "初中五年级", value: "初中五年级" },
            { label: "初中六年级", value: "初中六年级" },
            { label: "硕士毕业", value: "硕士毕业" },
            { label: "小学一年级", value: "小学一年级" },
            { label: "小学二年级", value: "小学二年级" },
            { label: "小学三年级", value: "小学三年级" },
            { label: "小学四年级", value: "小学四年级" },
            { label: "小学五年级", value: "小学五年级" },
            { label: "小学六年级", value: "小学六年级" },
          ]}
        />
          <ProFormTextArea
              fieldProps={{
                  size: "large",
                  rows: 4,
                  showCount: true,
                  maxLength: 100
              }}
              name="workExperience"
              placeholder="请输入您的工作经历（选填，最多100字）"
              rules={[{ required: false }]}
          />
        <ProFormSelect
          fieldProps={{
            size: "large",
            prefix: <ExperimentOutlined />,
          }}
          name="expertiseDirection"
          placeholder={"请输入您的主攻方向（选填）"}
          options={[
            { label: "全栈开发", value: "全栈开发" },
            { label: "前端开发", value: "前端开发" },
            { label: "后端开发", value: "后端开发" },
            { label: "移动开发", value: "移动开发" },
            { label: "数据科学", value: "数据科学" },
            { label: "人工智能", value: "人工智能" },
            { label: "云计算", value: "云计算" },
            { label: "网络安全", value: "网络安全" },
            { label: "物联网", value: "物联网" },
            { label: "游戏开发", value: "游戏开发" },
            { label: "UI/UX设计", value: "UI/UX设计" },
            { label: "产品经理", value: "产品经理" },
            { label: "测试工程师", value: "测试工程师" },
            { label: "数据库管理", value: "数据库管理" },
            { label: "系统架构", value: "系统架构" },
            { label: "DevOps", value: "DevOps" },
            { label: "嵌入式开发", value: "嵌入式开发" },
            { label: "区块链开发", value: "区块链开发" },
          ]}
        />

        {/* 是否进行验证按钮 */}
        {!isVerified && (
          <div style={{ marginBottom: 24 }}>
            <Button
              style={{
                paddingLeft: 0,
                paddingRight: 0,
                width: "110%",
                height: 50,
              }}
            >
              <RobotOutlined />
              请进行登录验证
            </Button>
            {/* 滑动验证框 */}
            {/* https://juejin.cn/post/7007615666609979400 */}
            <Card style={{ width: "110%" }}>
              <Vertify
                width={300}
                height={200}
                text="请按住滑块拖动"
                onSuccess={() => {
                  setIsVerified(true);
                  message.success("验证成功！");
                }}
                // https://picsum.photos/ 随机获取图片
                // 格式 https://picsum.photos/${width}/${height}
                // TODO 若响应过慢，尝试降低图片像素
                imgUrl={"https://picsum.photos/150/100"}
                onFail={() => message.error("验证失败，请重试")}
                onRefresh={() => setIsVerified(false)}
              />
            </Card>
          </div>
        )}
        {isVerified && (
          <div style={{ marginBottom: 24 }}>
            <Button
              style={{
                paddingLeft: 0,
                paddingRight: 0,
                width: "100%",
                height: 50,
              }}
            >
              <CheckCircleTwoTone /> 验证成功！
            </Button>
          </div>
        )}

        <div
          style={{
            marginBlockEnd: 24,
            textAlign: "end",
          }}
        >
          <div>
            登录即表示同意
            <Link
              prefetch={false}
              href={"/other/AgreementOrTermPages/userServiceAgreement"}
            >
              《用户服务协议》
            </Link>
            和
            <Link
              prefetch={false}
              href={"/other/AgreementOrTermPages/privacyPolicy"}
            >
              《隐私政策》
            </Link>
          </div>
          已有账号？
          <RightCircleTwoTone />
          <Link prefetch={false} href={"/user/userLogin"}>
            去登录
          </Link>
        </div>
      </LoginForm>
    </div>
  );
};

export default UserRegisterPage;
