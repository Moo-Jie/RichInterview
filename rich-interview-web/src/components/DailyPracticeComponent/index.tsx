import { BulbOutlined } from "@ant-design/icons";
import { Card } from "antd";
import Link from "next/link";
import styles from "../../app/page.module.css";

export default function DailyPracticeComponent({
  questionList,
}: {
  questionList: any[];
}) {
  return (
    <Card className={styles.sideCard} style={{ marginTop: 24 }}>
      <div className={styles.sideCardHeader}>
        <span className={styles.cardTitle}>
          <BulbOutlined style={{ color: "#faad14", marginRight: 8 }} />
          每日一刷
        </span>
      </div>
      {questionList.length > 0 ? (
        <div className={styles.dailyQuestion}>
          {(() => {
            const randomIndex = Math.floor(Math.random() * questionList.length);
            const dailyQuestion = questionList[randomIndex];
            return (
              <Link
                href={`/question/${dailyQuestion.id}`}
                className={styles.itemLink}
              >
                <div className={styles.dailyTitle}>#{dailyQuestion.title}</div>
                <div className={styles.dailyTags}>
                  {(dailyQuestion.tagList || [])
                    .slice(0, 3)
                    .map((tag: any, index: number) => (
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
  );
}
