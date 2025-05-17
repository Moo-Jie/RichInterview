// 模板来源：https://procomponents.ant.design/components/login-form
"use client";

import React from "react";
import {LoginForm, ProForm, ProFormText} from "@ant-design/pro-form";
import {App, Col, Row, Space} from "antd";
import {
    BarChartOutlined,
    BugOutlined,
    ClockCircleOutlined,
    CrownOutlined,
    LockOutlined,
    RightCircleTwoTone,
    RiseOutlined,
    SafetyOutlined,
    SearchOutlined,
    TeamOutlined,
    UpOutlined,
    UserOutlined,
} from "@ant-design/icons";
import {userLoginUsingPost} from "@/api/userController";
import {useRouter} from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {AppDispatch} from "@/store";
import {setUserLogin} from "@/store/userLogin";
import {useDispatch} from "react-redux";
import {ConstantBasicMsg} from "@/constant/ConstantBasicMsg";
import "./index.css";

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
    <div id="userLoginPage" className="login-container">
      <Row gutter={100} justify="center" style={{ height: "90vh" }}>
        {/* 左侧信息展示 */}
        <Col xs={24} md={12} lg={14}>
          <BenefitsShowcase />
          <MarketingFooter />
        </Col>
        {/* 右侧登录表单 */}
        <Col xs={24} md={12} lg={10}>
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
            subTitle="- 登录后免费享全部热门题目 -"
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
              还没有账号？
              <RightCircleTwoTone />
              <Link prefetch={false} href={"/user/userRegister"}>
                去注册
              </Link>
            </div>
          </LoginForm>
        </Col>
      </Row>
    </div>
  );
};

export default UserLoginPage;

const BenefitsShowcase = () => (
  <Row gutter={[16, 16]} style={{ height: "50%" }}>
    <Col xs={24} md={8}>
      <div className="benefit-card premium">
        <CrownOutlined className="benefit-icon" />
        <h3>全题库免费</h3>
        <p>
          免费体验全部企业高频面试题及配套高质量题解，含基础知识、进阶原理、开发经验，
        </p>
      </div>
    </Col>
    <Col xs={24} md={8}>
      <div className="benefit-card analysis">
        <BarChartOutlined className="benefit-icon" />
        <h3>每日打卡记录</h3>
        <p>实时查看自己的学习热力图，总结学习时效</p>
      </div>
    </Col>
    <Col xs={24} md={8}>
      <div className="benefit-card interview">
        <UpOutlined className="benefit-icon" />
        <h3>专业 AI 解答</h3>
        <p>基于主流 AI 训练的 RICH AI 助手辅助构建凝练详细的帮助文档</p>
      </div>
    </Col>
    <Col xs={24} md={8}>
      <div className="benefit-card analysis">
        <RiseOutlined className="benefit-icon" />
        <h3>急速响应内容</h3>
        <p>拒绝加载，节约你的宝贵学习时间</p>
      </div>
    </Col>
    <Col xs={24} md={8}>
      <div className="benefit-card interview">
        <SearchOutlined className="benefit-icon" />
        <h3>高效寻题</h3>
        <p>快速定位目标高频面试题,不再为找题烦恼</p>
      </div>
    </Col>
    <Col xs={24} md={8}>
      <div className="benefit-card premium">
        <TeamOutlined className="benefit-icon" />
        <h3>面向广大用户群体</h3>
        <p>适用于 实习 / 校招 / 社招 / 求职 等广泛求职群体</p>
      </div>
    </Col>
  </Row>
);

const MarketingFooter = () => (
  <div className="marketing-footer">
    <Space size={20}>
      <SafetyOutlined /> 简约高效的用户 UI 体验
      <BugOutlined /> 题目实时更新
      <ClockCircleOutlined /> 7x24小时客服服务
    </Space>
  </div>
);
