"use server";
import {Alert, Flex} from "antd";
import {getLearnPathVoByIdUsingGet,} from "@/api/learnPathController";
import LearnPathMsgComponent from "../../../components/LearnPathMsgComponent";
import {Content} from "antd/es/layout/layout";
import "./index.css";

/**
 * 学习路线详情页
 * @constructor
 */
// @ts-ignore
export default async function LearnPathPage({ params }) {
  const { learnPathId  } = params;

  // 获取学习路线详情
  let learnPathData  = undefined;
  try {
    const res = await getLearnPathVoByIdUsingGet({
      id: learnPathId,
    });
    learnPathData  = res.data;
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
    <div id="learnPathPage">
      <Flex gap={24}>
        <Content>
          <LearnPathMsgComponent learnPath={learnPathData} />
        </Content>
      </Flex>
    </div>
  );
}
