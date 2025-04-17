import {listQuestionVoByPageUsingPost} from "@/api/questionController";
import {message} from "antd";
import Title from "antd/es/typography/Title";
import QuestionTablePage from "@/components/QuestionVoTableComponent/page";
import styles from "./page.module.css";

/**
 * 题目列表页面
 * @constructor
 */
// @ts-ignore
export default async function QuestionsPage({ searchParams }) {
    // searchParams可以获取到url中的参数
    const { q: searchText } = searchParams;
    // 题目列表和总数
    let questionList = [];
    let total = 0;

    try {
        const res = await listQuestionVoByPageUsingPost({
            searchText,
            pageSize: 12,
            sortField: "createTime",
            sortOrder: "descend",
        });
        // @ts-ignore
        questionList = res.data.records ?? [];
        // @ts-ignore
        total = res.data.total ?? 0;
    } catch (e : any) {
        message.error("获取题目列表失败，" + e.message);
    }

    return (
        <div id="questionsPage" className="max-width-content">
            <Title level={3}>题目大全</Title>
            <QuestionTablePage
                // 传入搜索数据
                // @ts-ignore
                defaultQuestionList={questionList}
                defaultTotal={total}
                // 从url中获取到的搜索参数
                defaultSearchParams={{
                    title: searchText,
                }}
            />
        </div>
    );
}
