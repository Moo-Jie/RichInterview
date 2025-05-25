"use client";
import { App, Button, Card } from "antd";
import useQuestionBankStarNumIncrementFieldHook from "@/hooks/useQuestionBankStarNumIncrementFieldHook";
import {
  EyeFilled,
  LikeFilled,
  LikeOutlined,
  PushpinFilled,
  QuestionCircleFilled,
} from "@ant-design/icons";
import { useEffect, useState } from "react";
import { getQuestionBankHotspotVoByQuestionBankIdUsingGet } from "@/api/questionBankHotspotController";
import Paragraph from "antd/es/typography/Paragraph";
import useQuestionBankViewNumIncrementFieldHook from "@/hooks/useQuestionBankViewNumIncrementFieldHook";
import "../../app/bank/[questionBankId]/index.css";

// 按钮参数
interface Props {
  questionBankId: number;
  firstQuestionId?: number;
}

export default function BankActionComponent(props: Props) {
  const { questionBankId, firstQuestionId } = props;
  const { message } = App.useApp();
  // 点赞数量
  const [starCount, setStarCount] = useState(0);
  // 浏览量
  const [viewCount, setViewCount] = useState(0);
  // 触发浏览量增加
  const { loading } = useQuestionBankViewNumIncrementFieldHook(questionBankId);
  // 是否已经点赞
  const [hasLiked, setHasLiked] = useState(false);

  // 点赞钩子
  const { incrementStar } =
    useQuestionBankStarNumIncrementFieldHook(questionBankId);

  // 客户端获取热点数据
  useEffect(() => {
    const fetchHotspot = async () => {
      try {
        const res = await getQuestionBankHotspotVoByQuestionBankIdUsingGet({
          questionBankId: questionBankId,
        });
        // @ts-ignore
        setStarCount(res.data?.starNum || 0);
        // @ts-ignore
        setViewCount(res.data?.viewNum || 0);
      } catch (e) {
        console.error("获取题库热点数据失败", e);
      }
    };
    fetchHotspot();
  }, [questionBankId]); // 检测 questionBankId 的变化

  return (
    <>
      <div className="meta-stats">
        <Card className={"stat-item"}>
          <span className="stat-label">
            浏览量 &nbsp;&nbsp;
            <EyeFilled style={{color : "#e8aaff"}} />
          </span>
          <span className="stat-value">{viewCount}</span>
          <br />
          <span className="stat-label">
            点赞量 &nbsp;&nbsp;
            <LikeFilled style={{color : "#8b6cf0"}} />
          </span>
          <span className="stat-value">{starCount}</span>
        </Card>
      </div>
      {/* 操作按钮组 */}
      <div className="action-buttons">
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

        <Button
          icon={<LikeOutlined />}
          type="primary"
          shape="round"
          size="large"
          className="start-button"
          onClick={async () => {
            if (hasLiked) return;
            const success = await incrementStar();
            if (success) {
              setStarCount((c) => c + 1);
              message.success("点赞成功！");
              setHasLiked(true);
            }
          }}
          disabled={hasLiked}
        >
          点赞 ({starCount})
        </Button>
      </div>
    </>
  );
}
