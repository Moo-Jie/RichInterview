"use client";
import { Card, Row, Col } from "antd";
import { ConstantMsg } from "@/constant/ConstantMsg";
import styles from "../components/page.module.css";
import { GithubFilled } from "@ant-design/icons";
import React from "react";

// 数据
const interviewData = [
  {
    direction: "核心优势",
    technologyStackRow01:
      "本系统是个人独立开发，从零开始搭建项目前后端，包括数据库设计、接口设计、功能开发、性能优化等",
    technologyStackRow02:
      "本系统使用服务端渲染SSR，更好的搜索引擎优化，更快的首屏加载速度，更好的可访问性",
    technologyStackRow03:
      "",
    technologyStackRow04:
      "",
  },
  {
    direction: "后端",
    technologyStackRow01: "SpringBoot + MyBatis-Plus",
    technologyStackRow02:
      "Redis 分布式缓存 + Caffeine 本地缓存 + Redission 分布式 + BloomFilter + BitMap",
    technologyStackRow03: "Elasticsearch 搜索引擎",
    technologyStackRow04:
      "",
  },
  {
    direction: "前端",
    technologyStackRow01:
      "React 18服务端渲染 + Ant Design 组件库 + Ant Design Pro",
    technologyStackRow02: "Redux 状态管理",
    technologyStackRow03: "TypeScript + ESLint + Prettier 代码规范",
    technologyStackRow04: "OpenAPI 风格接口",
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
                href={ConstantMsg.REPO_URL}
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
              项目名：{ConstantMsg.PROJECT_CHINESE_NAME}
            </Col>
            <Col span={12} className={styles.itemBorder}>
              类型：刷题/学习/文档/资源/交流
            </Col>
            <Col span={12} className={styles.itemBorder}>
              维护者：{ConstantMsg.AUTHOR_NAME}
            </Col>
            <Col span={12} className={styles.itemBorder}>
              当前版本：{ConstantMsg.PROJECT_VERSION}
            </Col>
            <Col span={12} className={styles.itemBorder}>
              更新日期：{ConstantMsg.PROJECT_LAST_UPDATE_TIME}
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
                      •{item.technologyStackRow01}
                    </Col>
                    <Col span={12} className={styles.itemBorder}>
                      {" "}
                      •{item.technologyStackRow02}
                    </Col>
                    <Col span={12} className={styles.itemBorder}>
                      {" "}
                      •{item.technologyStackRow03}
                    </Col>
                    <Col span={12} className={styles.itemBorder}>
                      {" "}
                      •{item.technologyStackRow04}
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
