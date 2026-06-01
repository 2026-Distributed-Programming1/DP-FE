import Sidebar from './Sidebar';
import Header from './Header';
import styles from './Layout.module.css';

export default function Layout({ title, children }) {
  return (
    <div className={styles.root}>
      <Sidebar />
      <div className={styles.main}>
        <Header title={title} />
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
