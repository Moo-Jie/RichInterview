import { listQuestionBankVoByPageUsingPost } from "@/api/questionBankController";
import Title from "antd/es/typography/Title";
import { Card, Divider, Flex, message } from "antd";
import QuestionBankList from "../../components/QuestionBankListVoComponent";
import "./page.module.css";

/**
 * 题库列表
 * @constructor
 */
// 服务端渲染，禁用静态生成
export const dynamic = "force-dynamic";
export default async function QuestionBankPage() {
  let questionBankListVo = [];
  try {
    const res = await listQuestionBankVoByPageUsingPost({
      // 优化SEO,故不设置分页
      pageSize: 1000,
      sortField: "createTime",
      sortOrder: "descend",
    });
    // @ts-ignore
    questionBankListVo = res.data.records ?? [];
  } catch (e: any) {
    message.error("无法获取题库信息，因为" + e.message);
  }

  return (
    <div id="questionBankPage">
      {/*题库列表*/}
      <Card className="section-card">
        <Flex justify="space-between" align="center">
          <Title level={3} className="section-title">
            全部热门题目
          </Title>
        </Flex>
      </Card>
      <QuestionBankList questionBankList={questionBankListVo} />
      <Divider />
    </div>
  );
}
