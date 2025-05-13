"use server";
import {Alert, Button, Flex, Menu, message, Space} from "antd";
import {getQuestionBankId, getQuestionVoByIdUsingGet,} from "@/api/questionController";
import QuestionMsgComponent from "../../../components/QuestionMsgComponent";

import Link from "next/link";
import {getQuestionBankVoByIdUsingGet} from "@/api/questionBankController";
import Sider from "antd/es/layout/Sider";
import Title from "antd/es/typography/Title";
import {Content} from "antd/es/layout/layout";
import {LeftOutlined, RightOutlined} from "@ant-design/icons";
import "./index.css";

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

  // 获取题库ID
  let bank = undefined;
  let questionBankId = undefined;
  // 通过 getQuestionBankId() 请求得到题库id
  try {
    // @ts-ignore
    const res = await getQuestionBankId(question.id);
    questionBankId = res.data;
  } catch (e: any) {
    console.error("获取题库id失败，" + e.message);
    return (
      <Alert
        type="error"
        message={`题库加载失败: ${e.message || "未知错误"}`}
        style={{ margin: 24 }}
      />
    );
  }

  // 获取题库列表
  try {
    const res = await getQuestionBankVoByIdUsingGet({
      id: questionBankId,
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

  // 断言
  bank = bank as API.QuestionBankVO;
  // 题目菜单列表
  const questionMenuItemList = (bank.questionsPage?.records || []).map((q) => {
    return {
      label: <Link href={`/question/${q.id}`}>{q.title}</Link>,
      key: q.id,
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
          {/* @ts-ignore */}
          <Menu items={questionMenuItemList} selectedKeys={[question.id]} />
        </Sider>
        <Content>
          <Space style={{ marginBottom: 24 }}>
             {/*若为第一题和最后一题，上一题和下一题为null*/}
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
