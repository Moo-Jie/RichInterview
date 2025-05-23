"use client";
import {Button, Card, Modal} from "antd";
import Title from "antd/es/typography/Title";
import TagListComponent from "@/components/TagListComponent";
import MarkdownViewer from "@/components/MarkdownComponent/MarkdownViewer";
import useAddUserSignInRecordHook from "@/hooks/useAddUserSignInRecordHook";
import React, {useState} from "react";
import {queryAiUsingPost} from "@/api/aiClientController";
import {CopyOutlined, LoadingOutlined} from "@ant-design/icons";
import useAddUserPreviousQuestionRecordHook from "@/hooks/useAddUserPreviousQuestionRecordHook";
import "./index.css";

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
  const [showAnswer, setShowAnswer] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});

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
        // 新增计时逻辑
        setThinkingSeconds((v) => v + 1);
      }, 1000);
      // 调用接口
      const response = await queryAiUsingPost({
        question: question.content,
      } as API.queryAIUsingPOSTParams);
      // 清除定时器
      clearInterval(timer);
      // ai响应
      setAiResponse(response.data as string);
    } finally {
      setAiLoading(false);
    }
  };

  // 钩子在客户端阶段时，请求执行签到操作
  // 用户签到记录钩子
  useAddUserSignInRecordHook();
  // 刷题记录钩子
  useAddUserPreviousQuestionRecordHook(question?.id);

  // 其他信息标签
  const metaItems = [
    {
      label: "题目编号",
      value: question.id,
    },
    {
      label: "题目难度",
      value: question.tagList?.[0] || "暂无",
    },
    {
      label: "题目标签",
      value: <TagListComponent tagList={question.tagList?.slice(1) || []} />,
    },
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
            # {question.title}
          </Title>
          <div className="meta-container">
            {metaItems.map((item, index) => (
              <div key={index} className="meta-item">
                <span className="meta-label">{item.label}</span>
                  <br/> <br/>
                <span className="meta-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
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
          onClick={() => {
            setPendingAction(() => handleAskAI);
            setIsModalVisible(true);
          }}
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
            <Button
              icon={<CopyOutlined />}
              onClick={() =>
                navigator.clipboard.writeText(aiResponse || "")
              }
              className="copy-button"
            >
              复制 AI 文档
            </Button>
          </div>
        )}
      </Card>
      {/*题目答案*/}
      <Card
        className="ask-ai-card"
        title={
          <span className="card-title02">
            参考答案{" "}
            <span className="hint-text">
              （答案仅供学习，回答时应流畅、准确、加以自己的独到理解！）
            </span>
          </span>
        }
      >
        <Button
          type="primary"
          onClick={() => {
            setPendingAction(() => () => setShowAnswer(true));
            setIsModalVisible(true);
          }}
          className="ask-ai-button"
          style={{ marginBottom: showAnswer ? 16 : 0 }}
        >
          {showAnswer ? "答案已解锁,已计入刷题记录 ✅" : "点击查看参考答案"}
        </Button>

        {showAnswer && (
          <div className="ai-response">
            <MarkdownViewer value={question.answer} />
            <Button
              icon={<CopyOutlined />}
              onClick={() =>
                navigator.clipboard.writeText(question.answer || "")
              }
              className="copy-button"
            >
              复制参考答案
            </Button>
          </div>
        )}
      </Card>
      {/* 确认执行框 */}
      <Modal
        title="RICH 提示您"
        visible={isModalVisible}
        onOk={() => {
          pendingAction();
          setIsModalVisible(false);
        }}
        onCancel={() => setIsModalVisible(false)}
        okText="确定"
        cancelText="那我再想想"
        closable={false}
        centered
      >
        <div style={{ padding: "16px 0", fontSize: 16 }}>
          💡 先尝试独立回答，再查看题解或问AI哦！
        </div>
      </Modal>
    </div>
  );
};

export default QuestionMsgComponent;
