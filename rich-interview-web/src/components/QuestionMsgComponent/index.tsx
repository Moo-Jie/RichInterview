"use client";
import { App, Button, Card, Modal } from "antd";
import Title from "antd/es/typography/Title";
import TagListComponent from "@/components/TagListComponent";
import MarkdownViewer from "@/components/MarkdownComponent/MarkdownViewer";
import useAddUserSignInRecordHook from "@/hooks/useAddUserSignInRecordHook";
import React, { useEffect, useState } from "react";
import { queryAiUsingPost } from "@/api/aiClientController";
import { CopyOutlined, LikeOutlined, LoadingOutlined } from "@ant-design/icons";
import useAddUserPreviousQuestionRecordHook from "@/hooks/useAddUserPreviousQuestionRecordHook";
import useQuestionViewNumIncrementFieldHook from "@/hooks/useQuestionViewNumIncrementFieldHook";
import { getQuestionHotspotVoByQuestionIdUsingGet } from "@/api/questionHotspotController";
import useQuestionStarNumIncrementFieldHook from "@/hooks/useQuestionStarNumIncrementFieldHook";
import { starCommentUsingPost } from "@/api/commentController";
import SpeechButton from "@/components/SpeechButtonComponent";
import {
  addCommentUsingPost,
  deleteCommentUsingPost,
  listCommentVoByPageUsingPost,
} from "@/api/commentController";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { ConstantBasicMsg } from "@/constant/ConstantBasicMsg";
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
  const { question } = props;
  // AI加载中的状态
  const [aiLoading, setAiLoading] = useState(false);
  // AI响应的状态
  const [aiResponse, setAiResponse] = useState<string>();
  // 思考时间的状态
  const [thinkingSeconds, setThinkingSeconds] = useState(0);
  // 是否显示答案的状态
  const [showAnswer, setShowAnswer] = useState(false);
  // 是否显示模态框，用于显示AI响应的状态
  const [isModalVisible, setIsModalVisible] = useState(false);
  // 是否正在进行操作，用于防止重复操作的状态
  const [pendingAction, setPendingAction] = useState<() => void>(() => {});
  // 点赞数量的状态
  const [starCount, setStarCount] = useState(0);
  // 浏览量的状态
  const [viewCount, setViewCount] = useState(0);
  // 是否点赞的状态
  const [hasLiked, setHasLiked] = useState(false);
  // 获取问题ID
  const questionId = question?.id;
  // 客户端组件消息组件
  const { message } = App.useApp();
  // 评论点赞数
  const [likedComments, setLikedComments] = useState<Set<number>>(new Set());
  // 点赞钩子
  const { incrementStar } = useQuestionStarNumIncrementFieldHook(questionId);
  // 评论相关状态
  const [comments, setComments] = useState<API.CommentVO[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [sortType, setSortType] = useState<"latest" | "hot">("latest");
  const [commentContent, setCommentContent] = useState("");
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(
    null,
  );
  // 评论删除确认框状态
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<number | null>(
    null,
  );

  // 在Redux状态中获取当前登录用户信息(在其他勾子之前，注意hooks的调用顺序)
  const loginUser = useSelector((state: RootState) => state.userLogin);
  // 添加点赞处理函数
  const handleCommentStar = async (commentId: number) => {
    try {
      const res = await starCommentUsingPost({ id: commentId });
      if (res != null) {
        setComments(
          comments.map((c) =>
            c.id === commentId
              ? {
                  ...c,
                  thumbNum: (c.thumbNum || 0) + 1,
                }
              : c,
          ),
        );
        setLikedComments(new Set([...likedComments, commentId]));
        message.success("点赞成功！");
      }
    } catch (e) {
      message.error("操作失败，请稍后重试");
    }
  };

  // 获取评论列表
  const fetchComments = async () => {
    setIsCommentLoading(true);
    try {
      const res = await listCommentVoByPageUsingPost({
        questionId: questionId,
        current: currentPage,
        pageSize: pageSize,
        sortField: sortType === "latest" ? "createTime" : "thumbNum", // 根据排序类型切换字段
        sortOrder: "desc",
      } as API.CommentQueryRequest);

      // @ts-ignore
      if (res.data?.records) {
        // @ts-ignore
        setComments(res.data.records);
      }
    } catch (e: any) {
      message.error(
        `获取评论失败: ${e?.response?.data?.message || e?.message || "未知错误"}`,
      );
    } finally {
      setIsCommentLoading(false);
    }
  };

  // 添加评论
  const handleAddComment = async () => {
    if (!commentContent.trim()) {
      message.warning("请输入评论内容");
      return;
    }

    try {
      setIsCommentLoading(true);
      const res = await addCommentUsingPost({
        content: commentContent.trim(),
        questionId: questionId,
      } as API.CommentAddRequest);

      if (res != null) {
        message.success("评论成功，期待成为热评哦~");
        setCommentContent("");
        // 发布后回到第一页
        setCurrentPage(1);
        // 刷新评论列表
        await fetchComments();
      } else {
        message.error("评论失败");
      }
    } catch (e: any) {
      message.error(
        `评论失败: ${e?.response?.data?.message || e?.message || "未知错误"}`,
      );
    } finally {
      // 重置加载状态
      setIsCommentLoading(false);
    }
  };

  // 删除评论
  const handleDeleteConfirm = async () => {
    if (!selectedCommentId) return;

    setDeletingCommentId(selectedCommentId);
    try {
      const res = await deleteCommentUsingPost({
        id: selectedCommentId,
      } as API.DeleteRequest);
      if (res != null) {
        message.success("删除评论成功");
        setComments(comments.filter((c) => c.id !== selectedCommentId));
      }
    } catch (e: any) {
      message.error(
        `删除失败: ${e?.response?.data?.message || e?.message || "未知错误"}`,
      );
    } finally {
      setDeletingCommentId(null);
      setDeleteConfirmVisible(false);
      setSelectedCommentId(null);
    }
  };

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
  useAddUserPreviousQuestionRecordHook(questionId);
  // 浏览量增加
  useQuestionViewNumIncrementFieldHook(questionId);

  // 获取热点数据
  useEffect(() => {
    const fetchHotspot = async () => {
      try {
        const res = await getQuestionHotspotVoByQuestionIdUsingGet({
          questionId: questionId,
        } as API.getQuestionHotspotVOByQuestionIdUsingGETParams);
        if (res.data) {
          // @ts-ignore
          setStarCount(res.data.starNum || 0);
          // @ts-ignore
          setViewCount(res.data.viewNum || 0);
        }
      } catch (e: any) {
        message.error(
          `获取热点数据失败: ${e?.response?.data?.message || e?.message || "未知错误"}`,
        );
      }
    };
    fetchHotspot();
  }, []);

  // 排序类型变化监听
  useEffect(() => {
    if (questionId) fetchComments();
  }, [currentPage, sortType]);

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
      label: "浏览量",
      value: viewCount,
    },
    {
      label: "点赞数",
      value: starCount,
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
                <br /> <br />
                <span className="meta-value">{item.value}</span>
              </div>
            ))}
          </div>
          {/* 点赞按钮 */}
          <Button
            icon={<LikeOutlined />}
            className={"star-button"}
            onClick={async () => {
              if (hasLiked) return;
              setHasLiked(true);
              const success = await incrementStar();
              if (success) {
                setStarCount((c) => c + 1);
                message.success("点赞成功！");
              } else {
                setHasLiked(false); // 失败时恢复状态
              }
            }}
            disabled={hasLiked}
          >
            点赞 ({starCount})
          </Button>
        </div>
      </Card>
      {/*题目描述*/}
      <Card
        className="content-card"
        title={<span className="card-title">题目描述</span>}
      >
        <MarkdownViewer value={question.content} />
      </Card>
      {/*AI解答*/}
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
            <div style={{ display: "flex", gap: 8 }}>
              <SpeechButton
                text={aiResponse || "未获取到文本内容，请检查网络"}
                className="copy-button"
              />
              <Button
                icon={<CopyOutlined />}
                onClick={() => {
                  try {
                    // 现代浏览器API（需要HTTPS）
                    // navigator 是  window 的全局属性，它包含了浏览器的一些信息和方法，包括剪贴板操作。
                    // clipboard 是 navigator 的一个属性，它包含了剪贴板相关的方法，例如 writeText() 用于写入文本到剪贴板。
                    // writeText() 是 clipboard 的一个方法，它用于将指定的文本写入剪贴板。
                    navigator.clipboard.writeText(aiResponse || "");
                    message.success("复制成功！");
                  } catch (err) {
                    try {
                      // 降级方案：传统复制方法（兼容HTTP）
                      // 创建隐藏的文本域作为临时复制载体
                      const textArea = document.createElement("textarea");
                      // 设置文本域的内容为要复制的文本
                      textArea.value = aiResponse || "";
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
                复制参考答案
              </Button>
            </div>
            <br />
            <br />
            <MarkdownViewer value={aiResponse} />
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
            <div style={{ display: "flex", gap: 8 }}>
              <SpeechButton
                text={question.answer || "未获取到文本内容，请检查网络"}
                className="copy-button"
              />
              <Button
                icon={<CopyOutlined />}
                onClick={() => {
                  try {
                    // 现代浏览器API（需要HTTPS）
                    // navigator 是  window 的全局属性，它包含了浏览器的一些信息和方法，包括剪贴板操作。
                    // clipboard 是 navigator 的一个属性，它包含了剪贴板相关的方法，例如 writeText() 用于写入文本到剪贴板。
                    // writeText() 是 clipboard 的一个方法，它用于将指定的文本写入剪贴板。
                    navigator.clipboard.writeText(question.answer || "");
                    message.success("复制成功！");
                  } catch (err) {
                    try {
                      // 降级方案：传统复制方法（兼容HTTP）
                      // 创建隐藏的文本域作为临时复制载体
                      const textArea = document.createElement("textarea");
                      // 设置文本域的内容为要复制的文本
                      textArea.value = question.answer || "";
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
                复制参考答案
              </Button>
            </div>
            <br />
            <br />
            <MarkdownViewer value={question.answer} />
          </div>
        )}
      </Card>
      {/* 评论区 */}
      <Card
        className="ask-ai-card"
        title={
          <div className="comment-header">
            <span>用户评论</span>
            <div className="comment-sort">
              <Button
                type={sortType === "latest" ? "primary" : "default"}
                onClick={() => setSortType("latest")}
                size="small"
              >
                最新
              </Button>
              <Button
                type={sortType === "hot" ? "primary" : "default"}
                onClick={() => setSortType("hot")}
                size="small"
                style={{ marginLeft: 8 }}
              >
                最热
              </Button>
            </div>
          </div>
        }
      >
        {/* 评论输入区域 */}
        <div>
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="写下你的见解（支持Markdown）"
            rows={3}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #d9d9d9",
              borderRadius: "8px",
              resize: "vertical",
              outline: "none",
              fontSize: "18px",
              fontFamily: "'Comic Sans MS', '楷体', cursive",
              backgroundColor: "#fff9fb",
              color: "#6d6d6d",
            }}
          />
          <Button
            type="primary"
            onClick={() => handleAddComment()}
            disabled={!commentContent.trim()}
            style={{ marginTop: "8px", float: "right" }}
            className="copy-button"
          >
            发布评论
          </Button>
          <div style={{ clear: "both" }} />
        </div>

        {/* 评论列表 */}
        {isCommentLoading ? (
          <div className="custom-loading" style={{ padding: 16 }}>
            <LoadingOutlined spin /> 加载评论中...
          </div>
        ) : comments.length === 0 ? (
          <div style={{ padding: 16, textAlign: "center" }}>
            暂无评论，快来发表你的看法吧~
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="comment-item">
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
                  {new Date(comment.createTime || 0).toLocaleString()}
                </span>
                {/* 点赞 */}
                <Button
                  type="text"
                  icon={<LikeOutlined />}
                  onClick={() => handleCommentStar(comment.id!)}
                  className="comment-like"
                  disabled={likedComments.has(comment.id!)}
                >
                  {comment.thumbNum || 0}
                </Button>
                {/* 删除 */}
                {comment.userId === loginUser?.id && (
                  <Button
                    type="text"
                    onClick={() => {
                      setSelectedCommentId(comment.id!);
                      setDeleteConfirmVisible(true);
                    }}
                    disabled={deletingCommentId === comment.id}
                    style={{ marginLeft: "auto" }}
                    className="comment-delete-btn"
                  >
                    {deletingCommentId === comment.id ? "删除中..." : "删除"}
                  </Button>
                )}
              </div>
              <div className="comment-content">
                <MarkdownViewer value={comment.content || "未获取"} />
              </div>
            </div>
          ))
        )}

        {/* 分页 */}
        {comments.length > 0 && (
          <div className="comment-pagination" style={{ marginTop: 16 }}>
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
      {/* 确认执行框 */}
      <Modal
        title="RICH 提示您"
        open={isModalVisible}
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
      <Modal
        title="确认删除"
        open={deleteConfirmVisible}
        onOk={handleDeleteConfirm}
        onCancel={() => {
          setDeleteConfirmVisible(false);
          setSelectedCommentId(null);
        }}
        okText="确定删除"
        cancelText="取消"
      >
        <p>确定要删您的条评论吗？</p>
      </Modal>
    </div>
  );
};

export default QuestionMsgComponent;
