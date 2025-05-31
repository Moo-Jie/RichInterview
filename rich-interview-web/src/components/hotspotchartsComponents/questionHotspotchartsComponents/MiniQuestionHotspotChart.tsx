"use client";
import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import "../components/index.css";

interface Props {
  data: API.QuestionHotspotVO[];
}

const MiniQuestionHotspotChart: React.FC<Props> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const displayData = data.slice(0, 10);
  useEffect(() => {
    if (chartRef.current && displayData.length > 0) {
      const chart = echarts.init(chartRef.current);
      const option = {
        tooltip: {
          trigger: "axis",
          formatter: (params: any) => {
            const dataItem = displayData[params[0].dataIndex];
            return `${dataItem.title}<br/>访问量: ${dataItem.viewNum}<br>点赞数: ${dataItem.starNum}`;
          },
        },
        grid: {
          top: 5,
          bottom: 25,
          left: 5,
          right: 5,
        },
        xAxis: {
          type: "category",
          data: displayData.map((item) => item.title),
          axisLabel: {
            rotate: 10,
            fontSize: 10,
            formatter: (value: string) =>
              value.length > 8 ? value.slice(0, 6) + "..." : value,
          },
        },
        yAxis: { type: "value" },
        series: [
          {
            data: displayData.map((item) => item.viewNum),
            type: "bar",
            barWidth: "80%",
            itemStyle: {
              // 使用渐变色填充
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "#8b6cf0" },
                { offset: 1, color: "#4a90e2" },
              ]),
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: "rgba(139,108,240,0.5)",
              },
            },
          },
        ],
      };

      chart.on("click", (params) => {
        window.location.href = `/bank/${displayData[params.dataIndex].questionId}`;
      });
      chart.setOption(option);
    }
  }, [displayData]);

  return (
    <div
      className="mini-chart-container"
      ref={chartRef}
      // 实际宽度
      style={{ width: 1100, height: 300, padding: 8 }}
    ></div>
  );
};

export default MiniQuestionHotspotChart;
