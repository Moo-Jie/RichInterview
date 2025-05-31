import { Card, Flex, message } from "antd";
import Title from "antd/es/typography/Title";
import QuestionTablePage from "@/components/QuestionVoTableComponent/page";
import { searchQuestionVoByPageUsingPost } from "@/api/questionController";
import { listQuestionHotspotVoByPageUsingPost } from "@/api/questionHotspotController"; // 新增导入
import QuestionHotspotChartComponent from "@/components/hotspotchartsComponents/questionHotspotchartsComponents";
import "./page.module.css";
import RecentStudy from "@/components/RecentStudyComponent";
import DailyPracticeComponent from "@/components/DailyPracticeComponent";

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
  // 获取热点数据
  let questionHotspotList = [];
  try {
    const hotspotRes = await listQuestionHotspotVoByPageUsingPost({
      pageSize: 10,
      sortField: "viewNum",
      sortOrder: "descend",
    });
    // @ts-ignore
    questionHotspotList = hotspotRes.data?.records ?? [];
  } catch (e: any) {
    message.error("获取热点数据失败，" + e.message);
  }

  // 题目列表和总数
  let questionList = [];
  let total = 0;

  // 获取题目列表
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
    <Card className="section-card" style={{ paddingBottom: 60 }}>
      <Flex justify="space-between" align="center" gap={24}>
        <div
          id="questionsPage"
          className="max-width-content"
          style={{ flex: 1 }}
        >
          <Card className="section-card">
          <Title level={2}>热门TOP</Title>
          </Card>
          <QuestionHotspotChartComponent data={questionHotspotList} />
          <br />
          <Title level={2}>全部热门题目</Title>
          <Flex justify="space-between" align="center" gap={24}>
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
            {/* 右侧边栏 */}
            <div style={{ width: 350 }}>
              <RecentStudy />
              <DailyPracticeComponent questionList={questionList} />
            </div>
          </Flex>
        </div>
      </Flex>
    </Card>
  );
}
