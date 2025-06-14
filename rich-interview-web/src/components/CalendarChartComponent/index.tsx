import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import dayjs from "dayjs";
import {
  Button,
  message,
  Skeleton,
  Progress,
  Flex,
  Typography,
  Tooltip,
} from "antd";
import { getUserSignInRecordUsingGet } from "@/api/userController";
import "./index.css";
import { CrownFilled, RocketFilled } from "@ant-design/icons";

interface Props {}

/**
 * 刷题热点图表
 * @param props
 * @constructor
 * 源 ；
 * ECharts 组件库   https://echarts.apache.org/zh/index.html
 * React ECharts 可视化库    https://github.com/hustcc/echarts-for-react
 */
const CalendarChart = (props: Props) => {
  const {} = props;
  const { Text } = Typography;
  // 状态添加
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // 签到日期列表，形式：[x,y,z] 代表第 x 天、第 y 天、 第 z 天签到
  const [dataList, setDataList] = useState<number[]>([]);
  // 当前年份
  const year = new Date().getFullYear();

  // 获取用户签到记录
  const fetchDataList = async (year: number) => {
    try {
      setLoading(true);
      const res = await getUserSignInRecordUsingGet({
        year,
      });
      setDataList(res.data as number[]);
    } catch (e: any) {
      message.error("获取刷题签到记录失败，因为" + e.message);
    } finally {
      setLoading(false);
    }
  };
  // 仅调用一次
  useEffect(() => {
    fetchDataList(year);
  }, []);
  // 年份切换
  const handleYearChange = (offset: number) => {
    const newYear = selectedYear + offset;
    setSelectedYear(newYear);
    fetchDataList(newYear);
  };
  // 计算图表所需的数据
  const optionsData = dataList.map((dayOfYear) => {
    // 计算日期字符串
    const dateStr = dayjs(`${year}-01-01`)
      .add(dayOfYear - 1, "day")
      .format("YYYY-MM-DD");
    console.log(dateStr);
    return [dateStr, 1];
  });

  // 图表配置
  // 参考 https://echarts.apache.org/examples/zh/editor.html?c=calendar-simple
  const options = {
    visualMap: {
      show: false,
      min: 0,
      max: 1,
      inRange: {
        // 渐变
        color: ["#f0f0f0", "#8cc269"],
      },
    },
    calendar: {
      range: year,
      left: 20,
      cellSize: ["auto", 16],
      yearLabel: {
        textStyle: {
          fontSize: 16,
          fontWeight: "bold",
          color: "#333",
        },
        position: "top",
        formatter: `${year} 年度刷题记录总览`,
      },
      dayLabel: {
        color: "#666",
      },
      monthLabel: {
        color: "#666",
      },
    },
    series: {
      type: "heatmap",
      coordinateSystem: "calendar",
      data: optionsData,
    },
    tooltip: {
      formatter: (params: any) => {
        return `日期: ${params.data[0]}`;
      },
    },
  };

  // 在组件状态后新增等级计算逻辑
  const totalDays = dataList.length;
  const maxLevel = 10;
  // 每 73 天升一级
  const level = Math.min(maxLevel, Math.floor(totalDays / 73) + 1);
  // 730天满级（2年）
  const progress = (totalDays / 730) * 100;

  return (
    <div className="calendar-container">
      {/* 等级信息模块 */}
      {!loading && (
        <div className="level-container">
          <Flex align="center" gap={16}>
            <Tooltip title="当前学习等级，满级需要坚持签到呦">
              <div className="level-badge">
                <CrownFilled className="crown-icon" />
                <Text strong className="level-text" style={{ whiteSpace: 'nowrap' }}>
                  LV.{level}
                </Text>
                {level === 10 && <RocketFilled className="rocket-icon" />}
              </div>
            </Tooltip>
            <Progress
              percent={progress}
              strokeColor={{
                "0%": "#ffd666",
                "100%": "#8cc269",
              }}
              trailColor="#f0f0f0"
              strokeWidth={12}
              format={() => (
                <div className="progress-text">
                  <div>已签到 {dataList.length} 天</div>
                </div>
              )}
            />
          </Flex>
          <div className="level-hint">
            {level < 5 && "保持每日学习，快速升级！"}
            {level >= 5 && level < 8 && "持续进步，即将进入高手阶段！"}
            {level >= 8 && "精英级别，坚持就是胜利！"}
          </div>
        </div>
      )}
      {/* 切换按钮 */}
      <div className="toolbar">
        <Button onClick={() => handleYearChange(-1)}>{"<"}</Button>
        <span className="year-display">{selectedYear}</span>
        <Button onClick={() => handleYearChange(1)}>{">"}</Button>
      </div>
      {/* 签到记录 */}
      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <ReactECharts
          className="calendar-chart"
          option={options}
          style={{ height: 240 }}
        />
      )}
    </div>
  );
};

export default CalendarChart;
