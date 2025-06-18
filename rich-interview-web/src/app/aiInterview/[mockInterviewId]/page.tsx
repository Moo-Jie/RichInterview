"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { App, Button, Input, Spin } from "antd";
import {
  doChatEventUsingPost,
  getMockInterviewByIdUsingGet,
} from "@/api/mockInterviewController";
import "./index.css";
import dayjs from "dayjs";
import { AuditOutlined, UserOutlined } from "@ant-design/icons";

// 消息类型定义
interface ChatMessage {
  sender: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
}

// 后端原始消息格式
interface RawMessage {
  role: string;
  message: string;
  timestamp?: string;
}

// 消息缓存类型
interface MessageCache {
  lastMessages: ChatMessage[];
  lastUpdate: number;
}

export default function InterviewPage() {
  const params = useParams();
  const mockInterviewId = params.mockInterviewId as string;
  const { message: antdMessage } = App.useApp();
  const router = useRouter();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const messageCache = useRef<MessageCache>({
    lastMessages: [],
    lastUpdate: 0,
  });

  const [interviewData, setInterviewData] = useState<API.MockInterview>();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // 状态映射
  const statusMap = {
    0: {
      text: "待开始",
      color: "blue",
      className: "status-tag status-tag-blue",
    },
    1: {
      text: "进行中",
      color: "orange",
      className: "status-tag status-tag-orange",
    },
    2: {
      text: "已结束",
      color: "green",
      className: "status-tag status-tag-green",
    },
  };

  // 获取面试数据（关键修正）
  const fetchInterviewData = useCallback(async () => {
    if (!mockInterviewId) return;
    try {
      setLoading(true);
      const res = await getMockInterviewByIdUsingGet({
        id: mockInterviewId as string,
      });

      if (res.data) {
        setInterviewData(res.data as API.MockInterview);

        // 解析消息历史
        // @ts-ignore
        if (res.data.messages) {
          // @ts-ignore
          const rawData = res.data.messages;
          let parsedMessages: ChatMessage[] = [];

          try {
            // 处理双重JSON序列化
            const jsonString =
              typeof rawData === "string"
                ? rawData.replace(/^"|"$/g, "") // 去除首尾双引号
                : JSON.stringify(rawData);

            // 安全解析JSON
            const messagesArray: RawMessage[] = JSON.parse(jsonString);

            // 转换消息格式
            parsedMessages = messagesArray.map((msg) => ({
              sender: msg.role as "user" | "assistant" | "system",
              content: msg.message,
              // 使用消息自带时间戳或生成新时间戳
              timestamp: msg.timestamp || new Date().toISOString(),
            }));

            // 缓存机制：仅当消息有变化时更新
            const cache = messageCache.current;
            const newMessagesStr = JSON.stringify(parsedMessages);
            const cachedMessagesStr = JSON.stringify(cache.lastMessages);

            if (newMessagesStr !== cachedMessagesStr) {
              setChatMessages(parsedMessages);
              cache.lastMessages = parsedMessages;
              cache.lastUpdate = Date.now();
            }
          } catch (e) {
            console.error("JSON解析错误:", e);
            antdMessage.error("消息解析失败，请检查数据格式");
          }
        }
      }
    } catch (error: any) {
      antdMessage.error(`获取面试数据失败: ${error.message || "未知错误"}`);
    } finally {
      setLoading(false);
    }
  }, [mockInterviewId, antdMessage]);

  // 处理聊天事件（优化：局部更新消息）
  const handleChatEvent = useCallback(
    async (eventType: "start" | "chat" | "end", message?: string) => {
      try {
        setSending(true);
        const res = await doChatEventUsingPost({
          event: eventType,
          id: interviewData?.id,
          message,
        });

        // 优化：仅当消息类型为chat时局部更新
        //  @ts-ignore
        if (eventType === "chat" && res.data?.messages) {
          try {
            //  @ts-ignore
            const rawData = res.data.messages;
            const jsonString =
              typeof rawData === "string"
                ? rawData.replace(/^"|"$/g, "")
                : JSON.stringify(rawData);
            const messagesArray: RawMessage[] = JSON.parse(jsonString);

            // 只添加最新的AI回复
            const latestAIMessage = messagesArray
              .filter((msg) => msg.role === "assistant")
              .pop();

            if (latestAIMessage) {
              setChatMessages((prev) => [
                ...prev,
                {
                  sender: "assistant",
                  content: latestAIMessage.message,
                  timestamp:
                    latestAIMessage.timestamp || new Date().toISOString(),
                },
              ]);
            }
          } catch (e) {
            console.error("解析新消息失败:", e);
            // 降级方案：刷新整个数据
            await fetchInterviewData();
          }
        } else {
          // 刷新数据（仅当非聊天事件时）
          await fetchInterviewData();
        }

        if (eventType === "end") {
          antdMessage.success("面试已提前结束");
        }
      } catch (error) {
        antdMessage.error("操作失败");
      } finally {
        setSending(false);
      }
    },
    [interviewData?.id, fetchInterviewData, antdMessage],
  );

  // 发送消息（优化：立即显示用户消息）
  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim()) return;

    // 添加用户消息到本地状态（立即显示）
    const userMessage: ChatMessage = {
      sender: "user",
      content: newMessage,
      timestamp: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, userMessage]);
    setNewMessage("");

    // 发送到服务器
    handleChatEvent("chat", newMessage);
  }, [newMessage, handleChatEvent]);

  // 防抖滚动函数
  const scrollToBottom = useCallback(() => {
    if (chatContainerRef.current) {
      // 使用CSS transform实现平滑滚动
      chatContainerRef.current.style.transform = "translateY(0)";
      chatContainerRef.current.style.transition = "transform 0.3s ease";

      // 直接设置scrollTop会触发重排，改用scrollTo
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTo({
            top: chatContainerRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 50);
    }
  }, []);

  // 初始化加载数据
  useEffect(() => {
    fetchInterviewData();
  }, [mockInterviewId, fetchInterviewData]);

  // 当有新消息时自动滚动到底部（优化：使用防抖）
  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [chatMessages, scrollToBottom]);

  if (loading) {
    return (
      <div className="loading-state">
        <Spin size="large" className="loading-spinner" />
      </div>
    );
  }

  if (!interviewData) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl">未找到面试记录</h2>
        <Button
          type="primary"
          className="mt-4"
          onClick={() => router.push("/aiInterview")}
        >
          返回列表
        </Button>
      </div>
    );
  }

  // 过滤系统消息
  const filteredMessages = chatMessages.filter(
    (msg) => msg.sender !== "system",
  );

  return (
    <div className="id-ai-interview-page">
      {/* 面试信息头部 - 玻璃态设计 */}
      <div className="id-header-section">
        <div className="flex justify-between items-center flex-wrap">
          <div>
            <h1>
              <AuditOutlined />
              {interviewData.jobPosition} 模拟面试
            </h1>
            <br />
            <div className="flex items-center mt-4">
              {/* @ts-ignore */}
              <span className={statusMap[interviewData.status!].className}>
                {/* @ts-ignore */}
                {statusMap[interviewData.status!].text}
              </span>
              &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
              {/* @ts-ignore */}
              <span className={statusMap[interviewData.status!].className}>
                难度: {interviewData.difficulty}
              </span>
              &nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
              {/* @ts-ignore */}
              <span className={statusMap[interviewData.status!].className}>
                创建时间: {new Date(interviewData.createTime!).toLocaleString()}
              </span>
            </div>
          </div>
          <br />

          <div className="mt-4 md:mt-0">
            {interviewData.status === 0 && (
              <Button
                type="primary"
                size="large"
                onClick={() => handleChatEvent("start")}
                loading={sending}
                className="id-copy-button"
                style={{ fontSize: 20 }}
              >
                开始面试
              </Button>
            )}

            {interviewData.status === 1 && (
              <Button
                danger
                size="large"
                onClick={() => handleChatEvent("end")}
                loading={sending}
                className="id-copy-button"
                style={{ fontSize: 20 }}
              >
                提前结束面试
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 聊天记录区域 - 现代化气泡设计 */}
      <div className="chat-container">
        <div className="chat-header">
          <h2>AI模拟面试对话</h2>
          <div className="connection-status">
            <div className="status-indicator connected"></div>
            <span>已连接</span>
          </div>
        </div>

        <div id="chat-history" className="chat-history" ref={chatContainerRef}>
          {filteredMessages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">💬</div>
              <h2>
                {interviewData.status === 0
                  ? "面试尚未开始，请点击上方按钮开始面试"
                  : interviewData.status === 1
                    ? "请输入第一条消息开始对话"
                    : "本次面试已结束"}
              </h2>
              <h4>准备好接受专业的技术面试挑战了吗？</h4>
            </div>
          ) : (
            filteredMessages.map((msg, index) => (
              <div
                key={index}
                className={`message-container ${
                  msg.sender === "user" ? "user-message" : "ai-message"
                }`}
              >
                <div className="message-bubble">
                  <div className="message-sender">
                    {msg.sender === "user" ? (
                      <>
                        <UserOutlined /> 您
                      </>
                    ) : (
                      <>
                        <AuditOutlined /> AI面试官
                      </>
                    )}
                  </div>
                  <div className="message-content">{msg.content}</div>
                  <div className="message-time">
                    {dayjs(msg.timestamp).isValid()
                      ? dayjs(msg.timestamp).format("HH:mm")
                      : "刚刚"}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 消息输入区域 - 玻璃态设计 */}
      <div
        className={`input-area ${interviewData.status !== 1 ? "input-disabled" : ""}`}
      >
        <Input.TextArea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={
            interviewData.status === 0
              ? "面试尚未开始，请先开始面试"
              : interviewData.status === 2
                ? "本次面试已结束"
                : "请输入您的回答..."
          }
          autoSize={{ minRows: 3, maxRows: 6 }}
          disabled={interviewData.status !== 1 || sending}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          className="message-input"
          allowClear
          maxLength={500}
          showCount={{
            formatter: (info: { count: number; maxLength?: number }) =>
              `${interviewData.status === 1 ? `${info.count}/${info.maxLength}` : ""}`,
          }}
          styles={{
            textarea: {
              transition: "all 0.3s",
              scrollbarWidth: "thin",
            },
            count: {
              color: "#ffffff",
              background: "transparent",
            },
          }}
        />
        <br />
        <br />
        <br />
        <div className="input-footer">
          <span className="send-hint">
            {interviewData.status === 1
              ? "按Enter发送，Shift+Enter换行"
              : "当前状态无法发送消息"}
          </span>

          <Button
            type="primary"
            onClick={handleSendMessage}
            disabled={
              !newMessage.trim() || interviewData.status !== 1 || sending
            }
            loading={sending}
            className="send-button"
          >
            发送
          </Button>
        </div>
      </div>
    </div>
  );
}
