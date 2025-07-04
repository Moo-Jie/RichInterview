"use client";
import { ProForm, ProFormText } from "@ant-design/pro-components";
import { App, Button, Card } from "antd";
import { addQuestionReviewUsingPost } from "@/api/questionReviewController";
import { useState } from "react";
import { ProFormSelect } from "@ant-design/pro-form";
import MarkdownEditor from "@/components/MarkdownComponent/MarkdownEditor";
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import "./index.css";

export default function ContributionPage() {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  // 表单提交状态
  const [submitted, setSubmitted] = useState(false);
  const [formRef] = ProForm.useForm();

  // 处理表单提交
  const handleSubmit = async (values: API.QuestionReviewAddRequest) => {
    try {
      setLoading(true);
      const res = await addQuestionReviewUsingPost(values);
      if (res !== null) {
        message.success("题目提交成功，请等待审核");
        // 提交成功后切换状态
        setSubmitted(true);
      }
    } catch (e: any) {
      message.error(`提交失败：${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* 贡献面试题提交表单 */}
      <Card
        title="贡献面试题"
        bordered={false}
        className="contribution-card"
        headStyle={{
          background: "linear-gradient(135deg, #6B8DD6 0%, #8E37D7 100%)",
          color: "#fff",
          fontSize: "1.25rem",
          border: "none",
          borderRadius: "12px 12px 0 0",
        }}
      >
        {submitted ? (
          <div className="submit-success">
            <h3>提交成功！🎉</h3>
            <p>您的题目已进入审核队列，我们将在1-3个工作日内处理</p>
            <br />
            <Button
              type="primary"
              size="large"
              className={"copy-button"}
              onClick={() => {
                setSubmitted(false);
                formRef.resetFields(); // 重置表单
              }}
            >
              继续提交新题目
            </Button>
          </div>
        ) : (
          <ProForm
            form={formRef}
            loading={loading}
            grid
            onFinish={async (values) => {
              await handleSubmit(values as API.QuestionReviewAddRequest);
            }}
            submitter={{
              resetButtonProps: { style: { display: "none" } },
              submitButtonProps: { size: "large" },
            }}
          >
            <ProFormText
              name="title"
              label="您遇到的题目名称"
              placeholder="示例：Java多线程并发安全问题分析"
              rules={[{ required: true, message: "请输入题目名称" }]}
              colProps={{ md: 24 }}
            />

            <Card>
              <ProForm.Item
                name="content"
                label="您遇到的题目内容（建议包含题目场景和具体要求）"
                rules={[{ required: true, message: "请输入题目内容" }]}
              >
                <MarkdownEditor placeholder="请使用Markdown格式详细描述 " />
              </ProForm.Item>
            </Card>
            <Card>
              <ProForm.Item
                name="answer"
                label="您认为的最优解答（若不知道请填 “无”）"
                rules={[{ required: true, message: "请输入参考答案" }]}
              >
                <MarkdownEditor placeholder="请使用Markdown格式详细描述 " />
              </ProForm.Item>
            </Card>

            <ProFormSelect
              name="tags"
              label="题目标签( 首个标签为难度标签 )"
              tooltip="点击选择 或 输入并 Enter 来选择标签"
              width="md"
              mode="tags"
              fieldProps={{
                tokenSeparators: [","],
                options: [
                  { label: "简单", value: "简单" },
                  { label: "普通", value: "普通" },
                  { label: "困难", value: "困难" },
                  { label: "JAVA", value: "JAVA" },
                  { label: "JavaScript", value: "JavaScript" },
                  { label: "Python", value: "Python" },
                  { label: "C++", value: "C++" },
                  { label: "数据结构", value: "数据结构" },
                  { label: "算法", value: "算法" },
                  { label: "数据库", value: "数据库" },
                  { label: "网络编程", value: "网络编程" },
                  { label: "操作系统", value: "操作系统" },
                  { label: "计算机组成原理", value: "计算机组成原理" },
                  { label: "计算机网络", value: "计算机网络" },
                  { label: "分布式系统", value: "分布式系统" },
                  { label: "系统设计", value: "系统设计" },
                  { label: "机器学习", value: "机器学习" },
                  { label: "深度学习", value: "深度学习" },
                  { label: "自然语言处理", value: "自然语言处理" },
                  { label: "计算机视觉", value: "计算机视觉" },
                ],
              }}
              rules={[
                {
                  required: true,
                  message: "至少包含一个难度标签",
                  validator: (_, value) =>
                    value?.some((v: string) =>
                      ["简单", "普通", "困难"].includes(v),
                    )
                      ? Promise.resolve()
                      : Promise.reject(),
                },
              ]}
            />
          </ProForm>
        )}
      </Card>

      {/* 提示信息 */}
      <Card
        title="贡献指南"
        bordered={false}
        className="contribution-card"
        headStyle={{
          background: "linear-gradient(135deg, #6B8DD6 0%, #8E37D7 100%)",
          color: "#fff",
          fontSize: "1.25rem",
          border: "none",
          borderRadius: "12px 12px 0 0",
        }}
      >
        <div className="contribution-guide-panel">
          <Card>
            <h3>
              <CheckCircleOutlined /> 优质题目标准
            </h3>
            <ul>
              <li>明确的问题背景描述</li>
              <li>清晰的输入输出示例</li>
              <li>分层次的参考答案结构</li>
            </ul>
          </Card>

          <Card>
            <h3>
              <ClockCircleOutlined /> 审核流程
            </h3>
            <div>
              <div>
                <div></div>
                <span>1-3个工作日完成审核</span>
              </div>
              <div>
                <div></div>
                <span>通过后进入公共题库</span>
              </div>
              <div>
                <div></div>
                <span>优质题目将获得推荐</span>
              </div>
            </div>
          </Card>

          <Card>
            <HeartOutlined />
            您的分享将帮助万千开发者成长,感谢您为技术社区做出的宝贵贡献！
          </Card>
        </div>
      </Card>
    </>
  );
}
