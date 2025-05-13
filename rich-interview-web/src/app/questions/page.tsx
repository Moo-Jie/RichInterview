import {searchQuestionVoByPageUsingPost} from "@/api/questionController";
import {Card, Flex, message} from "antd";
import Title from "antd/es/typography/Title";
import QuestionTablePage from "@/components/QuestionVoTableComponent/page";

// 添加TDK
export const metadata = {
  title: "题目列表",
  description: "RICH面试刷题平台的题目列表",
};

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
    const res = await searchQuestionVoByPageUsingPost({
      searchText,
      current: 1,
      pageSize: 10,
      sortField: "_score",
      sortOrder: "descend",
    });
    // @ts-ignore
    questionList = res.data.records ?? [];
    // @ts-ignore
    total = res.data.total ?? 0;
  } catch (e: any) {
    message.error("获取题目列表失败，" + e.message);
  }

  return (
    <Card className="section-card">
      <Flex justify="space-between" align="center">
        <div id="questionsPage" className="max-width-content">
          <Title level={3}>全部热门题目</Title>
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
      </Flex>
    </Card>
  );
}
