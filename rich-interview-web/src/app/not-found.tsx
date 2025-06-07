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
        subTitle="若您已经登录，则可能有其他设备异端登录，为了保证您的账号安全，请及时修改密码，以防泄露！"
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
