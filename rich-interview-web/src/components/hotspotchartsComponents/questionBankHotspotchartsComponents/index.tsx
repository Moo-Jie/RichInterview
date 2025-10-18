"use client";
import {Card, List} from "antd";
import React, {useEffect, useRef} from "react";
import * as echarts from "echarts";
import {EyeFilled, LikeFilled} from "@ant-design/icons";
import "../components/index.css";

interface Props {
  data: API.QuestionBankHotspotVO[];
}

const HotspotChartComponent: React.FC<Props> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current && data.length > 0) {
      const chart = echarts.init(chartRef.current);
      const option = {
        tooltip: {
          trigger: "axis",
          formatter: (params: any) => {
            const dataItem = data[params[0].dataIndex];
            return `${dataItem.title}<br/>访问量: ${dataItem.viewNum}<br>点赞数: ${dataItem.starNum}`;
          },
        },
        xAxis: {
          type: "category",
          data: data.map((item) => item.title),
          axisLabel: {
            rotate: 10,
            color: "#666",
            formatter: (value: string) =>
              value.length > 8 ? value.slice(0, 6) + "..." : value,
          },
        },
        yAxis: { type: "value" },
        series: [
          {
            data: data.map((item) => item.viewNum),
            type: "bar",
            itemStyle: {
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
      chart.setOption(option);

      // 图表点击跳转
      chart.on("click", (params) => {
        window.location.href = `/bank/${data[params.dataIndex].questionBankId}`;
      });
    }
  }, [data]);

  return (
    <Card
      title="题库热度排行"
      className="hotspot-card"
      extra={<span className="update-time">实时更新</span>}
    >
      <div ref={chartRef} className="chart-container" />
      <List
        dataSource={data}
        renderItem={(item, index) => (
          <List.Item
            className="rank-item"
            actions={[
              // 其他信息
              <span key="create" style={{ color: "#8aa5d0" }}>
                {item.description}
              </span>,
              <span key="create" style={{ color: "#666" }}>
                创建时间-
                {new Date(item.createTime || 0).toLocaleDateString("zh-CN")}
              </span>,
              <span key="create" style={{ color: "#666" }}>
                维护时间-
                {new Date(item.updateTime || 0).toLocaleDateString("zh-CN")}
              </span>,
              <span key="view" style={{ color: "#e8aaff" }}>
                <EyeFilled /> {item.viewNum}
              </span>,
              <span key="star" style={{ color: "#8b6cf0" }}>
                <LikeFilled /> {item.starNum}
              </span>,
            ]}
          >
            <List.Item.Meta
              avatar={<span className="rank-index">{index + 1}</span>}
              title={
                <a href={`/bank/${item.questionBankId}`} target={"_blank"}>
                  {item.title}
                </a>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default HotspotChartComponent;