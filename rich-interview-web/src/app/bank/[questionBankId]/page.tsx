"use server";
import {Alert, Avatar, Button, Card} from "antd";
import {getQuestionBankVoByIdUsingGet} from "@/api/questionBankController";
import Meta from "antd/es/card/Meta";
import Paragraph from "antd/es/typography/Paragraph";
import Title from "antd/es/typography/Title";
import QuestionList from "@/components/QuestionListVoComponent";
import "./index.css";

/**
 * 题库详情页
 * @constructor
 */
// @ts-ignore
export default async function BankPage({ params }) {
  // 从 url 中获取 questionBankId
  const { questionBankId } = params;
  let bank = undefined as any;

  try {
    const res = await getQuestionBankVoByIdUsingGet({
      // 拿到最多300道题目（SEO优化，伪全查询），指定查询关联的题目内容
      id: questionBankId,
      queryQuestionsFlag: true,
      pageSize: 300,
    });
    bank = res.data;
  } catch (e: any) {
    console.error("获取题库详情失败，" + e.message);
  }

  if (!bank) {
    // 源：https://ant.design/components/alert-cn
    return <Alert message="获取题目失败，请刷新重试！" type="warning" />;
  }

  // 获取第一道题目ID，用于 “开始刷题” 按钮的跳转操
  let firstQuestionId;
  if (bank.questionsPage?.records && bank.questionsPage.records.length > 0) {
    firstQuestionId = bank.questionsPage.records[0].id;
  }

  return (
    <div id="bankPage" className="bank-page-container">
      <Card className="bank-header-card">
        <Meta
          avatar={
            <Avatar src={bank.picture} size={96} className="bank-avatar" />
          }
          title={
            <div className="header-title">
              <Title level={2} className="bank-title">
                {bank.title}
              </Title>
              <div className="meta-stats">
                <span className="stat-item">
                  <span className="stat-label">题目总数</span>
                  <span className="stat-value">
                    {bank.questionsPage?.total || 0}
                  </span>
                </span>
                <span className="stat-item">
                  <span className="stat-label">创建时间</span>
                  <span className="stat-value">
                    {new Date(bank.createTime).toLocaleDateString("zh-CN")}
                  </span>
                </span>
              </div>
            </div>
          }
          description={
            <>
              <Paragraph className="bank-description">
                {bank.description}
              </Paragraph>
              <Button
                type="primary"
                shape="round"
                size="large"
                className="start-button"
                href={`/question/${firstQuestionId}`}
                disabled={!firstQuestionId}
              >
                🚀 开始刷题
              </Button>
            </>
          }
        />
      </Card>
      <div style={{ marginBottom: 16 }} />
      <QuestionList
        questionBankId={questionBankId}
        questionList={bank.questionsPage?.records ?? []}
        cardTitle={`系列题目清单（共${bank.questionsPage?.total || 0}条，尚在更新）`}
      />
    </div>
  );
}
