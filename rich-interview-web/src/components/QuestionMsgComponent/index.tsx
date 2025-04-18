"use client";
import { Card } from "antd";
import Title from "antd/es/typography/Title";
import TagList from "@/components/TagListComponent";
import MarkdownViewer from "@/components/MarkdownComponent/MarkdownViewer";
import "./index.css";
import useAddUserSignInRecordHook from "@/hooks/useAddUserSignInRecordHook";

interface Props {
  question: API.QuestionVO;
}

/**
 * 题目卡片
 * @param props
 * @constructor
 */
const QuestionMsgComponent = (props: Props) => {
  const { question } = props;
    // TODO 学习达半分钟以上
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
