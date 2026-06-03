import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

const MENU = [
  {
    label: '계약',
    icon: '📋',
    children: [
      { label: '계약 조회', to: '/contracts' },
      { label: '만기 계약 관리', to: '/expiring-contracts', disabled: true },
      { label: '계약 통계', to: '/contract-statistics', disabled: true },
    ],
  },
  {
    label: '납입·환급',
    icon: '💳',
    children: [
      { label: '납부 내역 관리', to: '/payment-records' },
      { label: '해지 관리', to: '/cancellations', disabled: true },
      { label: '환급 산출·지급', to: '/refunds', disabled: true },
    ],
  },
  {
    label: '보상·청구',
    icon: '🔖',
    children: [
      { label: '사고 접수·출동', to: '/accidents' },
      { label: '청구 목록', to: '/claims' },
      { label: '보험금 지급', to: '/claim-payments' },
    ],
  },
  {
    label: '상담·인수심사',
    icon: '🤝',
    children: [
      { label: '상담 예약 신청', to: '/consultations' },
      { label: '면담 일정', to: '/interview-schedules' },
      { label: '인수심사 대기열', to: '/underwriting' },
      { label: '인수심사 대시보드', to: '/underwriting-dashboard' },
    ],
  },
  {
    label: '영업',
    icon: '📈',
    children: [
      { label: '영업활동 관리', to: '/sales-activities' },
      { label: '채널 심사', to: '/channel-screenings' },
      { label: '채널 모집', to: '/channel-recruitments' },
      { label: '영업조직 평가', to: '/sales-org-evaluations' },
    ],
  },
  {
    label: '교육',
    icon: '🎓',
    children: [
      { label: '교육 계획', to: '/education-plans' },
      { label: '교육 제반', to: '/education-preparations' },
      { label: '교육 실행', to: '/education-executions' },
    ],
  },
  {
    label: '보험상품',
    icon: '🛡️',
    children: [
      { label: '보험상품 포털', to: '/insurance-products' },
    ],
  },
  {
    label: '고객센터',
    icon: '💬',
    children: [
      { label: '문의 목록', to: '/inquiries' },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandIcon}>🏢</span>
        <span className={styles.brandName}>보험 업무 포털</span>
      </div>

      <nav className={styles.nav}>
        {MENU.map((group) => (
          <div key={group.label} className={styles.group}>
            <div className={styles.groupLabel}>
              <span>{group.icon}</span>
              <span>{group.label}</span>
            </div>
            <ul className={styles.list}>
              {group.children.map((item) =>
                item.disabled ? (
                  <li key={item.label}>
                    <span className={`${styles.link} ${styles.disabled}`}>{item.label}</span>
                  </li>
                ) : (
                  <li key={item.label}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `${styles.link} ${isActive ? styles.active : ''}`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                )
              )}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
