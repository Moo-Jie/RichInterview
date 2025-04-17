"use server";
import { Flex, Menu, message } from "antd";
import { getQuestionVoByIdUsingGet } from "@/api/questionController";
import QuestionMsgComponent from "../../../components/QuestionMsgComponent";
import { Alert } from "antd";
import "./index.css";
import Link from "next/link";
import {
  getQuestionBankId,
  getQuestionBankVoByIdUsingGet,
} from "@/api/questionBankController";
import Sider from "antd/es/layout/Sider";
import Title from "antd/es/typography/Title";
import { Content } from "antd/es/layout/layout";

/**
 * 题目详情页
 * @constructor
 */
// @ts-ignore
export default async function QuestionPage({ params }) {
  const { questionId } = params;

  // 获取题目详情
  let question = undefined;
  try {
    const res = await getQuestionVoByIdUsingGet({
      id: questionId,
    });
    question = res.data;
    // 获取题目异常
    if (!question) {
      return <div>获取题目详情失败，请刷新重试</div>;
    }
  } catch (e: any) {
    message.error("获取题目详情失败，" + e.message);
    return (
      <Alert
        type="error"
        message={`题目加载失败: ${e.message || "未知错误"}`}
        style={{ margin: 24 }}
      />
    );
  }
  // 断言
  question = question as API.QuestionVO;

  // TODO 获取题库id
  // let questionBankId = undefined;
  // // 通过 getQuestionBankId() 请求得到题库id
  // try {
  //   // @ts-ignore
  //   const res = await getQuestionBankId(question.id);
  //   questionBankId = res.data;
  // }

  // 获取题库详情
  let bank = undefined;

  try {
    const res = await getQuestionBankVoByIdUsingGet({
      id: 1,
      queryQuestionsFlag: true,
      pageSize: 200,
    });
    bank = res.data;
    // 获取题目异常
    if (!bank) {
      return <div>获取题库详情失败，请刷新重试</div>;
    }
  } catch (e: any) {
    console.error("获取题库列表失败，" + e.message);
    return (
      <Alert
        type="error"
        message={`题库加载失败: ${e.message || "未知错误"}`}
        style={{ margin: 24 }}
      />
    );
  }
  // 错误处理
  if (!bank) {
    return <div>获取题库详情失败，请刷新重试</div>;
  }
  // 断言
  bank = bank as API.QuestionBankVO;
  // 题目菜单列表
  const questionMenuItemList = (bank.questionsPage?.records || []).map((q) => {
    return {
      label: <Link href={`/question/${q.id}`}>{q.title}</Link>,
      key: q.id,
    };
  });

  return (
    <div id="questionPage">
      <Flex gap={24}>
        <Sider width={240} theme="light" style={{ padding: "24px 0" }}>
          <Title level={4} style={{ padding: "0 20px" }}>
            {bank.title}
          </Title>
          {/* @ts-ignore */}
          <Menu items={questionMenuItemList} selectedKeys={[question.id]} />
        </Sider>
        <Content>
          <QuestionMsgComponent question={question} />
        </Content>
      </Flex>
    </div>
  );
}
