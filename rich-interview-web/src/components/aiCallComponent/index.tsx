"use client";
import {Button, Card, Collapse, Input} from "antd";
import MarkdownViewer from "@/components/MarkdownComponent/MarkdownViewer";
import {useState} from "react";
import {queryAiUsingPost} from "@/api/aiClientController";
import {LoadingOutlined} from "@ant-design/icons";
import LoginConfirmModal from "@/components/LoginConfirmComponent";
import {useSelector} from "react-redux";
import {RootState} from "@/store";
import AccessEnumeration from "@/access/accessEnumeration";
import "../QuestionMsgComponent/index.css";
import InputContentEmptyComponent from "@/components/InputContentEmptyComponent";

/**
 * Ai问答通用组件
 * @param props
 * @constructor
 */
const AiCallComponent = () => {
    const loginUser = useSelector((state: RootState) => state.userLogin);
    // AI 调用相关状态
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResponse, setAiResponse] = useState<string>();
    const [thinkingSeconds, setThinkingSeconds] = useState(0);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [pendingAction, setPendingAction] = useState<() => void>(() => {
    });
    const [question, setQuestion] = useState("");
    // 折叠面板
    const {Panel} = Collapse;
    // 在组件状态中添加展开控制
    const [activeKey, setActiveKey] = useState<string | string[]>([]);
    // 处理输入框变化
    const handleQuestionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuestion(e.target.value);
    };
    // 跳转登录弹窗
    const [showLoginModal, setShowLoginModal] = useState(false);
    // 请先输入问题弹框
    const [showAlertModal, setShowAlertModal] = useState(false);

    // 调用AI接口
    const handleAskAI = async () => {

        if (loginUser.userRole === AccessEnumeration.NOT_LOGIN) {
            setShowLoginModal(true);
            return;
        }
        if (!question.trim()) {
            setShowAlertModal(true);
            return;
        }
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
                question: question,
            } as API.queryAIUsingPOSTParams);
            // 清除定时器
            clearInterval(timer);
            // ai响应
            setAiResponse(response.data as string);
        } finally {
            setAiLoading(false);
        }
    };

    return (
      <div className="question-card-ai">
        <Card
          className="ask-ai-card"
          title={<span className="card-title">AI助手解答</span>}
        >
          {/* 输入框 */}
          <Input
            placeholder="请输入您的问题，如：“HTTP 和 HTTPS 的区别是什么？”"
            value={question}
            onChange={handleQuestionChange}
            className="ask-ai-input"
            style={{ marginBottom: 16 }}
          />
          <Button
            type="primary"
            onClick={() => {
              handleAskAI();
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
              <LoadingOutlined
                spin
                style={{ fontSize: 32, color: "#4a90e2" }}
              />
              <div className="loading-text">
                <div className="premium-hint">
                  <div className="hint-content">
                    <span className="gradient-text">RICH</span>
                    <span className="animated-text">
                      &nbsp;&nbsp;&nbsp;马上为您一次性构建完整全面的帮助文档
                    </span>
                    <div className="shine"></div>
                  </div>
                </div>
                  <div style={{ fontSize : 18 }}>&nbsp;&nbsp;&nbsp;&nbsp; RICH 正在思考中（已耗时 {thinkingSeconds} 秒）...</div>
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
              <Collapse
                activeKey={activeKey}
                onChange={(key) => setActiveKey(key)}
                bordered={false}
                className="custom-collapse"
                items={[
                  {
                    key: "1",
                    label: "文档构建成功✅  点击查看",
                    extra: (
                      <div className="collapse-arrow">
                        {activeKey.length ? "收起" : "展开"}
                      </div>
                    ),
                    children: <MarkdownViewer value={aiResponse} />,
                  },
                ]}
              ></Collapse>
            </div>
          )}
        </Card>
        <LoginConfirmModal
          visible={showLoginModal}
          onConfirm={() => setShowLoginModal(false)}
          onCancel={() => setShowLoginModal(false)}
        />
          <InputContentEmptyComponent
              visible={showAlertModal}
              onConfirm={() => setShowAlertModal(false)}
              onCancel={() => setShowAlertModal(false)}
          />

      </div>
    );
};

export default AiCallComponent;
