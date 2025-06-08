"use client";

import React, {useState} from "react";
import {LoginForm, ProForm, ProFormText} from "@ant-design/pro-form";
import {App, Button, Card} from "antd";
import {
  CheckCircleTwoTone, ExperimentOutlined,
  LockOutlined, MailOutlined,
  MobileOutlined, ReadOutlined,
  RightCircleTwoTone,
  RobotOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {userRegisterUsingPost} from "@/api/userController";
import Link from "next/link";
import {useRouter} from "next/navigation";
import Image from "next/image";
import {ConstantBasicMsg} from "@/constant/ConstantBasicMsg";
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
        <ProFormText
            fieldProps={{
              size: "large",
              prefix: <MobileOutlined />,
            }}
            name="phoneNumber"
            placeholder={"请输入合法手机号"}
            rules={[
              {
                required: true,
                message: "请输入合法手机号！",
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
        <ProFormText
            fieldProps={{
              size: "large",
              prefix: <MailOutlined />,
            }}
            name="email"
            placeholder={"请输入邮箱（选填）"}
            rules={[
              {
                required: false,
                message: "请输入邮箱（选填）",
              },
            ]}
        />
        <ProFormText
            fieldProps={{
              size: "large",
              prefix: <ReadOutlined />,
            }}
            name="grade"
            placeholder={"请输入年级（选填）"}
            rules={[
              {
                required: false,
                message: "请输入您的年级（选填）",
              },
            ]}
        />
        <ProFormText
            fieldProps={{
              size: "large",
              prefix: <BriefcaseOutlined />,
            }}
            name="workExperience"
            placeholder={"请输入您的工作经历（选填）"}
            rules={[
              {
                required: false,
                message: "请输入您的工作经历（选填）",
              },
            ]}
        />
        <ProFormText
            fieldProps={{
              size: "large",
              prefix: <ExperimentOutlined />,
            }}
            name="expertiseDirection"
            placeholder={"请输入您的主攻方向（选填）"}
            rules={[
              {
                required: false,
                message: "请输入您的主攻方向（选填）",
              },
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
