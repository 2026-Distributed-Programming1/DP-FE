import { useEffect, useState } from 'react';
import { fetchContract } from '../../api/contracts';
import StatusBadge from '../../components/common/StatusBadge';
import styles from './ContractDetailPanel.module.css';

function ddayLabel(days) {
  if (days == null) return null;
  if (days < 0) return `만기 ${Math.abs(days)}일 경과`;
  if (days === 0) return '오늘 만기';
  return `만기 D-${days}`;
}

export default function ContractDetailPanel({ contractNo, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!contractNo) return;
    setLoading(true);
    setError(null);
    fetchContract(contractNo)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [contractNo]);

  return (
    <aside className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>계약 상세</span>
        <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">✕</button>
      </div>

      <div className={styles.panelBody}>
        {loading && <p className={styles.msg}>불러오는 중…</p>}
        {error && <p className={`${styles.msg} ${styles.error}`}>{error}</p>}

        {data && (
          <>
            <section className={styles.section}>
              <div className={styles.contractNo}>{data.contractNo}</div>
              <StatusBadge status={data.status} />
              {data.daysUntilExpiry != null && (
                <span className={styles.dday}>{ddayLabel(data.daysUntilExpiry)}</span>
              )}
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>계약자 정보</h3>
              <dl className={styles.dl}>
                <dt>고객명</dt><dd>{data.customerName ?? '-'}</dd>
                <dt>연락처</dt><dd>{data.customerContact ?? '-'}</dd>
                <dt>보험종류</dt><dd>{data.insuranceType ?? '-'}</dd>
                <dt>월보험료</dt><dd>{data.monthlyPremium != null ? `${data.monthlyPremium.toLocaleString()}원` : '-'}</dd>
                <dt>계약일</dt><dd>{data.startDate ?? '-'}</dd>
                <dt>만기일</dt><dd>{data.endDate ?? '-'}</dd>
                <dt>납입횟수</dt><dd>{data.paidCount != null ? `${data.paidCount} / ${data.totalPayCount ?? '-'}` : '-'}</dd>
                <dt>연체 여부</dt>
                <dd>
                  {data.isOverdue
                    ? <span className={styles.overdue}>연체 ({data.overdueCount}회)</span>
                    : <span className={styles.normal}>정상</span>}
                </dd>
              </dl>
            </section>

            {data.specialClauses?.length > 0 && (
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>특약 목록</h3>
                <ul className={styles.clauseList}>
                  {data.specialClauses.map((c, i) => (
                    <li key={i} className={styles.clauseItem}>{c}</li>
                  ))}
                </ul>
              </section>
            )}

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>액션</h3>
              <div className={styles.actions}>
                <button className={styles.actionBtn} disabled title="Phase 2에서 구현 예정">
                  해지 신청
                </button>
                <button className={styles.actionBtn} disabled title="Phase 2에서 구현 예정">
                  납입 처리
                </button>
              </div>
              <p className={styles.actionNote}>업무 액션은 Phase 2에서 연결됩니다.</p>
            </section>
          </>
        )}
      </div>
    </aside>
  );
}
