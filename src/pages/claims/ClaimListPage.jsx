import { useEffect, useState } from 'react';
import { fetchClaims, fetchClaim } from '../../api/claims';
import Layout from '../../components/layout/Layout';
import styles from './ClaimListPage.module.css';

// FE-CLAIM-10: enum 출처 없으므로 하드코딩
const CLAIM_STATUS = {
  REGISTERED: { label: '접수', cls: styles.badgeYellow },
  INVESTIGATING: { label: '조사중', cls: styles.badgeYellow },
  CALCULATING: { label: '산출중', cls: styles.badgeYellow },
  APPROVED: { label: '승인', cls: styles.badgeGreen },
  PAID: { label: '지급완료', cls: styles.badgeGreen },
  REJECTED: { label: '거절', cls: styles.badgeRed },
};

function ClaimBadge({ status }) {
  const cfg = CLAIM_STATUS[status] ?? { label: status, cls: styles.badgeGray };
  return <span className={`${styles.badge} ${cfg.cls}`}>{cfg.label}</span>;
}

function DetailPanel({ claimNo, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!claimNo) return;
    setLoading(true);
    setError(null);
    fetchClaim(claimNo)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [claimNo]);

  return (
    <aside className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>청구 상세</span>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
      </div>
      <div className={styles.panelBody}>
        {loading && <p className={styles.msg}>불러오는 중…</p>}
        {error && <p className={`${styles.msg} ${styles.error}`}>{error}</p>}
        {data && (
          <>
            <div className={styles.claimNo}>{data.claimNo}</div>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>청구 정보</h3>
              <dl className={styles.dl}>
                <dt>계약번호</dt><dd className={styles.mono}>{data.contractNo ?? '-'}</dd>
                <dt>청구유형</dt><dd>{data.claimType ?? '-'}</dd>
                <dt>상태</dt><dd>{data.status ?? '-'}</dd>
                <dt>청구금액</dt><dd>{data.claimAmount != null ? `${data.claimAmount.toLocaleString()}원` : '-'}</dd>
                <dt>계좌번호</dt><dd>{data.accountNo ?? '-'}</dd>
                <dt>은행</dt><dd>{data.bankName ?? '-'}</dd>
                <dt>등록일</dt><dd>{data.createdAt ?? '-'}</dd>
              </dl>
            </section>

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>진행 단계</h3>
              {/* FE-CLAIM-01: 조사/산출/지급번호가 청구 응답에 없으므로 상태값만 표시 */}
              <p className={styles.stepNote}>
                조사·산출·지급 단계 정보는 Phase 2에서 연결됩니다.
              </p>
            </section>
          </>
        )}
      </div>
    </aside>
  );
}

export default function ClaimListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNo, setSelectedNo] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchClaims()
      .then((data) => setItems(Array.isArray(data) ? data : (data.items ?? data.content ?? [])))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="청구 목록">
      <div className={styles.root}>
        <div className={styles.tableArea}>
          <div className={styles.toolbar}>
            <span className={styles.note}>
              {/* FE-CLAIM-03: 서버 필터/페이지네이션 미지원 — 전체 배열 표시 */}
              전체 목록 조회 (서버 필터·페이지네이션 미지원)
            </span>
            <span className={styles.totalCount}>{items.length > 0 ? `${items.length}건` : ''}</span>
          </div>

          {error && <div className={styles.errorBox}><strong>오류:</strong> {error}</div>}

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>청구번호</th>
                  <th>계약번호</th>
                  <th>청구유형</th>
                  <th>상태</th>
                  <th>청구금액</th>
                  <th>등록일</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={6} className={styles.msgCell}>불러오는 중…</td></tr>
                )}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={6} className={styles.msgCell}>조회된 청구가 없습니다.</td></tr>
                )}
                {!loading && items.map((item) => (
                  <tr
                    key={item.claimNo}
                    className={`${styles.row} ${selectedNo === item.claimNo ? styles.selectedRow : ''}`}
                    onClick={() => setSelectedNo((p) => p === item.claimNo ? null : item.claimNo)}
                  >
                    <td className={styles.mono}>{item.claimNo}</td>
                    <td className={styles.mono}>{item.contractNo ?? '-'}</td>
                    <td>{item.claimType ?? '-'}</td>
                    <td><ClaimBadge status={item.status} /></td>
                    <td className={styles.right}>
                      {item.claimAmount != null ? `${item.claimAmount.toLocaleString()}원` : '-'}
                    </td>
                    <td>{item.createdAt ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedNo && (
          <DetailPanel claimNo={selectedNo} onClose={() => setSelectedNo(null)} />
        )}
      </div>
    </Layout>
  );
}
