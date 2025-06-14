import {InfoCircleFilled, QuestionCircleFilled} from "@ant-design/icons";
import {Button, Drawer} from "antd";
import {ProDescriptions} from "@ant-design/pro-components";
import {ConstantBasicMsg} from "@/constant/ConstantBasicMsg";
import {useState} from "react";
import styles from "./components/index.module.css";

/**
 * 系统配置抽屉组件
 * @returns
 */
export default function SystemConfigDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
        <Button
            type="primary"
            size="large"
            icon={<InfoCircleFilled style={{ fontSize: '18px' }} />}
            onClick={() => setOpen(true)}
            className={styles.configButton}
        >
            系统
        </Button>
      <Drawer
        title="系统配置"
        placement="right"
        width={600}
        onClose={() => setOpen(false)}
        open={open}
      >
        <ProDescriptions
          column={2}
          className={styles.configContent}
          dataSource={{
            version: ConstantBasicMsg.PROJECT_VERSION,
            maintainer: ConstantBasicMsg.AUTHOR_NAME,
            updateTime: ConstantBasicMsg.PROJECT_LAST_UPDATE_TIME,
            ...ConstantBasicMsg.SERVER_PERFORMANCE,
          }}
          columns={[
            { title: "当前版本", dataIndex: "version" },
            { title: "维护人员", dataIndex: "maintainer" },
            { title: "最后更新", dataIndex: "updateTime" },
            { title: "云CPU配置", dataIndex: "cpu" },
            { title: "云内存容量", dataIndex: "memory" },
            { title: "云磁盘空间", dataIndex: "disk" },
            { title: "云网络带宽", dataIndex: "bandwidth", span: 2 },
          ]}
        />
      </Drawer>
    </>
  );
}
