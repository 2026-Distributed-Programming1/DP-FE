import styles from './StatusBadge.module.css';

const CONTRACT_STATUS = {
  NORMAL: { label: '정상', color: 'green' },
  ACTIVE: { label: '유지', color: 'green' },
  EXPIRED: { label: '만기', color: 'gray' },
  CANCELLED: { label: '해지', color: 'red' },
  TERMINATED: { label: '해지', color: 'red' },
  PENDING: { label: '대기', color: 'yellow' },
  LAPSED: { label: '실효', color: 'orange' },
};

export default function StatusBadge({ status }) {
  const config = CONTRACT_STATUS[status] ?? { label: status, color: 'gray' };
  return <span className={`${styles.badge} ${styles[config.color]}`}>{config.label}</span>;
}
