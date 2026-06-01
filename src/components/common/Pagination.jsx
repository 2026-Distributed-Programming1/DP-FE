import styles from './Pagination.module.css';

export default function Pagination({ page, size, total, onChange }) {
  const totalPages = Math.max(1, Math.ceil(total / size));

  const pages = [];
  const start = Math.max(0, page - 2);
  const end = Math.min(totalPages - 1, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className={styles.root}>
      <button
        className={styles.btn}
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
      >
        이전
      </button>

      {start > 0 && (
        <>
          <button className={styles.btn} onClick={() => onChange(0)}>1</button>
          {start > 1 && <span className={styles.ellipsis}>…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          className={`${styles.btn} ${p === page ? styles.active : ''}`}
          onClick={() => onChange(p)}
        >
          {p + 1}
        </button>
      ))}

      {end < totalPages - 1 && (
        <>
          {end < totalPages - 2 && <span className={styles.ellipsis}>…</span>}
          <button className={styles.btn} onClick={() => onChange(totalPages - 1)}>{totalPages}</button>
        </>
      )}

      <button
        className={styles.btn}
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
      >
        다음
      </button>

      <span className={styles.info}>{total}건 중 {page * size + 1}–{Math.min((page + 1) * size, total)}</span>
    </div>
  );
}
