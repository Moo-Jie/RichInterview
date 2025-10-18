import {QrcodeOutlined} from "@ant-design/icons";
import {Button, Drawer, Image, Typography} from "antd";
import {useState} from "react";
import styles from "./components/index.module.css";

/**
 * 微信小程序二维码抽屉组件
 * @constructor
 */
export default function WeChatMiniProgramQRCodeDrawer() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Button
                type="primary"
                size="large"
                icon={<QrcodeOutlined style={{ fontSize: '18px' }} />}
                onClick={() => setOpen(true)}
                className={styles.configButton}
            >
                小程序
            </Button>
            <Drawer
                title="微信小程序"
                placement="right"
                width={600}
                onClose={() => setOpen(false)}
                open={open}
                classNames={{
                    header: styles.drawerHeader,
                    body: styles.configContent,
                }}
            >
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Typography.Title level={4} style={{ marginBottom: '20px' }}>
                        扫描二维码，使用微信小程序版本
                    </Typography.Title>
                    <Image
                        src="/assets/pictures/weChatMiniProgramQRCode.jpg"
                        alt="微信小程序二维码"
                        width={300}
                        style={{ margin: '0 auto' }}
                    />
                    <Typography.Paragraph style={{ marginTop: '20px', color: '#666' }}>
                        使用微信扫描上方二维码，随时随地访问面试题库
                    </Typography.Paragraph>
                </div>
            </Drawer>
        </>
    );
}
