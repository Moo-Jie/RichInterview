"use client";
import { Card, Col, Row } from "antd";
import { ConstantBasicMsg } from "@/constant/ConstantBasicMsg";
import { GithubFilled } from "@ant-design/icons";
import React from "react";
import styles from "../components/page.module.css";

// 数据
const interviewData = [
  {
    direction: "后端",
    technologyStackRow01:
      "• JAVA 基础知识、常用 API 、主流集合特性与底层机制、异常、 IO 流、多线程及分布式锁、网络编程基础、反射等。",
    technologyStackRow02: "熟悉 JVM 工作原理，包括内存结构、运行数据区、垃圾回收机制、类加载机制、对象创建过程、JVM 调优等",
    technologyStackRow03:
      "• 熟练使用 MySQL数据库，掌握索引使用规则和运行细节，熟悉事务、MVCC、锁机制、SQL的执行分析与优化、日志等",
    technologyStackRow04:
      "• 熟悉 Redis 的常见数据类型和应用场景，以及持久化、分布式锁、过期删除策略、内存淘汰策略等特性，能够解决高并发下的缓存击穿、穿透、雪崩问题，掌握 Redis HotKey、BigKey等请问题的解决。",
    technologyStackRow05:
      "• 熟悉 SpringBoot、SpringMVC，掌握 IOC、AOP、Bean 生命周期及作用域、启动流程、MVC执行流程、设计模式、事务等，可以灵活地运用 SpringBoot 框架进行项目开发；熟悉Mybatis、Mybatis-Plus 开发框架。",
  },
  {
    direction: "前端",
    technologyStackRow01: "•熟悉 HTML、CSS、JavaScript、TypeScript等前端语言",
    technologyStackRow02: "•熟悉 Vue 框架+ element Plus 组件、React 框架+ Ant Design 组件，可以基于后端业务进行快速地Web页面搭建",
  },
  {
    direction: "其他",
    technologyStackRow01:
      "• 了解常见的数据结构与算法,并根据实际应用场景对功能进行优化",
    technologyStackRow02: "• 计算机组成原理、计算机网络、计算机操作系统、数据库原理",
    technologyStackRow03: "• 熟练使用 IDEA、Maven、ApiPfox等项目管理和构建工具；熟悉 Git 的使用、Linux 常用命令和 Docker 基本操作。",
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
                src={ConstantBasicMsg.AUTHOR_AVATAR} // 请替换实际头像路径
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
                title="GITHUB主页"
                target="_blank"
              >
                GITHUB主页
                <GithubFilled key="GithubFilled" />
              </a>
            </Col>
          </Row>
          <Row>
            <Col span={12} className={styles.itemBorder}>
              {ConstantBasicMsg.AUTHOR_NAME}
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
                  styles={{
                    header: {
                      background: "#f0f5ff",
                      borderRadius: "8px 8px 0 0"
                    }
                  }}
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
