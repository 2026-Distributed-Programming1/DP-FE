import { useEffect, useState } from 'react';
import { fetchEducationPlans, fetchEducationPlan } from '../../api/educationPlans';
import Layout from '../../components/layout/Layout';
import styles from './EducationPlanListPage.module.css';

// FE-EDU-INQ-01: 교육 상태는 한글 문자열 하드코딩
const EDU_STATUSES = [
  { value: '', label: '전체' },
  { value: '임시저장', label: '임시저장' },
  { value: '승인요청', label: '승인요청' },
  { value: '승인', label: '승인' },
  { value: '반려', label: '반려' },
];

const STATUS_CLS = {
  '임시저장': styles.badgeGray,
  '승인요청': styles.badgeYellow,
  '승인': styles.badgeGreen,
  '반려': styles.badgeRed,
};

function EduBadge({ status }) {
  return (
    <span className={`${styles.badge} ${STATUS_CLS[status] ?? styles.badgeGray}`}>
      {status ?? '-'}
    </span>
  );
}

function DetailPanel({ planNo, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!planNo) return;
    setLoading(true);
    setError(null);
    fetchEducationPlan(planNo)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [planNo]);

  return (
    <aside className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>교육 계획 상세</span>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
      </div>
      <div className={styles.panelBody}>
        {loading && <p className={styles.msg}>불러오는 중…</p>}
        {error && <p className={`${styles.msg} ${styles.error}`}>{error}</p>}
        {data && (
          <>
            <div className={styles.planNo}>{data.planNo}</div>
            <EduBadge status={data.status} />

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>계획 정보</h3>
              <dl className={styles.dl}>
                <dt>교육명</dt><dd>{data.educationName ?? data.title ?? '-'}</dd>
                <dt>채널유형</dt><dd>{data.channelType ?? '-'}</dd>
                <dt>강사</dt><dd>{data.instructor ?? '-'}</dd>
                <dt>시작일</dt><dd>{data.startDate ?? '-'}</dd>
                <dt>종료일</dt><dd>{data.endDate ?? '-'}</dd>
                <dt>장소</dt><dd>{data.location ?? '-'}</dd>
                <dt>등록자</dt><dd>{data.createdBy ?? '-'}</dd>
                <dt>등록일</dt><dd>{data.createdAt ?? '-'}</dd>
              </dl>
            </section>

            {data.schedules?.length > 0 && (
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>일정 목록</h3>
                <ul className={styles.scheduleList}>
                  {data.schedules.map((s, i) => (
                    <li key={i} className={styles.scheduleItem}>
                      <span className={styles.scheduleDate}>{s.date ?? s.scheduledDate ?? '-'}</span>
                      <span>{s.topic ?? s.content ?? '-'}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>액션</h3>
              <div className={styles.actions}>
                <button className={styles.actionBtn} disabled title="Phase 2에서 구현 예정">
                  승인 요청
                </button>
                <button className={styles.actionBtn} disabled title="Phase 2에서 구현 예정">
                  제반 등록
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

export default function EducationPlanListPage() {
  const [status, setStatus] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNo, setSelectedNo] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchEducationPlans({ status })
      .then((data) => setItems(Array.isArray(data) ? data : (data.items ?? data.content ?? [])))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [status]);

  function handleStatusChange(e) {
    setStatus(e.target.value);
    setSelectedNo(null);
  }

  return (
    <Layout title="교육 계획">
      <div className={styles.root}>
        <div className={styles.tableArea}>
          <div className={styles.toolbar}>
            <div className={styles.filters}>
              <label className={styles.filterLabel}>상태</label>
              <select className={styles.select} value={status} onChange={handleStatusChange}>
                {EDU_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <span className={styles.totalCount}>{items.length > 0 ? `${items.length}건` : ''}</span>
          </div>

          {error && <div className={styles.errorBox}><strong>오류:</strong> {error}</div>}

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>계획번호</th>
                  <th>교육명</th>
                  <th>상태</th>
                  <th>채널유형</th>
                  <th>강사</th>
                  <th>시작일</th>
                  <th>종료일</th>
                  <th>등록일</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={8} className={styles.msgCell}>불러오는 중…</td></tr>
                )}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={8} className={styles.msgCell}>조회된 교육 계획이 없습니다.</td></tr>
                )}
                {!loading && items.map((item) => (
                  <tr
                    key={item.planNo}
                    className={`${styles.row} ${selectedNo === item.planNo ? styles.selectedRow : ''}`}
                    onClick={() => setSelectedNo((p) => p === item.planNo ? null : item.planNo)}
                  >
                    <td className={styles.mono}>{item.planNo}</td>
                    <td>{item.educationName ?? item.title ?? '-'}</td>
                    <td><EduBadge status={item.status} /></td>
                    <td>{item.channelType ?? '-'}</td>
                    <td>{item.instructor ?? '-'}</td>
                    <td>{item.startDate ?? '-'}</td>
                    <td>{item.endDate ?? '-'}</td>
                    <td>{item.createdAt ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* FE-EDU-04: 서버 페이지네이션 미지원 — 페이지네이션 컴포넌트 미사용 */}
        </div>

        {selectedNo && (
          <DetailPanel planNo={selectedNo} onClose={() => setSelectedNo(null)} />
        )}
      </div>
    </Layout>
  );
}
