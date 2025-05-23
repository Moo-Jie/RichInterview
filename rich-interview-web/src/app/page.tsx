import {listQuestionBankVoByPageUsingPost} from "@/api/questionBankController";
import {listQuestionVoByPageUsingPost} from "@/api/questionController";
import Title from "antd/es/typography/Title";
import {Card, Flex, message} from "antd";
import Link from "next/link";
import QuestionBankListVoComponent from "../components/QuestionBankListVoComponent";
import {BulbOutlined, RightOutlined} from "@ant-design/icons";
import Sider from "antd/es/layout/Sider";
import QuestionListVo from "@/components/QuestionListVoComponent";
import AiCallComponent from "@/components/aiCallComponent";
import { listQuestionHotspotVoByPageUsingPost } from "@/api/questionHotspotController";
import RecentStudy from "@/components/RecentStudyComponent";
import styles from "./page.module.css";

/**
 * 主页
 * @constructor
 */
// 添加TDK
export const metadata = {
  title: "主页",
  description: "RICH面试刷题平台的主页",
};

// 服务端渲染，禁用静态生成
export const dynamic = "force-dynamic";
export default async function HomePage() {
  // 并行获取题库和题目信息
  // 题库列表
  let questionBankListVo = [];
  try {
    const res = await listQuestionBankVoByPageUsingPost({
      // 仅展示12个题库
      pageSize: 12,
      sortField: "createTime",
      sortOrder: "descend",
      queryQuestionsFlag: true,
    });
    // @ts-ignore
    questionBankListVo = res.data.records ?? [];
  } catch (e: any) {
    message.error("无法获取题库信息，因为" + e.message);
  }

  // 题目列表
  let questionListVo = [];
  try {
    const res = await listQuestionVoByPageUsingPost({
      pageSize: 12,
      sortField: "createTime",
      sortOrder: "descend",
    });
    // @ts-ignore
    questionListVo = res.data.records ?? [];
  } catch (e: any) {
    message.error("无法获取题目信息，因为" + e.message);
  }

  // 热点题目列表
  let questionHotspotListVo = [];
  try {
    const res = await listQuestionHotspotVoByPageUsingPost({
      pageSize: 12,
      sortField: "viewNum",    // 根据浏览数排序
      sortOrder: "descend",    // 降序排列
    });
    // @ts-ignore
    questionHotspotListVo = res.data.records ?? [];
  } catch (e: any) {
    message.error("无法获取热点题目信息，因为" + e.message);
  }

  return (
    <div id="homePage" className={styles.homeContainer}>
      <Flex gap={24} align="flex-start">
        {/* 主内容区 */}
        <div className={styles.mainContent}>
          {/* RICH AI 模块 */}
          <Card>
            <AiCallComponent />
          </Card>

          {/* 题库列表 */}
          <Card className={`section-card ${styles.sectionCard}`}>
            <Flex justify="space-between" align="center">
              <Title level={3} className="card-title">
                最新题库
              </Title>
              <Link href={"/banks"} className="more-link">
                更多题库 <RightOutlined />
              </Link>
            </Flex>
            <QuestionBankListVoComponent
              questionBankList={questionBankListVo}
            />
          </Card>

          {/*题目列表*/}
          <Card className="section-card">
            <Flex justify="space-between" align="center">
              <Title level={3} className="section-title">
                题目上新！
              </Title>
              <Link href={"/questions"} className="more-link">
                查看更多热门题目
                <RightOutlined />
              </Link>
            </Flex>
            <QuestionListVo questionList={questionListVo} />
          </Card>
        </div>

        {/* 右侧边栏 */}
        <Sider width={350} theme="light" className={styles.sidebar}>
          <Card>
            <RecentStudy />
          </Card>
          {/* 每日一刷 */}
          <Card className={styles.sideCard} style={{ marginTop: 24 }}>
            <div className={styles.sideCardHeader}>
              <span className={styles.cardTitle}>
                <BulbOutlined style={{ color: "#faad14", marginRight: 8 }} />
                每日一刷
              </span>
            </div>
            {questionListVo.length > 0 ? (
              <div className={styles.dailyQuestion}>
                {(() => {
                  const randomIndex = Math.floor(
                    Math.random() * questionListVo.length,
                  );
                  const dailyQuestion = questionListVo[randomIndex];
                  return (
                    <Link
                      href={`/question/${dailyQuestion.id}`}
                      className={styles.itemLink}
                    >
                      <div className={styles.dailyTitle}>
                        #{dailyQuestion.title}
                      </div>
                      <div className={styles.dailyTags}>
                        {(dailyQuestion.tagList || [])
                          .slice(0, 3)
                          /* @ts-ignore */
                          .map((tag, index) => (
                            <span key={index} className={styles.tag}>
                              {tag}
                            </span>
                          ))}
                      </div>
                    </Link>
                  );
                })()}
              </div>
            ) : (
              <div className={styles.emptyTip}>今日题目加载中...</div>
            )}
          </Card>

          {/* 热门题目 */}
          <Card className={styles.sideCard} style={{ marginTop: 24 }}>
            <div className={styles.sideCardHeader}>
              <span className={styles.cardTitle}>🔥 热门题目 TOP10</span>
            </div>
            <div className={styles.hotItems}>
              {questionHotspotListVo
                .slice(0, 10)
                // @ts-ignore
                .map((item, index) => (
                  <div key={item.id} className={styles.hotItem}>
                    <span className={styles.rank}>{index + 1}.</span>
                    <Link
                      href={`/question/${item.questionId}`}
                      className={styles.itemLink}
                    >
                      {item.title}
                    </Link>
                  </div>
                ))}
            </div>
          </Card>

          {/* 热门题库 */}
          <Card className={styles.sideCard} style={{ marginTop: 24 }}>
            <div className={styles.sideCardHeader}>
              <span className={styles.cardTitle}>🏆 热门题库 TOP5</span>
            </div>
            <div className={styles.hotItems}>
              {questionBankListVo
                .slice(0, 5)
                // @ts-ignore
                .map((item, index) => (
                  <div key={item.id} className={styles.hotItem}>
                    <span className={styles.rank}>{index + 1}.</span>
                    <Link href={`/bank/${item.id}`} className={styles.itemLink}>
                      {item.title}
                    </Link>
                  </div>
                ))}
            </div>
          </Card>
        </Sider>
      </Flex>
    </div>
  );
}
