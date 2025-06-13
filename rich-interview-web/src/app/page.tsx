import {listQuestionBankVoByPageUsingPost} from "@/api/questionBankController";
import {listQuestionVoByPageUsingPost} from "@/api/questionController";
import Title from "antd/es/typography/Title";
import {Card, Flex, message} from "antd";
import Link from "next/link";
import QuestionBankListVoComponent from "../components/QuestionBankListVoComponent";
import {EyeFilled, LikeFilled, RightOutlined} from "@ant-design/icons";
import Sider from "antd/es/layout/Sider";
import QuestionListVo from "@/components/QuestionListVoComponent";
import AiCallComponent from "@/components/aiCallComponent";
import {listQuestionBankHotspotVoByPageUsingPost} from "@/api/questionBankHotspotController";
import {listQuestionHotspotVoByPageUsingPost} from "@/api/questionHotspotController";
import RecentStudy from "@/components/RecentStudyComponent";
import DailyPracticeComponent from "@/components/DailyPracticeComponent";
import MiniQuestionBankHotspotChart
  from "@/components/hotspotchartsComponents/questionBankHotspotchartsComponents/MiniQuestionBankHotspotChart";
import MiniQuestionHotspotChart
  from "@/components/hotspotchartsComponents/questionHotspotchartsComponents/MiniQuestionHotspotChart";
import { Carousel } from 'antd';
import Image from 'next/image';
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
      sortField: "viewNum", // 根据浏览数排序
      sortOrder: "descend", // 降序排列
    });
    // @ts-ignore
    questionHotspotListVo = res.data.records ?? [];
  } catch (e: any) {
    message.error("无法获取热点题目信息，因为" + e.message);
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
    <div id="homePage" className={styles.homeContainer}>
      <Flex gap={24} align="flex-start">
        {/* 主内容区 */}
        <div className={styles.mainContent}>
          {/* 走马灯模块 */}
          <div className={styles.carouselContainer}>
            <Carousel
                autoplay={{ dotDuration: true }}
                effect="fade"
                dots={{ className: styles.dots }}
                arrows
                draggable
                infinite
                autoplaySpeed={5000}
                speed={800}
                easing="ease-in-out"
                adaptiveHeight
            >
              <Link href="/banks" className={styles.carouselItem}>
                <div className={styles.slideContent}>
                  <Image
                      src="/assets/pictures/carousel/carousel01.png"
                      alt="题库推荐"
                      fill
                      priority
                      sizes="100vw"
                      className={styles.carouselImage}
                  />
                  <div className={styles.slideText}>
                    <h3>精选面试题库</h3>
                    <p>覆盖大厂最新高频考题</p>
                  </div>
                </div>
              </Link>
              <Link href="/questions" className={styles.carouselItem}>
                <div className={styles.slideContent}>
                  <Image
                      src="/assets/pictures/carousel/carousel02.png"
                      alt="题目推荐"
                      fill
                      priority
                      sizes="100vw"
                      className={styles.carouselImage}
                  />
                  <div className={styles.slideText}>
                    <h3>每日刷题挑战</h3>
                    <p>保持你的编程手感</p>
                  </div>
                </div>
              </Link>
              <Link href="/TODO" className={styles.carouselItem}>
                <div className={styles.slideContent}>
                  <Image
                      src="/assets/pictures/carousel/carousel03.png"
                      alt="模拟面试"
                      fill
                      priority
                      sizes="100vw"
                      className={styles.carouselImage}
                  />
                  <div className={styles.slideText}>
                    <h3>AI模拟面试</h3>
                    <p>真实面试环境演练</p>
                  </div>
                </div>
              </Link>
            </Carousel>
          </div>

          {/* RICH AI 模块 */}
          <Card>
            <AiCallComponent />
          </Card>

          {/* 热门题库图表 */}
          <Card className={`section-card ${styles.sectionCard}`}>
            <Title level={3} className="card-title">
              热门题库排行
            </Title>
            <MiniQuestionBankHotspotChart data={questionBankHotspotListVo} />
          </Card>

          {/* 题库列表 */}
          <Card className={`section-card ${styles.sectionCard}`}>
            <Flex justify="space-between" align="center">
              <Title level={3} className="card-title">
                题库上新！
              </Title>
              <Link href={"/banks"} className="more-link" target={"_blank"}>
                查看更多热门题库
                <RightOutlined />
              </Link>
            </Flex>
            <QuestionBankListVoComponent
              questionBankList={questionBankListVo}
            />
          </Card>

          {/* 热门题目图表 */}
          <Card className={`section-card ${styles.sectionCard}`}>
            <Title level={3} className="card-title">
              热门题目排行
            </Title>
            <MiniQuestionHotspotChart data={questionHotspotListVo} />
          </Card>


          {/*题目列表*/}
          <Card className={`section-card ${styles.sectionCard}`}>
            <Flex justify="space-between" align="center">
              <Title level={3} className="section-title">
                题目上新！
              </Title>
              <Link href={"/questions"} className="more-link" target={"_blank"}>
                查看更多热门题目
                <RightOutlined />
              </Link>
            </Flex>
            <QuestionListVo questionList={questionListVo} />
          </Card>
        </div>

        {/* 右侧边栏 */}
        <Sider width={350} theme="light" className={styles.sidebar}>
          {/* 上次刷题 */}
          <RecentStudy />
          {/* 每日一刷 */}
          <DailyPracticeComponent questionList={questionListVo} />

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
                      title={item.title}
                      target={"_blank"}
                    >
                      <div className={styles.hotStats}>
                        <span className={styles.itemTitle}>{item.title}</span>
                        ...
                        <span className={styles.statItem}>
                          <EyeFilled /> {item.viewNum || 0}
                        </span>
                        <span className={styles.statItem2}>
                          <LikeFilled /> {item.starNum || 0}
                        </span>
                      </div>
                    </Link>
                  </div>
                ))}
            </div>
          </Card>

          {/* 热门题库 */}
          <Card className={styles.sideCard} style={{ marginTop: 24 }}>
            <div className={styles.sideCardHeader}>
              <span className={styles.cardTitle}>🏆 热门题库 TOP10</span>
            </div>
            <div className={styles.hotItems}>
              {questionBankHotspotListVo
                .slice(0, 10)
                // @ts-ignore
                .map((item, index) => (
                  <div key={item.questionBankId} className={styles.hotItem}>
                    <span className={styles.rank}>{index + 1}.</span>
                    <Link
                      href={`/bank/${item.questionBankId}`}
                      className={styles.itemLink}
                      title={item.title}
                      target={"_blank"}
                    >
                      <div className={styles.hotStats}>
                        <span className={styles.itemTitle}>{item.title}</span>
                        <span className={styles.statItem}>
                          <EyeFilled /> {item.viewNum || 0}
                        </span>
                        <span className={styles.statItem2}>
                          <LikeFilled /> {item.starNum || 0}
                        </span>
                      </div>
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
