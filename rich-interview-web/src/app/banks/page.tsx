import {listQuestionBankVoByPageUsingPost} from "@/api/questionBankController";
import Title from "antd/es/typography/Title";
import {Card, Divider, Flex, message} from "antd";
import QuestionBankList from "../../components/QuestionBankListVoComponent";
import HotspotChartComponent from "@/components/hotspotchartsComponents/questionBankHotspotchartsComponents";
import {listQuestionBankHotspotVoByPageUsingPost} from "@/api/questionBankHotspotController";
import "./page.module.css";

/**
 * 题库列表
 * @constructor
 */
// 服务端渲染，禁用静态生成
export const dynamic = "force-dynamic";
export default async function QuestionBankPage() {
  let questionBankListVo = [];
  try {
    const res = await listQuestionBankVoByPageUsingPost({
      // 优化SEO,故不设置分页
      pageSize: 1000,
      sortField: "createTime",
      sortOrder: "descend",
    });
    // @ts-ignore
    questionBankListVo = res.data.records ?? [];
  } catch (e: any) {
    message.error("无法获取题库信息");
  }

  // 热点题库列表
  let questionBankHotspotListVo = [];
  try {
    const res = await listQuestionBankHotspotVoByPageUsingPost({
      // 获取前10个热门题库
      pageSize: 10,
      // 根据浏览量排序
      sortField: "viewNum",
      sortOrder: "descend",
    });
    // @ts-ignore
    questionBankHotspotListVo = res.data.records ?? [];
  } catch (e: any) {
    message.error("无法获取热门题库信息，因为" + e.message);
  }

  return (
      <div id="questionBankPage" className="page" style={{ paddingBottom: 60 }}>
        {/* 热门题库图表 */}
        <Card className="section-card">
          <Flex justify="space-between" align="center">
            <Title level={2} className="section-title">
              热门TOP
            </Title>
          </Flex>
        </Card>
        <HotspotChartComponent data={questionBankHotspotListVo}/>
        <br/><br/>
        {/*题库列表*/}
        <Card className="section-card">
          <Flex justify="space-between" align="center">
            <Title level={3} className="section-title">
              全部热门题库
            </Title>
          </Flex>
        </Card>
        <QuestionBankList questionBankList={questionBankListVo}/>
        <Divider/>
      </div>
  );
}
