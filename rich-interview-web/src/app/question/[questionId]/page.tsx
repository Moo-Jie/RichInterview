"use client";
import { Alert, Button, Flex, Menu, Space, Spin } from "antd";
import {
  getQuestionBankId,
  getQuestionVoByIdUsingGet,
} from "@/api/questionController";
import QuestionMsgComponent from "../../../components/QuestionMsgComponent";

import Link from "next/link";
import { getQuestionBankVoByIdUsingGet } from "@/api/questionBankController";
import Sider from "antd/es/layout/Sider";
import Title from "antd/es/typography/Title";
import { Content } from "antd/es/layout/layout";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import "./index.css";

/**
 * 题目详情页
 * @constructor
 */
// @ts-ignore
export default function QuestionPage({ params }) {
  const { questionId } = params;

  // 状态管理
  const [question, setQuestion] = useState<API.QuestionVO | undefined>(undefined);
  const [bank, setBank] = useState<API.QuestionBankVO | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 数据获取逻辑
  useEffect(() => {
    // 防止重复请求
    if (!questionId) return;

    let isCancelled = false; // 防止组件卸载后设置状态

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 获取题目详情
        const questionRes = await getQuestionVoByIdUsingGet({
          id: questionId,
        });

        if (isCancelled) return; // 如果组件已卸载，停止执行

        if (!questionRes.data) {
          throw new Error("获取题目详情失败");
        }

        // @ts-ignore
        setQuestion(questionRes.data);

        // 获取题库ID
        // @ts-ignore
        const bankIdRes = await getQuestionBankId(questionRes.data.id);

        if (isCancelled) return;

        const questionBankId = bankIdRes.data;

        // 获取题库列表
        const bankRes = await getQuestionBankVoByIdUsingGet({
          id: questionBankId,
          queryQuestionsFlag: true,
          pageSize: 200,
        });

        if (isCancelled) return;

        if (!bankRes.data) {
          throw new Error("获取题库详情失败");
        }

        setBank(bankRes.data as API.QuestionVO);
      } catch (e: any) {
        if (!isCancelled) {
          console.error("数据获取失败：", e.message);
          setError(e.message || "未知错误");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // 清理函数
    return () => {
      isCancelled = true;
    };
  }, [questionId]); // 确保依赖项正确

  // 加载状态
  if (loading) {
    return (
        <div style={{ textAlign: "center", padding: "50px" }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>加载中...</div>
        </div>
    );
  }

  // 错误状态
  if (error) {
    return (
        <Alert
            type="error"
            message={`加载失败: ${error}`}
            style={{ margin: 24 }}
        />
    );
  }

  // 数据验证
  if (!question || !bank) {
    return (
        <Alert
            type="warning"
            message="数据加载异常，请刷新重试"
            style={{ margin: 24 }}
        />
    );
  }
  // 题目菜单列表
  const questionMenuItemList = (bank.questionsPage?.records || []).map((q) => {
    return {
      label: <Link href={`/question/${q.id}`}>{q.title}</Link>,
      key: String(q.id), // 确保key是字符串类型
    };
  });

  // 获取当前题目索引
  const questionList = bank.questionsPage?.records || [];
  const currentIndex = questionList.findIndex((q) => q.id === question.id);
  // 若为第一题和最后一题，上一题和下一题为null
  const prevQuestion = currentIndex > 0 ? questionList[currentIndex - 1] : null;
  const nextQuestion =
      currentIndex < questionList.length - 1
          ? questionList[currentIndex + 1]
          : null;

  return (
      <div id="questionPage">
        <Flex gap={24}>
          <Sider width={240} theme="light" style={{ padding: "24px 0" }}>
            <Title level={4} style={{ padding: "0 20px" }}>
              {bank.title}
            </Title>
            {/*源：https://ant-design.antgroup.com/components/menu-cn*/}
            <Menu
                items={questionMenuItemList}
                selectedKeys={[String(question.id)]} // 确保selectedKeys是字符串数组
            />
          </Sider>
          <Content>
            <Space style={{ marginBottom: 24 }}>
              {/*若为第一题和最后一题，上一题和下一题为 null*/}
              {prevQuestion && (
                  <Link href={`/question/${prevQuestion.id}`}>
                    <Button icon={<LeftOutlined />}>上一题</Button>
                  </Link>
              )}
              {nextQuestion && (
                  <Link href={`/question/${nextQuestion.id}`}>
                    <Button icon={<RightOutlined />}>下一题</Button>
                  </Link>
              )}
            </Space>
            <QuestionMsgComponent question={question} />
          </Content>
        </Flex>
      </div>
  );
}
