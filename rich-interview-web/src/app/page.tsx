"use server";
import {listQuestionBankVoByPageUsingPost} from "@/api/questionBankController";
import {listQuestionVoByPageUsingPost} from "@/api/questionController";
import Title from "antd/es/typography/Title";
import {Card, Flex} from "antd";
import Link from "next/link";
import QuestionBankListVoComponent from "../components/QuestionBankListVoComponent";
import {
    CalendarFilled,
    EditFilled,
    EyeFilled,
    LikeFilled,
    MessageFilled,
    ReadFilled,
    RightOutlined,
    RobotFilled,
} from "@ant-design/icons";
import Sider from "antd/es/layout/Sider";
import QuestionListVo from "@/components/QuestionListVoComponent";
import AiCallComponent from "@/components/aiCallComponent";
import {listQuestionBankHotspotVoByPageUsingPost} from "@/api/questionBankHotspotController";
import {listQuestionHotspotVoByPageUsingPost} from "@/api/questionHotspotController";
import DailyPracticeComponent from "@/components/DailyPracticeComponent";
import MiniQuestionBankHotspotChart
    from "@/components/hotspotchartsComponents/questionBankHotspotchartsComponents/MiniQuestionBankHotspotChart";
import MiniQuestionHotspotChart
    from "@/components/hotspotchartsComponents/questionHotspotchartsComponents/MiniQuestionHotspotChart";
import styles from "./page.module.css";
import CarouselComponent from "@/components/CarouselComponents";

/**
 * 主页
 * @constructor
 */
const carouselItems = [
  {
    href: "/banks",
    // imgSrc: "/assets/pictures/carousel/carousel05.png",
    backgroundColor: "#e0f0ff", // 浅蓝色
    alt: "精选题库",
    title: "精选面试题库",
    description: "覆盖大厂高频考题",
    icon: <ReadFilled />,
  },
  {
    href: "/aiInterview",
    // imgSrc: "/assets/pictures/carousel/carousel08.png",
    backgroundColor: "#ffe6cc", // 浅橙色
    alt: "模拟面试",
    title: "AI模拟面试",
    description: "真实面试环境演练",
    icon: <RobotFilled />,
  },
  {
    href: "/questions",
    // imgSrc: "/assets/pictures/carousel/carousel09.png",
    backgroundColor: "#d4fffe", // 浅绿色
    alt: "题目大全",
    title: "每日刷题挑战",
    description: "保持你的刷题手感",
    icon: <CalendarFilled />,
  },
  {
    href: "/communityCoConstruction/contributionQuestion",
    // imgSrc: "/assets/pictures/carousel/carousel02.png",
    backgroundColor: "#ffe0ed", // 浅粉色
    alt: "贡献面试题",
    title: "贡献你遇到的全新面试题",
    description: "刷友面试新题互享",
    icon: <EditFilled />,
  },
  {
    href: "/communityCoConstruction/hotComments",
    // imgSrc: "/assets/pictures/carousel/carousel03.png",
    backgroundColor: "#eee0ff", // 浅紫色
    alt: "刷友热门回答",
    title: "刷友热门回答",
    description: "积极讨论百家争鸣",
    icon: <MessageFilled />,
  },
];

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
    console.error("无法获取题库信息");
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
    console.error("无法获取题目信息，因为", e);
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
    console.error("无法获取热点题目信息，因为", e);
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
    console.error("无法获取热门题库信息，因为", e);
  }

  return (
    <div id="homePage" className={styles.homeContainer}>
      <Flex gap={24} align="flex-start">
        {/* 主内容区 */}
        <div className={styles.mainContent}>
          {/* 走马灯模块 https://ant-design.antgroup.com/components/carousel-cn */}
          <CarouselComponent items={carouselItems} />

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
          {/*<RecentStudy />*/}
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
