import {QuestionCircleFilled} from "@ant-design/icons";
import {Button, Collapse, Drawer, Typography} from "antd";
import {ProDescriptions} from "@ant-design/pro-components";
import {useState} from "react";
import styles from "./components/index.module.css";

/**
 * 帮助中心抽屉组件
 * @constructor
 */
export default function HelpCenterDrawer() {
  const [open, setOpen] = useState(false);

  return (
    <>
        <Button
            type="primary"
            size="large"
            icon={<QuestionCircleFilled style={{ fontSize: '18px' }} />}
            onClick={() => setOpen(true)}
            className={styles.configButton}
        >
            答疑
        </Button>
      <Drawer
        title="帮助中心"
        placement="right"
        width={600}
        onClose={() => setOpen(false)}
        open={open}
        classNames={{
          header: styles.drawerHeader,
          body: styles.configContent,
        }}
      >
        <Collapse
          ghost
          expandIconPosition="end"
          items={[
            {
              key: "1",
              label: "如何搜索题目？",
              className: styles.helpItem,
              children: (
                <ProDescriptions
                  column={1}
                  dataSource={{
                    method1: "搜索框搜索：输入关键词进行搜索",
                    method2: "题库搜索：进入对应主题题库",
                    method3: "主页栏目查找：点击最新或热门题目",
                  }}
                  columns={[
                    { valueType: "text", dataIndex: "method1" },
                    { valueType: "text", dataIndex: "method2" },
                    { valueType: "text", dataIndex: "method3" },
                  ]}
                />
              ),
            },
            {
              key: "2",
              label: "题库更新频率？",
              className: styles.helpItem,
              children: (
                <Typography.Text>
                  题库会定期更新，将尽量保持内容的最新和全面：
                  <a href="/banks" className={styles.feedbackLink}>
                    【热门题库】
                  </a>
                </Typography.Text>
              ),
            },
            {
              key: "3",
              label: "在面试中遇到了全新的面试题，去哪里分享给大家呢？",
              className: styles.helpItem,
              children: (
                <Typography.Text>
                  请前往
                  <a
                    href="/communityCoConstruction/contributionQuestion"
                    className={styles.feedbackLink}
                  >
                    【贡献新面试题】
                  </a>
                  ，之后管理员将在短时间内进行审核，十分感谢您对平台做出的贡献！
                </Typography.Text>
              ),
            },
            {
              key: "4",
              label: "本平台的用户等级如何提升？等级有什么用？",
              className: styles.helpItem,
              children:
                "每日参与刷题，即视为当日签到，更多签到天数将解锁更高的用户等级。用户等级越高，本平台会提供更多的福利。",
            },
            {
              key: "5",
              label: "本平台的用户等级如何提升？等级有什么用？",
              className: styles.helpItem,
              children:
                "每日参与刷题，即视为当日签到，更多签到天数将解锁更高的用户等级。用户等级越高，本平台会提供更多的福利。",
            },
            {
              key: "6",
              label: "我发现本平台存在 BUG 或不合适的设计，反馈渠道是什么？",
              className: styles.helpItem,
              children: (
                <Typography.Text>
                  请前往
                  <a href="/other/aboutAuthor" className={styles.feedbackLink}>
                    【关于作者】
                  </a>
                  查看联系方式，被采纳的反馈将在后续版本中修复，并给予相应的奖励。
                </Typography.Text>
              ),
            },
          ]}
        />
      </Drawer>
    </>
  );
}
