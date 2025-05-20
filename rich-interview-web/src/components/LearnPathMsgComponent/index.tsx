"use client";
import {Button, Card} from "antd";
import Title from "antd/es/typography/Title";
import TagList from "@/components/TagListComponent";
import MarkdownViewer from "@/components/MarkdownComponent/MarkdownViewer";
import useAddUserSignInRecordHook from "@/hooks/useAddUserSignInRecordHook";
import {CopyOutlined} from "@ant-design/icons";
import "./index.css";
import React from "react";

interface Props {
  learnPath: API.LearnPathVO;
}

/**
 * 学习路线卡片
 * @param props
 * @constructor
 */
const LearnPathMsgComponent = (props: Props) => {
  const { learnPath } = props;

  // TODO 学习达半分钟以上才记为签到
  useAddUserSignInRecordHook();
  // 其他信息标签
  const metaItems = [
    {
      label: "创建时间",
      value: learnPath.createTime
        ? new Date(learnPath.createTime).toLocaleDateString("zh-CN", {
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
      value: learnPath.updateTime
        ? new Date(learnPath.updateTime).toLocaleDateString("zh-CN", {
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
    <div className="learnPath-card">
      {/* 学习路线基本信息 */}
      <Card className="learnPath-header-card">
        <div className="header-content">
          <Title level={1} className="learnPath-title">
            # {learnPath.title}
          </Title>
          <div className="meta-container">
            {metaItems.map((item, index) => (
              <div key={index} className="meta-item">
                <span className="meta-label">{item.label}:</span>
                  <br/> <br/>
                <span className="meta-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        <TagList tagList={learnPath.tagList} />
        {/*学习路线描述*/}
        <Card
          className="content-card"
          title={<span className="card-title">介绍</span>}
        >
          <MarkdownViewer value={learnPath.content} />
        </Card>
      </Card>
      {/*学习路线展示*/}
      <Card
        className="ask-ai-card"
        title={
          <span className="card-title02">
            学习路线{" "}
            <span className="hint-text">（当下主流学习路线，仅供参考）</span>
          </span>
        }
      >
        {
          <div className="ai-response">
            <MarkdownViewer value={learnPath.answer} />
            <Button
              icon={<CopyOutlined />}
              onClick={() =>
                navigator.clipboard.writeText(learnPath.answer || "")
              }
              className="copy-button"
            >
              复制学习路线
            </Button>
          </div>
        }
      </Card>
    </div>
  );
};

export default LearnPathMsgComponent;
