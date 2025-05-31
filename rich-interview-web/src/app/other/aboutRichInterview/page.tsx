"use client";
import { Card, Col, Row } from "antd";
import { ConstantBasicMsg } from "@/constant/ConstantBasicMsg";
import { GithubFilled } from "@ant-design/icons";
import React from "react";
import styles from "../components/page.module.css";

// 数据
const interviewData = [
  {
    direction: "核心优势",
    technologyStackRow01:
      "• 通过多级缓存架构整合Redis与Caffeine实现热点数据实时响应",
    technologyStackRow02:
      "• 基于Elasticsearch 构建智能检索系统提升内容查询效率； 运用Redisson分布式数据结构优化核心接口吞吐性能",
    technologyStackRow03: "• 服务端渲染实现快速首页加载 和 SEO 友好",
    technologyStackRow04: "• 建立动态IP黑白名单及流量熔断机制强化系统防护体系",
    technologyStackRow05: "• 实施多维度用户会话管控与智能反爬策略保障业务安全",
    technologyStackRow06:
      "• 采用敏捷部署方案配合容灾设计确保服务持续可用；独立开发所有业务",
  },
  {
    direction: "后端",
    technologyStackRow01:
      "SpringBoot + MySql + MyBatis - Plus + MyBatis X+ Elasticsearch 搜索引擎",
    technologyStackRow02:
      "Sa-Token 权限控制 +HotKey 热点探测 + Sentinel 流量控制 + Nacos 配置中心 + Druid 并发",
    technologyStackRow03: "DeepSeek API",
    technologyStackRow04: "Redis + Caffeine 缓存 + Redisson 分布式锁",
  },
  {
    direction: "前端",
    technologyStackRow01:
      "React 18服务端渲染 + Ant Design 组件库 + Ant Design Pro",
    technologyStackRow02: "Redux 状态管理",
    technologyStackRow03: "TypeScript + ESLint + Prettier 代码规范",
    technologyStackRow04: "OpenAPI 风格",
  },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        {/* 基本信息 */}
        <Card title="基本信息" className={styles.authorInfo}>
          <Col span={6} className={styles.avatarContainer}>
            <div className={styles.avatarFrame}>
              <img
                src="/assets/pictures/logo.png"
                className={styles.avatarImage}
                alt="项目LOGO"
              />
            </div>
          </Col>
          <Row>
            <Col span={12} className={styles.itemBorder}>
              <a
                href={ConstantBasicMsg.REPO_URL}
                key="github"
                title="项目源码"
                target="_blank"
              >
                项目源码
                <GithubFilled key="GithubFilled" />
              </a>
            </Col>
          </Row>
          <Row>
            <Col span={12} className={styles.itemBorder}>
              项目名：{ConstantBasicMsg.PROJECT_CHINESE_NAME}
            </Col>
            <Col span={12} className={styles.itemBorder}>
              类型：刷题/学习/文档/资源/交流
            </Col>
            <Col span={12} className={styles.itemBorder}>
              维护者：<a href="/other/aboutAuthor" target={"_blank"}>{ConstantBasicMsg.AUTHOR_NAME}</a>
            </Col>
            <Col span={12} className={styles.itemBorder}>
              当前版本：{ConstantBasicMsg.PROJECT_VERSION}
            </Col>
            <Col span={12} className={styles.itemBorder}>
              更新日期：{ConstantBasicMsg.PROJECT_LAST_UPDATE_TIME}
            </Col>
          </Row>
          <Row>
            <Col span={12} className={styles.itemBorder}>
              云服务器性能：
              <br />
              {ConstantBasicMsg.SERVER_PERFORMANCE.cpu}
              <br />
              {ConstantBasicMsg.SERVER_PERFORMANCE.memory}
              <br />
              {ConstantBasicMsg.SERVER_PERFORMANCE.disk}
              <br />
              {ConstantBasicMsg.SERVER_PERFORMANCE.bandwidth}
            </Col>
          </Row>
        </Card>

        {/* 项目技术栈及亮点 */}
        <Card title="项目技术栈及亮点" className={styles.skillsCard}>
          <Row gutter={[16, 24]} justify="space-between">
            {interviewData.map((item, index) => (
              <Col
                key={index}
                xs={24}
                sm={12}
                md={12}
                lg={12}
                className={styles.skillColumn}
              >
                <Card
                  title={item.direction}
                  headStyle={{ background: "#f0f5ff" }}
                  className={styles.boxShadowHover}
                >
                  <Row gutter={[8, 8]}>
                    <Col span={12} className={styles.itemBorder}>
                      {" "}
                      {item.technologyStackRow01}
                    </Col>
                    <Col span={12} className={styles.itemBorder}>
                      {" "}
                      {item.technologyStackRow02}
                    </Col>
                    <Col span={12} className={styles.itemBorder}>
                      {" "}
                      {item.technologyStackRow03}
                    </Col>
                    <Col span={12} className={styles.itemBorder}>
                      {" "}
                      {item.technologyStackRow04}
                    </Col>
                    <Col span={12} className={styles.itemBorder}>
                      {" "}
                      {item.technologyStackRow05}
                    </Col>
                    <Col span={12} className={styles.itemBorder}>
                      {" "}
                      {item.technologyStackRow06}
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </main>
    </div>
  );
}
