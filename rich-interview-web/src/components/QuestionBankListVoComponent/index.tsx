"use client";
import { Avatar, Card, List, Typography } from "antd";
import Link from "next/link";
import "./index.css";

interface Props {
  questionBankList: API.QuestionBankVO[];
}

/**
 * 题库列表组件
 * @param props
 * @constructor
 */
const questionBankListVo = (props: Props) => {
  const { questionBankList = [] } = props;

  const questionBankView = (questionBank: API.QuestionBankVO) => {
    return (
      <Link href={`/bank/${questionBank.id}`}>
        <div className="bank-card">
          <Card
            cover={
              <img
                alt={questionBank.title}
                src={questionBank.picture || "/assets/pictures/logo.png"}
                className="bank-cover"
              />
            }
          >
            <Card.Meta
              avatar={<Avatar src={questionBank.user?.userAvatar} />}
              title={questionBank.title}
              description={
                <>
                  {/* 源：https://ant.design/components/typography-cn */}
                  <Typography.Paragraph type="secondary" ellipsis={{ rows: 3 }}>
                    {questionBank.description || "暂无描述"}
                  </Typography.Paragraph>
                  <div className="bank-stats">
                    {/*TODO 其他标签展示*/}
                    <span>
                      题目数: {questionBank.questionsPage?.total || 0}
                    </span>
                    <span>
                      创建者: {questionBank.user?.userName || "管理员"}
                    </span>
                  </div>
                </>
              }
            />
          </Card>
        </div>
      </Link>
    );
  };

  return (
    <div className="question-bank-list">
      <List
        grid={{
          gutter: 24, // 间距
          xs: 1, // <576px 1列
          sm: 2, // ≥576px 2列
          md: 2, // ≥768px 2列
          lg: 3, // ≥992px 3列
          xl: 4, // ≥1200px 4列
          xxl: 4, // ≥1600px 4列
        }}
        dataSource={questionBankList}
        renderItem={(item) => <List.Item>{questionBankView(item)}</List.Item>}
      />
    </div>
  );
};

export default questionBankListVo;
