"use client";
import { Avatar, Card, Col, Row } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";
import { useState } from "react";
import "./index.css";

/**
 * 用户管理页面
 * @constructor
 */
export default function UserCenterPage() {
  // 获取登录用户信息
  const loginUser = useSelector((state: RootState) => state.userLogin);
  const user = loginUser;
  // 控制菜单栏的 Tab 高亮
  const [activeTabKey, setActiveTabKey] = useState<string>("record");

  return (
    <div id="userCenterPage" className="max-width-content">
      <Row gutter={[0, 24]}>
        <Col xs={24}>
          <Card style={{ textAlign: "center" }}>
            <Avatar src={user.userAvatar} size={72} />
            <div className="avatar-margin" />
            <Card.Meta
              title={
                <Title level={4} className="username">
                  {user.userName}
                </Title>
              }
              description={
                <Paragraph type="secondary" className="user-profile">
                  {user.userProfile}
                </Paragraph>
              }
            />
          </Card>
        </Col>
        <Col xs={24}>
          {/* TODO 刷题记录表格、详细信息卡片*/}
          <Card
            className="content-card"
            tabList={[
              {
                key: "record",
                label: "刷题记录",
              },
              {
                key: "userMsg",
                label: "详细信息",
              },
            ]}
            activeTabKey={activeTabKey}
            onTabChange={(key: string) => {
              setActiveTabKey(key);
            }}
          >
            {activeTabKey === "userMsg" && <>待实现</>}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
