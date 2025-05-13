import {listQuestionBankVoByPageUsingPost} from "@/api/questionBankController";
import {listQuestionVoByPageUsingPost} from "@/api/questionController";
import Title from "antd/es/typography/Title";
import {Card, Flex, message} from "antd";
import Link from "next/link";
import QuestionBankListVoComponent from "../components/QuestionBankListVoComponent";
import {RightOutlined} from "@ant-design/icons";
import Sider from "antd/es/layout/Sider";
import QuestionListVo from "@/components/QuestionListVoComponent";
import styles from "./page.module.css";
import AiCallComponent from "@/components/aiCallComponent";

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
        <Sider width={300} theme="light" className={styles.sidebar}>
          {/* 热门题目 */}
          <Card className={styles.sideCard}>
            <div className={styles.sideCardHeader}>
              <span className={styles.cardTitle}>🔥 热门题目 TOP10</span>
            </div>
            <div className={styles.hotItems}>
              {questionListVo
                .slice(0, 10)
                // @ts-ignore
                .map((item, index) => (
                  <div key={item.id} className={styles.hotItem}>
                    <span className={styles.rank}>{index + 1}.</span>
                    <Link
                      href={`/question/${item.id}`}
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
