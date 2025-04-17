"use client";
import { Card, List } from "antd";
import TagList from "@/components/TagListComponent/index";
import Link from "next/link";
import "./index.css";

interface Props {
  questionBankId?: number;
  questionList: API.QuestionVO[];
  cardTitle?: string;
}

/**
 * 题目列表组件
 * @param props
 * @constructor
 */
const QuestionListVo = (props: Props) => {
  const { questionList = [], cardTitle, questionBankId } = props;

  return (
    <Card className="question-list" title={cardTitle}>
      <List
        dataSource={questionList}
        renderItem={(item) => (
          <List.Item extra={<TagList tagList={item.tagList} />}>
            <List.Item.Meta
              title={
                // 拼装链接
                <Link
                  href={
                    questionBankId
                      ? `/question/${(item.id)}`
                      : `/question/${(item.id)}`
                  }
                >
                  {item.title}
                </Link>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default QuestionListVo;
