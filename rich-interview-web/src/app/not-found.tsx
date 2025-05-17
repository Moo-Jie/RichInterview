import { Button, Result } from "antd";
import styles from "@/app/Forbidden/Forbidden.module.css";
import { LoginOutlined } from "@ant-design/icons";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Result
        status="404"
        title={
          <span className={styles.title}>
            {" "}
            您暂时无法访问此内容，请先登录后再试。{" "}
          </span>
        }
        subTitle="该页面被拦截，您可能尚未登录！"
        extra={
          <Button
            type="primary"
            href="/user/userLogin"
            icon={<LoginOutlined />}
            className={styles.homeButton}
          >
            去登录
          </Button>
        }
      />
    </div>
  );
}
