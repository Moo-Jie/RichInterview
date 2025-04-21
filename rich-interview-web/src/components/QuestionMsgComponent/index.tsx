"use client";
import { Card } from "antd";
import Title from "antd/es/typography/Title";
import TagList from "@/components/TagListComponent";
import MarkdownViewer from "@/components/MarkdownComponent/MarkdownViewer";
import useAddUserSignInRecordHook from "@/hooks/useAddUserSignInRecordHook";
import { Button, Spin } from "antd";
import { useState } from "react";
import { queryAiUsingPost } from "@/api/aiClientController";
import "./index.css";
import { LoadingOutlined } from "@ant-design/icons";

interface Props {
  question: API.QuestionVO;
}

/**
 * 题目卡片
 * @param props
 * @constructor
 */
const QuestionMsgComponent = (props: Props) => {
  // AI 调用相关状态
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string>();
  const [thinkingSeconds, setThinkingSeconds] = useState(0);
  const { question } = props;

  // 调用AI接口
  const handleAskAI = async () => {
    try {
      // 模拟思考时间
      setThinkingSeconds(0);
      // 加载中
      setAiLoading(true);
      // 计时逻辑
      const timer = setInterval(() => {
        // [!++ 新增计时逻辑 ++]
        setThinkingSeconds((v) => v + 1);
      }, 1000);
      // 调用接口
      const response = await queryAiUsingPost({
        question: question.title,
      } as API.queryAIUsingPOSTParams);
      // 清除定时器
      clearInterval(timer);
      // ai响应
      setAiResponse(response.data as string);
    } finally {
      setAiLoading(false);
    }
  };

  // TODO 学习达半分钟以上才记为签到
  useAddUserSignInRecordHook();
  // 其他信息标签
  const metaItems = [
    {
      label: "创建时间",
      value: question.createTime
        ? new Date(question.createTime).toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "未设定",
    },
    {
      label: "最近维护时间",
      value: question.updateTime
        ? new Date(question.updateTime).toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "暂无维护",
    },
    // TODO 其他信息展示
  ];

  return (
    <div className="question-card">
      {/*题目基本信息*/}
      <Card className="question-header-card">
        <div className="header-content">
          <Title level={1} className="question-title">
            #{question.id} {question.title}
          </Title>
          <div className="meta-container">
            {metaItems.map((item, index) => (
              <div key={index} className="meta-item">
                <span className="meta-label">{item.label}:</span>
                <span className="meta-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <TagList tagList={question.tagList} />
      </Card>
      {/*题目描述*/}
      <Card
        className="content-card"
        title={<span className="card-title">题目描述</span>}
      >
        <MarkdownViewer value={question.content} />
      </Card>
      <Card
        className="ask-ai-card"
        title={<span className="card-title">AI解答</span>}
      >
        <Button
          type="primary"
          onClick={handleAskAI}
          className="ask-ai-button"
          disabled={aiLoading}
        >
          {aiLoading ? "全面构建文档中..." : "让 RICH 生成帮助全面的文档 ！"}
        </Button>
        {/* 预加载组件 */}
        {aiLoading && (
          <div className="custom-loading">
            <LoadingOutlined spin style={{ fontSize: 32, color: "#4a90e2" }} />
            <div className="loading-text">
              <div className="premium-hint">
                <div className="hint-content">
                  <span className="gradient-text">RICH</span>
                  <span className="animated-text">
                    马上为您一次性构建完整全面的帮助文档
                  </span>
                  <div className="shine"></div>
                </div>
              </div>
              <div>RICH 正在思考中（已耗时 {thinkingSeconds} 秒）...</div>
              {/* 20秒提示 */}
              {thinkingSeconds >= 20 && (
                <div className="long-time-hint">
                  ⏳ RICH正在努力构建，请您耐心等待！
                </div>
              )}
            </div>
          </div>
        )}
        {!aiLoading && aiResponse && (
          <div className="ai-response">
            <MarkdownViewer value={aiResponse} />
          </div>
        )}
      </Card>
      {/*题目答案*/}
      <Card
        className="answer-card"
        title={
          <span className="card-title">
            参考答案{" "}
            <span className="hint-text">
              （答案仅供学习,回答时应流畅、准确、加以自己的独到理解！）
            </span>
          </span>
        }
      >
        <MarkdownViewer value={question.answer} />
      </Card>
    </div>
  );
};

export default QuestionMsgComponent;
