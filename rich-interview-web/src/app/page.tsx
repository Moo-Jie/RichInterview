import { listQuestionBankVoByPageUsingPost } from "@/api/questionBankController";
import { listQuestionVoByPageUsingPost } from "@/api/questionController";
import Title from "antd/es/typography/Title";
import { Card, Divider, Flex, message, Space } from "antd";
import Link from "next/link";
import QuestionBankList from "../components/QuestionBankListVoComponent";
import QuestionList from "../components/QuestionListVoComponent";
import { RightOutlined } from "@ant-design/icons";
import "./page.module.css";

/**
 * 主页
 * @constructor
 */
// 添加TDK
export const metadata = {
  title: "主页",
  description: "RICH面试刷题平台的主页",
};

// 服务端渲染，禁用静态生成
export const dynamic = "force-dynamic";
export default async function HomePage() {
  // 并行获取题库和题目信息
  // 题库列表
  let questionBankListVo = [];
  try {
    const res = await listQuestionBankVoByPageUsingPost({
      // 仅展示12个题库
      pageSize: 12,
      sortField: "createTime",
      sortOrder: "descend",
      queryQuestionsFlag: true,

    });
    // @ts-ignore
    questionBankListVo = res.data.records ?? [];
  } catch (e: any) {
    message.error("无法获取题库信息，因为" + e.message);
  }

  // 题目列表
  let questionListVo = [];
  try {
    const res = await listQuestionVoByPageUsingPost({
      pageSize: 12,
      sortField: "createTime",
      sortOrder: "descend",
    });
    // @ts-ignore
    questionListVo = res.data.records ?? [];
  } catch (e: any) {
    message.error("无法获取题目信息，因为" + e.message);
  }

  return (
    <div id="homePage">
      {/*TODO 轮播图*/}

      {/*题库列表*/}
      <Card className="section-card">
        <Flex justify="space-between" align="center">
          <Title level={3} className="section-title">
            题目上新！
          </Title>
          <Link href={"/banks"} className="more-link">
            查看更多热门题库
            <RightOutlined />
          </Link>
        </Flex>
      </Card>
      <QuestionBankList questionBankList={questionBankListVo} />
      <Divider />
      {/*题目列表*/}
      <Card className="section-card">
        <Flex justify="space-between" align="center">
          <Title level={3} className="section-title">
            题库上新！
          </Title>
          <Link href={"/questions"} className="more-link">
            查看更多热门题目
            <RightOutlined />
          </Link>
        </Flex>
        <QuestionList questionList={questionListVo} />
      </Card>
    </div>
  );
}
