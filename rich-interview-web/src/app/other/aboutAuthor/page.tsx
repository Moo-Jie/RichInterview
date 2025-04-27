"use client";
import { Card, Row, Col } from "antd";
import { ConstantMsg } from "@/constant/ConstantMsg";
import styles from "../components/page.module.css";
import { GithubFilled } from "@ant-design/icons";
import React from "react";

// 数据
const interviewData = [
  {
    direction: "后端",
    technologyStackRow01:
      "•熟悉JAVASE相关内容：基础语法、面向对象、常用API、继承和多态、集合、异常、IO流、多线程、锁、网络编程基础、反射",
    technologyStackRow02: "熟悉springMVC框架下基于JAVAEE的开发生态",
    technologyStackRow03:
      "•熟悉JavaWeb项目开发流程，能基于行业规范实现业务逻辑，能自主解决BUG",
    technologyStackRow04:
      "•熟悉基于MySQL的数据库内容，主流存储引擎及其结构，了解事务、SQL优化相关内容；掌握Mybites、Mybatis-Plus框架，能熟练地基于业务需求快速实现数据库操作",
    technologyStackRow05:
      "•熟悉Redis、ElasticSearch、Kafka等常用中间件，能基于业务需求实现数据的缓存、消息队列、全文检索等功能，如Redis + Caffeine + Hotkey 构建高性能实时缓存",
  },
  {
    direction: "前端",
    technologyStackRow01: "•熟悉HTML、CSS、JavaScript、TypeScript等前端语言",
    technologyStackRow02: "•熟悉Vue、React（本项目）框架",
    technologyStackRow03: "•使用热门组件element、Ant Design快速搭建项目页面",
  },
  {
    direction: "其他",
    technologyStackRow01:
      "•了解常见的数据结构与算法,并根据实际应用场景对功能进行优化",
    technologyStackRow02: "•计算机组成原理",
    technologyStackRow03: "•计算机操作系统",
    technologyStackRow04: "•数据库原理",
    technologyStackRow05: "•计算机网络",
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
                src={ConstantMsg.AUTHOR_AVATAR} // 请替换实际头像路径
                className={styles.avatarImage}
                alt="作者头像"
              />
            </div>
          </Col>
          <Row>
            <Col span={12} className={styles.itemBorder}>
              <a
                href="https://github.com/Moo-Jie"
                key="github"
                title="我的GITHUB主页"
                target="_blank"
              >
                我的GITHUB主页
                <GithubFilled key="GithubFilled" />
              </a>
            </Col>
          </Row>
          <Row>
            <Col span={12} className={styles.itemBorder}>
              {ConstantMsg.AUTHOR_NAME}
            </Col>
            <Col span={12} className={styles.itemBorder}>
              Java 全栈开发工程师
            </Col>
          </Row>
        </Card>

        {/* 擅长技术栈 */}
        <Card title="擅长技术栈" className={styles.skillsCard}>
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
