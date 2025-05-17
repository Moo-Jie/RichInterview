"use client";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Button, Card, Flex, Spin, Tag, Typography } from "antd";
import Link from "next/link";
import { RightOutlined } from "@ant-design/icons";
import { getQuestionVoByIdUsingGet } from "@/api/questionController";

export default function RecentStudy() {
  const user = useSelector((state: RootState) => state.userLogin);
  const [questionData, setQuestionData] = useState<API.QuestionVO>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.previousQuestionID) {
      setLoading(true);
      getQuestionVoByIdUsingGet({ id: user.previousQuestionID })
        .then((res) => {
          // @ts-ignore
          if (res.code === 0) setQuestionData(res.data);
        })
        .finally(() => setLoading(false));
    }
  }, [user?.previousQuestionID]);

  return (
    <Card
      className="side-card"
      bodyStyle={{ padding: "12px 16px" }}
      style={{ marginBottom: 24 }}
    >
      <div className="side-card-header">
        <span className="card-title">🕒 继续上次的刷题</span>
      </div>

      <Spin spinning={loading}>
        <div className="recent-items">
          {user?.previousQuestionID ? (
            questionData ? (
              <Flex vertical gap={8}>
                <Link href={`/question/${questionData.id}`}>
                  <Button
                    type="link"
                    icon={<RightOutlined />}
                    style={{ padding: 0, textAlign: "left" }}
                  >
                    {questionData.title}
                  </Button>
                </Link>
                <div className="tags">
                  {questionData.tagList?.slice(0, 3).map((tag, index) => (
                    <Tag key={index} color="blue">
                      {tag}
                    </Tag>
                  ))}
                </div>
              </Flex>
            ) : (
              <Typography.Text type="secondary">题目加载失败</Typography.Text>
            )
          ) : (
            <Typography.Text type="secondary">
              {user?.id ? "暂无学习记录" : "登录后查看学习记录"}
            </Typography.Text>
          )}
        </div>
      </Spin>
    </Card>
  );
}
