import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <button type="button">这个页面是_关于本项目_测试页面</button>
      </main>
      <footer className={styles.footer}></footer>
    </div>
  );
}
