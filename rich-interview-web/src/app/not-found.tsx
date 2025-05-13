import {Button, Result} from "antd";
import styles from "@/app/Forbidden/Forbidden.module.css";
import {LoginOutlined} from "@ant-design/icons";

export default function NotFound() {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh'
    }}>
        <Result
            status="404"
            title={<span className={styles.title}> 找不到该页面！ </span>}
            subTitle="您暂时无法访问此内容，请先登录后再试。"
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
