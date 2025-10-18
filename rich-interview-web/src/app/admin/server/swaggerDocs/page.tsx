"use client";
import {Alert, Button, Card, Typography} from "antd";
import {LinkOutlined} from "@ant-design/icons";
import {ConstantBasicMsg} from "@/constant/ConstantBasicMsg";
import "../components/index.css";

export default function sentinelDashboard() {
  return (
    <Card className="dashboard-card">
      <Typography.Title level={3} className="dashboard-title">
        📘 系统接口调试文档（Swagger-Docs）
      </Typography.Title>

      <Typography.Paragraph className="dashboard-desc">
        本系统集成 Swagger-Docs 提供完整的 API 接口文档，
        支持在线调试、接口测试及自动化文档生成。
      </Typography.Paragraph>

      <div className="dashboard-action">
        <Button
          type="primary"
          icon={<LinkOutlined />}
          href={ConstantBasicMsg.SERVER_API_SWAGGER_DOCS_URL}
          target="_blank"
          className="dashboard-button"
        >
          点此访问API文档
        </Button>

        <Typography.Text className="dashboard-credential" code>
          账号：RichInterview 密码：SwaggerDocs
        </Typography.Text>
      </div>

      <Alert
        message="操作警告"
        description="生产环境下请谨慎使用可能导致数据变更的接口，以免对用户使用造成影响！"
        type="warning"
        showIcon
        className="dashboard-alert"
      />
    </Card>
  );
}
