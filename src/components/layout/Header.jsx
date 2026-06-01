import styles from './Header.module.css';

export default function Header({ title }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.right}>
        <span className={styles.tag}>Phase 1 MVP</span>
        <span className={styles.user}>담당자</span>
      </div>
    </header>
  );
}
