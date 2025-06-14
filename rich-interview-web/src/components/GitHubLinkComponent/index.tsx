import { GithubFilled } from "@ant-design/icons";
import styles from "./index.module.css";

interface GitHubLinkProps {
  href: string;
  title?: string;
}

export default function GitHubLink({ href, title = "访问GitHub仓库" }: GitHubLinkProps) {
  return (
    <a
      href={href}
      title={title}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.githubLink}
    >
      <GithubFilled className={styles.icon} />
      <span className={styles.text}>GitHub</span>
    </a>
  );
}
