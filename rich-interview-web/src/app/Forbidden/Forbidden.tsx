import {Button, Result} from "antd";
import {LoginOutlined} from "@ant-design/icons";
import styles from "./Forbidden.module.css";

const Forbidden = () => {
  return (
    <div className={styles.container}>
      {/*  源：https://3x.ant.design/components/result-cn/ */}
      <Result
        status="403"
        title={<span className={styles.title}>{" "}
            您暂时无法访问此内容，请先登录后再试。{" "}</span>}
        subTitle="若您已经登录，则可能您的账号已被系统封禁，请遵守社区规则，等待解封。"
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
};

export default Forbidden;
