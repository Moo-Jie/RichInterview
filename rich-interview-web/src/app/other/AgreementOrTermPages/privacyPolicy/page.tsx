import styles from "../components/page.module.css"
import Title from "antd/es/typography/Title";
import Paragraph from "antd/es/typography/Paragraph";

export const metadata = {
    title: "隐私政策",
    description: "RICH面试刷题平台的隐私政策",
};

export default function PrivacyPolicy() {
    return (
        <div className={styles.agreementPage}>
            <Title level={1} className={styles.header}>
                隐私政策
            </Title>

            <div className={styles.contentCard}>
                <div className={styles.devAlert}>
                    <p>本平台目前处于开发测试阶段，相关内容正在完善中...</p>
                </div>

                <Title level={2} className={styles.sectionTitle}>
                    引言
                </Title>
                <Paragraph>
                    欢迎使用RICH面试刷题平台（以下简称"我们"）。我们深知个人信息对您的重要性，并会全力保护您的个人信息安全。我们致力于维持您对我们的信任，恪守以下原则，保护您的个人信息：权责一致原则、目的明确原则、选择同意原则、最少够用原则、确保安全原则、主体参与原则、公开透明原则等。
                </Paragraph>

                <Title level={2} className={styles.sectionTitle}>
                    我们收集的信息
                </Title>
                <Paragraph>
                    我们根据合法、正当、必要的原则，仅收集实现产品功能所必要的信息。您在使用我们的服务时，我们可能会收集和使用您的相关信息，包括但不限于：
                    <ul>
                        <li>账号信息：当您注册账号时，我们会收集您的手机号、邮箱、用户名、密码等</li>
                        <li>刷题行为信息：如您的刷题记录、错题记录、收藏记录、笔记、练习时长、提交的代码等</li>
                        <li>设备信息：我们可能会根据您在软件安装及使用中授予的具体权限，接收并记录您所使用的设备相关信息（例如设备型号、操作系统版本、设备设置、唯一设备标识符等软硬件特征信息）</li>
                        <li>日志信息：当您使用我们的服务时，我们可能会自动收集您对我们服务的详细使用情况，作为服务日志保存，包括浏览、点击查看、搜索查询、收藏、添加到题单、分享等信息</li>
                    </ul>
                </Paragraph>

                <Title level={2} className={styles.sectionTitle}>
                    信息使用
                </Title>
                <Paragraph>
                    我们严格遵守法律法规及与用户的约定，将收集的信息用于以下用途：
                    <ul>
                        <li>提供、维护和改进我们的服务</li>
                        <li>实现个性化学习推荐，提升您的刷题效率</li>
                        <li>开发新功能和服务</li>
                        <li>进行安全防护及风险识别</li>
                        <li>分析产品使用情况，改进用户体验</li>
                        <li>响应您的需求，提供客服支持</li>
                    </ul>
                </Paragraph>

                <Title level={2} className={styles.sectionTitle}>
                    信息共享与披露
                </Title>
                <Paragraph>
                    我们不会与任何公司、组织和个人共享您的个人信息，但以下情况除外：
                    <ul>
                        <li>在获得您的明确同意的情况下</li>
                        <li>根据法律法规规定、法律程序要求、政府主管部门要求或司法裁定</li>
                        <li>为维护社会公共利益，保护用户或第三方的合法权益和安全</li>
                        <li>在合并、收购、资产转让等类似交易中，如涉及个人信息转移，我们会向您告知接收方的名称或联系方式，并要求新的持有您个人信息的公司或组织继续受此政策的约束</li>
                    </ul>
                </Paragraph>

                <Title level={2} className={styles.sectionTitle}>
                    信息安全
                </Title>
                <Paragraph>
                    我们采用符合业界标准的安全防护措施来保护您提供的个人信息，防止数据遭到未经授权访问、公开披露、使用、修改、损坏或丢失：
                    <ul>
                        <li>使用加密技术（如TLS/SSL）保护数据传输过程的安全</li>
                        <li>实施访问控制机制，确保只有授权人员才能访问个人信息</li>
                        <li>定期进行安全审计和漏洞扫描</li>
                        <li>制定安全事件应急响应预案</li>
                    </ul>
                </Paragraph>

                <Title level={2} className={styles.sectionTitle}>
                    未成年人保护
                </Title>
                <Paragraph>
                    我们非常重视未成年人个人信息的保护：
                    <ul>
                        <li>根据相关法律法规的规定，若您是未满18周岁的未成年人，在使用我们的服务前，应事先取得您的家长或法定监护人的同意</li>
                        <li>我们不会主动收集14周岁以下儿童的个人信息。如果我们在不知情的情况下收集了儿童个人信息，我们将及时删除</li>
                        <li>若您是未成年人的监护人，当您对您所监护的未成年人的个人信息有相关疑问时，请通过本政策中的联系方式与我们联系</li>
                    </ul>
                </Paragraph>

                <Title level={2} className={styles.sectionTitle}>
                    政策更新
                </Title>
                <Paragraph>
                    我们的隐私政策可能会适时变更。未经您明确同意，我们不会削减您按照本隐私政策所应享有的权利。我们会通过站内公告、APP推送、邮件通知等方式发布更新后的隐私政策。在该等情况下，若您继续使用我们的服务，即表示您同意接受更新后的隐私政策约束。
                </Paragraph>

                <Title level={2} className={styles.sectionTitle}>
                    联系我们
                </Title>
                <Paragraph>
                    如果您对本隐私政策有任何疑问、意见或建议，您可以通过以下方式联系我们：
                    <ul>
                        <li>电子邮件：DRC9941@outlook.com</li>
                        <li>客户服务热线：15966279907</li>
                    </ul>
                </Paragraph>
            </div>
        </div>
    );
}