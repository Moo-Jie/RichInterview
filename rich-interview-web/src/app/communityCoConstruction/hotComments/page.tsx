"use client";
import {App, Button, Card} from "antd";
import React, {useEffect, useState} from "react";
import {listCommentVoByPageUsingPost, starCommentUsingPost} from "@/api/commentController";
import {useSelector} from "react-redux";
import {RootState} from "@/store";
import {ConstantBasicMsg} from "@/constant/ConstantBasicMsg";
import MarkdownViewer from "@/components/MarkdownComponent/MarkdownViewer";
import Link from "next/link";
import {LikeOutlined} from "@ant-design/icons";
import "../../../components/QuestionMsgComponent/index.css";

export default function HotCommentsPage() {
  const [comments, setComments] = useState<API.CommentVO[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortType, setSortType] = useState<"latest" | "hot">("hot");
  const [isLoading, setIsLoading] = useState(false);
  const { message } = App.useApp();
  const loginUser = useSelector((state: RootState) => state.userLogin);
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());
  const handleCommentStar = async (commentId: number) => {
    try {
      const res = await starCommentUsingPost({ id: commentId });
      if (res != null) {
        setComments(comments.map(c =>
            c.id === commentId ? { ...c, thumbNum: (c.thumbNum || 0) + 1 } : c
        ));
        setLikedComments(new Set([...likedComments, commentId]));
        message.success("点赞成功！");
      }
    } catch (e) {
      message.error("操作失败，请稍后重试");
    }
  };
  // 获取热评列表
  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await listCommentVoByPageUsingPost({
        current: currentPage,
        pageSize: pageSize,
        sortField: sortType === "latest" ? "createTime" : "thumbNum",
        sortOrder: "desc",
      } as API.CommentQueryRequest);
      // @ts-ignore
      if (res.data?.records) {
        // @ts-ignore
        setComments(res.data.records);
        // 初始化点赞状态
        // @ts-ignore
        const liked = new Set(
          // @ts-ignore
          res.data.records
            // @ts-ignore
            .filter((c) => c.hasThumb)
            // @ts-ignore
            .map((c) => c.id!),
        );
        // @ts-ignore
        setLikedComments(liked);
      }
    } catch (e: any) {
      message.error(`获取失败: ${e?.response?.data?.message || "未知错误"}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [currentPage, sortType]);

  return (
    <div
      className="question-card"
      style={{ maxWidth: 1200, margin: "0 auto", width: "100%" }}
    >
      <Card
        className="ask-ai-card"
        title={
          <div className="comment-header">
            <span style={{ fontSize: 28, color: "#666", marginLeft: 8 }}>
              刷友热评
              <span style={{ fontSize: 18, color: "#666", marginLeft: 8 }}>
                —— 共建良好交流氛围
              </span>
            </span>
            <div className="comment-sort">
              <span style={{ fontSize: 15, color: "#666", marginLeft: 8 }}>
                (点击回答跳转到题目)
              </span>
              <Button
                type={sortType === "hot" ? "primary" : "default"}
                onClick={() => setSortType("hot")}
                size="small"
              >
                最热
              </Button>
              <Button
                type={sortType === "latest" ? "primary" : "default"}
                onClick={() => setSortType("latest")}
                size="small"
                style={{ marginLeft: 8 }}
              >
                最新
              </Button>
            </div>
          </div>
        }
      >
        {/* 回答列表 */}
        {isLoading ? (
          <div className="custom-loading" style={{ padding: 16 }}>
            <span className="loading-text">加载回答中...</span>
          </div>
        ) : comments.length === 0 ? (
          <div style={{ padding: 16, textAlign: "center" }}>
            暂无热评，快来参与讨论吧~
          </div>
        ) : (
          comments.map((comment) => (
            <Link
              key={comment.id}
              href={`/question/${comment.questionId}`}
              className="comment-item-link"
            >
              <div className="comment-item">
                {/* 用户信息 */}
                <div className="user-info">
                  <img
                    src={
                      comment.user?.userAvatar || ConstantBasicMsg.AUTHOR_AVATAR
                    }
                    alt="用户头像"
                    className="avatar"
                  />
                  <span className="username">
                    {comment.user?.userName || "匿名用户"}
                  </span>
                  <span className="time">
                    {new Date(comment.createTime!).toLocaleString()}
                  </span>
                  <Button
                    type="text"
                    icon={<LikeOutlined />}
                    onClick={(e) => {
                      e.preventDefault();
                      handleCommentStar(comment.id!);
                    }}
                    className="comment-like"
                    disabled={likedComments.has(comment.id!)}
                  >
                    {comment.thumbNum || 0}
                  </Button>
                </div>
                {/* 回答内容 */}
                <div className="comment-content">
                  <MarkdownViewer value={comment.content || "未获取"} />
                </div>
              </div>
            </Link>
          ))
        )}

        {/* 分页 */}
        {comments.length > 0 && (
          <div
            className="comment-pagination"
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="copy-button"
              disabled={currentPage === 1}
            >
              上一页
            </Button>
            <span style={{ margin: "0 16px" }}>第 {currentPage} 页</span>
            <Button
              onClick={() => setCurrentPage((p) => p + 1)}
              className="copy-button"
              disabled={comments.length < pageSize}
            >
              下一页
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
