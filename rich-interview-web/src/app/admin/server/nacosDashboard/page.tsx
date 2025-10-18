"use client";
import {Alert, Button, Card, Typography} from "antd";
import {LinkOutlined} from "@ant-design/icons";
import {ConstantBasicMsg} from "@/constant/ConstantBasicMsg";
import "../components/index.css";

export default function nacosDashboard() {
  return (
    <Card className="dashboard-card">
      <Typography.Title level={3} className="dashboard-title">
        🛡️ 动态 IP 黑名单管理（Nacos-Dashboard）
      </Typography.Title>

      <Typography.Paragraph className="dashboard-desc">
        本系统引入 nacos 进行 IP 黑名单管理
        ，实现动态服务发现、服务配置、服务元数据及‌流量管理。
      </Typography.Paragraph>

      <div className="dashboard-action">
        <Button
          type="primary"
          icon={<LinkOutlined />}
          href={ConstantBasicMsg.NACOS_DASHBOARD_URL}
          target="_blank"
          className="dashboard-button"
        >
          点此跳转控制台
        </Button>

        <Typography.Text className="dashboard-credential" code>
          账号：nacos 密码：RichInterview
        </Typography.Text>
      </div>

      <Alert
        message="操作警告"
        description="生产环境下请谨慎配置 IP 黑名单，并对旧配置及时备份，以免对用户使用造成影响！"
        type="warning"
        showIcon
        className="dashboard-alert"
      />
    </Card>
  );
}
