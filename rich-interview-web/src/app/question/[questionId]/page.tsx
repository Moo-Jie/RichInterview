"use client";
import {Alert, Spin} from "antd";
import {getQuestionVoByIdUsingGet,} from "@/api/questionController";
import QuestionMsgComponent from "../../../components/QuestionMsgComponent";
import {Content} from "antd/es/layout/layout";
import {useEffect, useState} from "react";
import "./index.css";

/**
 * 题目详情页
 * @constructor
 */
// @ts-ignore
export default function QuestionPage({params}) {
    const {questionId} = params;

    // 状态管理
    const [question, setQuestion] = useState<API.QuestionVO | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 数据获取逻辑
    useEffect(() => {
        // 防止重复请求
        if (!questionId) return;

        let isCancelled = false; // 防止组件卸载后设置状态

        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);

                // 获取题目详情
                const questionRes = await getQuestionVoByIdUsingGet({
                    id: questionId,
                });

                if (isCancelled) return; // 如果组件已卸载，停止执行

                if (!questionRes.data) {
                    throw new Error("获取题目详情失败");
                }

                // @ts-ignore
                setQuestion(questionRes.data);
            } catch (e: any) {
                if (!isCancelled) {
                    console.error("数据获取失败：", e.message);
                    setError(e.message || "未知错误");
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        // 清理函数
        return () => {
            isCancelled = true;
        };
    }, [questionId]); // 确保依赖项正确

    // 加载状态
    if (loading) {
        return (
            <div style={{textAlign: "center", padding: "50px"}}>
                <Spin size="large"/>
                <div style={{marginTop: 16}}>加载中...</div>
            </div>
        );
    }

    // 错误状态
    if (error) {
        return (
            <Alert
                type="error"
                message={`加载失败: ${error}`}
                style={{margin: 24}}
            />
        );
    }

    // 数据验证
    if (!question) {
        return (
            <Alert
                type="warning"
                message="数据加载异常，请刷新重试"
                style={{margin: 24}}
            />
        );
    }

    return (
        <div id="questionPage">
            <Content style={{padding: "24px"}}>
                <QuestionMsgComponent question={question}/>
            </Content>
        </div>
    );
}
