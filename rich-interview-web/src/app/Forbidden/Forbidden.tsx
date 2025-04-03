import { Button, Result } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import styles from "./Forbidden.module.css";

const Forbidden = () => {
  return (
    <div className={styles.container}>
      <Result
        status="403"
        title={<span className={styles.title}>您的权限无法访问该界面哦！</span>}
        subTitle="您暂时无法访问此内容，请检查您的权限状态或联系管理员"
        extra={
          <Button
            type="primary"
            href="/"
            icon={<HomeOutlined />}
            className={styles.homeButton}
          >
            返回主页
          </Button>
        }
      />
    </div>
  );
};

export default Forbidden;
