"use server";
import { Alert, Card, Flex, Layout, Menu } from "antd";
import { getLearnPathVoByIdUsingGet } from "@/api/learnPathController";
import LearnPathMsgComponent from "../../../components/LearnPathMsgComponent";
import { Content } from "antd/es/layout/layout";
import Link from "next/link";
import { ConstantPathMsg } from "@/constant/ConstantPathMsg";
import "./index.css";

/**
 * 学习路线详情页
 * @constructor
 */
// @ts-ignore
export default async function LearnPathPage({ params }) {
  const { learnPathId } = params;

  // 获取学习路线详情
  let learnPathData = undefined;
  try {
    const res = await getLearnPathVoByIdUsingGet({
      id: learnPathId,
    });
    learnPathData = res.data;
    // 获取学习路线异常
    if (!learnPathData) {
      return <div>获取学习路线详情失败，请刷新重试</div>;
    }
  } catch (e: any) {
    return (
      <Alert
        type="error"
        message={`学习路线加载失败: ${e.message || "未知错误"}`}
        style={{ margin: 24 }}
      />
    );
  }
  // 断言
  learnPathData = learnPathData as API.LearnPathVO;
  return (
    <div id="learnPathPage" className="learnPath-container">
      <Flex gap={24}>
        {/* 主要内容 */}
        <Content>
          <LearnPathMsgComponent learnPath={learnPathData} />
        </Content>

        {/* 侧边栏 */}
        <Card title="📚 热门学习路线" variant="borderless">
          <Menu
            mode="vertical"
            selectedKeys={[learnPathId]}
            items={[
              {
                key: ConstantPathMsg.LEARN_PATH_JAVA_ID,
                label: (
                  <Link
                    href={`/learnPath/${ConstantPathMsg.LEARN_PATH_JAVA_ID}`}
                  >
                    JAVA 学习路线
                  </Link>
                ),
              },
              {
                key: ConstantPathMsg.LEARN_PATH_CPP_ID,
                label: (
                  <Link
                    href={`/learnPath/${ConstantPathMsg.LEARN_PATH_CPP_ID}`}
                  >
                    C++ 学习路线
                  </Link>
                ),
              },
              {
                key: ConstantPathMsg.LEARN_PATH_PYTHON_ID,
                label: (
                  <Link
                    href={`/learnPath/${ConstantPathMsg.LEARN_PATH_PYTHON_ID}`}
                  >
                    Python 学习路线
                  </Link>
                ),
              },
              {
                key: ConstantPathMsg.LEARN_PATH_AI_ID,
                label: (
                  <Link href={`/learnPath/${ConstantPathMsg.LEARN_PATH_AI_ID}`}>
                    人工智能 学习路线
                  </Link>
                ),
              },
              {
                key: ConstantPathMsg.LEARN_PATH_CPP_QT_ID,
                label: (
                  <Link
                    href={`/learnPath/${ConstantPathMsg.LEARN_PATH_CPP_QT_ID}`}
                  >
                    C++ Qt 学习路线
                  </Link>
                ),
              },
            ]}
          />
        </Card>
      </Flex>
    </div>
  );
}
