"use client";
import {Card, List} from "antd";
import React, {useEffect, useRef} from "react";
import * as echarts from "echarts";
import {EyeFilled, LikeFilled} from "@ant-design/icons";
import "../components/index.css";
import TagListComponent from "@/components/TagListComponent";

interface Props {
  data: API.QuestionHotspotVO[];
}

const QuestionHotspotChartComponent: React.FC<Props> = ({ data }) => {
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
            // 截断
            formatter: (value: string) => {
              return value.length > 12 ? value.substring(0, 12) + "..." : value;
            },
            // 强制显示所有标签
            interval: 0,
          },
        },
        yAxis: { type: "value" },
        series: [
          {
            data: data.map((item) => item.viewNum),
            type: "bar",
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "#ff9f40" },
                { offset: 1, color: "#ff6b6b" },
              ]),
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: "rgba(255,107,107,0.5)",
              },
            },
          },
        ],
      };
      chart.setOption(option);

      // 图表点击跳转至题目详情
      chart.on("click", (params) => {
        window.location.href = `/question/${data[params.dataIndex].questionId}`;
      });
    }
  }, [data]);

  return (
    <Card
      title="题目热度排行"
      className="hotspot-card"
      extra={<span className="update-time">实时更新</span>}
    >
      <div ref={chartRef} className="chart-container" />
      <List
        dataSource={data}
        renderItem={(item, index) => (
          <List.Item
            actions={[
              <span key="content"> {item.content}</span>,
              <span key="tags">
                {" "}
                <TagListComponent
                  tagList={item.tagList}
                ></TagListComponent>{" "}
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
                <a href={`/question/${item.questionId}`} target={"_blank"}>
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

export default QuestionHotspotChartComponent;
