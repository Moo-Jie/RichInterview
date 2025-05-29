"use client";
import { Alert, Button, Card, Typography } from "antd";
import { LinkOutlined } from "@ant-design/icons";
import { ConstantBasicMsg } from "@/constant/ConstantBasicMsg";
import "../components/index.css";

export default function sentinelDashboard() {
  return (
    <Card className="dashboard-card">
      <Typography.Title level={3} className="dashboard-title">
        🛡️ 哨兵控制台（Sentinel-Dashboard）
      </Typography.Title>

      <Typography.Paragraph className="dashboard-desc">
        本系统引入 Sentinel
        进行流量监控、限流、熔断、降级、负载保障、规则配置等，
        对高并发下服务器进行安全保障。
      </Typography.Paragraph>

      <div className="dashboard-action">
        <Button
          type="primary"
          icon={<LinkOutlined />}
          href={ConstantBasicMsg.SENTINEL_DASHBOARD_URL}
          target="_blank"
          className="dashboard-button"
        >
          点此跳转控制台
        </Button>

        <Typography.Text className="dashboard-credential" code>
          账号：RichInterview 密码：sentinelDashboard
        </Typography.Text>
      </div>

      <Alert
        message="操作警告"
        description="生产环境下请谨慎进行监控参数配置，设置不当会严重影响系统运行！"
        type="warning"
        showIcon
        className="dashboard-alert"
      />
    </Card>
  );
}
