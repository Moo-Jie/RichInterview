"use client";

import React from "react";
import {LoginForm, ProForm, ProFormText} from "@ant-design/pro-form";
import {App} from "antd";
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {userRegisterUsingPost} from "@/api/userController";
import Link from "next/link";
import {useRouter} from "next/navigation";
import Image from "next/image";
import {ConstantMsg} from "@/constant/ConstantMsg";
import "./index.css";

/**
 * 用户注册页面
 * @param props
 */
const UserRegisterPage: React.FC = (props) => {
  const [form] = ProForm.useForm();
  const router = useRouter();
  const { message } = App.useApp()

  /**
   * 提交
   * @param values
   */
  const doSubmit = async (values: any) => {
    try {
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
            alt={ConstantMsg.PROJECT_CHINESE_NAME}
            width={44}
            height={44}
          />
        }
        title="RICH面试刷题平台 - 用户登录"
        subTitle="-程序员必备的面试刷题网站-"
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
          placeholder={"请输入账号"}
          rules={[
            {
              required: true,
              message: "请输入账号",
            },
          ]}
        />
        <ProFormText
            fieldProps={{
              size: "large",
              prefix: <UserOutlined />,
            }}
            name="userName"
            placeholder={"请输入用户名"}
            rules={[
              {
                required: true,
                message: "请输入用户名",
              },
            ]}
        />
        <ProFormText.Password
          name="userPassword"
          fieldProps={{
            size: "large",
            prefix: <LockOutlined />,
          }}
          placeholder={"请输入密码"}
          rules={[
            {
              required: true,
              message: "请输入密码！",
            },
          ]}
        />
        <ProFormText.Password
          name="checkPassword"
          fieldProps={{
            size: "large",
            prefix: <LockOutlined />,
          }}
          placeholder={"请再次确认密码"}
          rules={[
            {
              required: true,
              message: "请再次确认密码！",
            },
          ]}
        />
        <div
          style={{
            marginBlockEnd: 24,
            textAlign: "end",
          }}
        >
          已有账号？
          <Link prefetch={false} href={"/user/userLogin"}>
            去登录
          </Link>
        </div>
      </LoginForm>
    </div>
  );
};

export default UserRegisterPage;
