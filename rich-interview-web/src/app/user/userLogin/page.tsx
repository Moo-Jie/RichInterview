// 模板来源：https://procomponents.ant.design/components/login-form
"use client";

import React from "react";
import {LoginForm, ProForm, ProFormText} from "@ant-design/pro-form";
import {App} from "antd";
import {LockOutlined, UserOutlined} from "@ant-design/icons";
import {userLoginUsingPost} from "@/api/userController";
import {useRouter} from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {AppDispatch} from "@/store";
import {setUserLogin} from "@/store/userLogin";
import {useDispatch} from "react-redux";
import "./index.css";
import {ConstantMsg} from "@/constant/ConstantMsg";

/**
 * 用户登录页面
 * @param props
 */
const UserLoginPage: React.FC = (props) => {
  const [form] = ProForm.useForm();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { message } = App.useApp();
  /**
   * 提交
   * @param values
   */
  const doSubmit = async (values: any) => {
    try {
      const res = await userLoginUsingPost(values);
      if (res.data) {
        message.success("登录成功！");
        // 保存用户登录态
        dispatch(setUserLogin(res.data as API.LoginUserVO));
        router.replace("/");
        form.resetFields();
      }
    } catch (e: any) {
      message.error("登录失败，" + e.message);
    }
  };

  return (
    <div id="userLoginPage">
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
            submitText: "登录",
          },
        }}
      >
        <ProFormText
          name="userAccount"
          fieldProps={{
            size: "large",
            prefix: <UserOutlined />,
          }}
          placeholder={"请输入用户账号"}
          rules={[
            {
              required: true,
              message: "请输入用户账号!",
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
        <div
          style={{
            marginBlockEnd: 24,
            textAlign: "end",
          }}
        >
          还没有账号？
          <Link prefetch={false} href={"/user/userRegister"}>
            去注册
          </Link>
        </div>
      </LoginForm>
    </div>
  );
};

export default UserLoginPage;
