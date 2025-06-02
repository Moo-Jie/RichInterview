"use client";
import { App, Button, Card } from "antd";
import Title from "antd/es/typography/Title";
import TagList from "@/components/TagListComponent";
import MarkdownViewer from "@/components/MarkdownComponent/MarkdownViewer";
import useAddUserSignInRecordHook from "@/hooks/useAddUserSignInRecordHook";
import { CopyOutlined } from "@ant-design/icons";
import "./index.css";
import React from "react";
import SpeechButton from "@/components/SpeechButtonComponent";

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

  const { message } = App.useApp();

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
      <Card variant="borderless">
        <div className="header-content">
          <Title level={1} className="learnPath-title">
            # {learnPath.title}
          </Title>
          <div className="meta-container">
            {metaItems.map((item, index) => (
              <div key={index} className="meta-item">
                <span className="meta-label">{item.label}:</span>
                <br /> <br />
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
        variant="borderless"
        title={
          <span className="card-title02">
            学习路线{" "}
            <span className="hint-text">（当下主流学习路线，仅供参考）</span>
          </span>
        }
      >
        {
          <div className="ai-response">
            <SpeechButton
              text={learnPath.answer || "未获取到文本内容，请检查网络"}
              className="copy-button"
            />
            &nbsp;
            <Button
              icon={<CopyOutlined />}
              onClick={() => {
                try {
                  // 现代浏览器API（需要HTTPS）
                  // navigator 是  window 的全局属性，它包含了浏览器的一些信息和方法，包括剪贴板操作。
                  // clipboard 是 navigator 的一个属性，它包含了剪贴板相关的方法，例如 writeText() 用于写入文本到剪贴板。
                  // writeText() 是 clipboard 的一个方法，它用于将指定的文本写入剪贴板。
                  navigator.clipboard.writeText(learnPath.answer || "");
                  message.success("复制成功！");
                } catch (err) {
                  try {
                    // 降级方案：传统复制方法（兼容HTTP）
                    // 创建隐藏的文本域作为临时复制载体
                    const textArea = document.createElement("textarea");
                    // 设置文本域的内容为要复制的文本
                    textArea.value = learnPath.answer || "";
                    // 将文本域添加到文档中，准备复制
                    document.body.appendChild(textArea);
                    // 选择文本域中的内容
                    textArea.select();
                    // 执行复制操作
                    document.execCommand("copy");
                    // 移除文本域，防止内存泄漏
                    document.body.removeChild(textArea);
                    message.success("复制成功！");
                  } catch (error) {
                    message.error("自动复制失败，请手动选择文本复制");
                  }
                }
              }}
              className="copy-button"
            >
              复制学习路线
            </Button>
            <br />
            <br />
            <MarkdownViewer value={learnPath.answer} />
          </div>
        }
      </Card>
    </div>
  );
};

export default LearnPathMsgComponent;
