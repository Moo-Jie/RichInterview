import styles from "../components/page.module.css"
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";


export const metadata = {
    title: "用户服务协议",
    description: "RICH面试刷题平台的服务协议",
};

export default function UserServiceAgreement() {
    return (
        <div className={styles.agreementPage}>
            <Title level={1} className={styles.header}>
                用户服务协议
            </Title>

            <div className={styles.contentCard}>
                <div className={styles.devAlert}>
                    <p>本平台目前处于开发测试阶段，相关内容正在完善中...</p>
                </div>

                <Title level={2} className={styles.sectionTitle}>
                    引言
                </Title>
                <Paragraph>
                    欢迎使用RICH面试刷题平台（以下称"本平台"）。在您注册成为本平台用户之前，请务必仔细阅读并充分理解本《用户服务协议》（以下称"本协议"）。当您点击"同意并继续"或实际使用本平台服务时，即表示您已阅读、理解并同意接受本协议的所有条款。
                </Paragraph>

                <Title level={2} className={styles.sectionTitle}>
                    服务内容
                </Title>
                <Paragraph>
                    本平台为技术类面试求职者提供以下服务：
                    <ul>
                        <li>面试题库浏览与练习功能</li>
                        <li>智能AI面试模拟及学习建议</li>
                        <li>学习进度跟踪与可视化分析</li>
                        <li>个性化刷题路径推荐</li>
                        <li>学习笔记与代码管理</li>
                        <li>题目解答与讨论社区</li>
                    </ul>
                </Paragraph>

                <Title level={2} className={styles.sectionTitle}>
                    用户注册
                </Title>
                <Paragraph>
                    <ol>
                        <li>注册资格：您应为年满18周岁，具备完全民事行为能力的个人。不符合条件的用户请勿注册</li>
                        <li>信息真实：您需提供真实、准确、完整和及时的注册信息</li>
                        <li>账号安全：您应妥善保管账号和密码，并承担因账号密码泄露造成的损失</li>
                        <li>不得转让：账号仅限您个人使用，不得赠与、借用、租用、转让或售卖</li>
                    </ol>
                </Paragraph>

                <Title level={2} className={styles.sectionTitle}>
                    使用规范
                </Title>
                <Paragraph>
                    您在使用本平台服务时，不得有以下行为：
                    <ul>
                        <li>发布违反法律法规或公序良俗的内容</li>
                        <li>进行不正当竞争或破坏平台正常秩序</li>
                        <li>利用技术手段干扰平台的正常服务</li>
                        <li>恶意刷题干扰平台统计数据</li>
                        <li>传播病毒、木马或进行网络攻击</li>
                        <li>未经授权使用他人账号</li>
                        <li>利用平台进行刷分、作弊行为</li>
                    </ul>
                </Paragraph>

                <Title level={2} className={styles.sectionTitle}>
                    内容版权
                </Title>
                <Paragraph>
                    <ol>
                        <li>平台内容：本平台提供的题库、解析、图表等所有内容的知识产权归本平台或相关权利人所有</li>
                        <li>用户内容：您上传的代码、解题思路、笔记等内容的知识产权归您所有，您授权本平台在本平台服务范围内使用</li>
                        <li>使用限制：未经许可，不得以任何形式复制、修改、翻译、传播本平台的任何内容</li>
                    </ol>
                </Paragraph>

                <Title level={2} className={styles.sectionTitle}>
                    AI服务条款
                </Title>
                <Paragraph>
                    <ol>
                        <li>智能辅导：本平台提供AI面试官、AI解答助手等服务</li>
                        <li>不可替代性：AI生成内容可能不准确或不完整，仅供学习参考</li>
                        <li>内容审慎：用户应自行判断AI生成内容的准确性</li>
                        <li>不保证效果：AI服务效果受多种因素影响，平台不保证学习结果</li>
                    </ol>
                </Paragraph>

                <Title level={2} className={styles.sectionTitle}>
                    服务变更与中断
                </Title>
                <Paragraph>
                    <ol>
                        <li>服务升级：为优化用户体验，平台可能进行服务变更、升级</li>
                        <li>暂停服务：系统维护、升级等可能导致暂停服务</li>
                        <li>不可抗力：因不可抗力因素导致服务中断，平台不承担责任</li>
                    </ol>
                </Paragraph>

                <Title level={2} className={styles.sectionTitle}>
                    免责声明
                </Title>
                <Paragraph>
                    <ol>
                        <li>不保证效果：平台对您的面试结果不作出任何形式的保证</li>
                        <li>信息准确性：平台不保证所有题目和信息绝对准确或最新</li>
                        <li>第三方内容：平台不对用户提供的第三方链接内容负责</li>
                        <li>责任限制：平台不承担用户使用本服务产生的间接损失</li>
                    </ol>
                </Paragraph>

                <Title level={2} className={styles.sectionTitle}>
                    协议变更
                </Title>
                <Paragraph>
                    平台保留随时修改本协议条款的权利。若修改重大条款，平台将通过站内通知、APP推送或电子邮件等形式通知用户。若您不同意修改后的协议，可停止使用平台服务。
                </Paragraph>

                <Title level={2} className={styles.sectionTitle}>
                    法律适用
                </Title>
                <Paragraph>
                    本协议的订立、履行及争议解决均适用中华人民共和国法律。争议应提交有管辖权的法院解决。
                </Paragraph>

                <Title level={2} className={styles.sectionTitle}>
                    联系我们
                </Title>
                <Paragraph>
                    如您对本协议有任何疑问或建议，请通过以下方式联系我们：
                    <ul>
                        <li>客服邮箱：DRC9941@outlook.com</li>
                    </ul>
                </Paragraph>

                <div className={styles.draftNotice}>
                    <p>【版本更新日期】2025年8月</p>
                    <p>【生效日期】2025年8月</p>
                </div>
            </div>
        </div>
    );
}