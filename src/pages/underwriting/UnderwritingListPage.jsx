import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { fetchUnderwritingPending } from '../../api/underwriting';
import styles from './UnderwritingListPage.module.css';

const PRODUCT_TYPES = [
  { value: '', label: '상품 유형 전체' },
  { value: 'WHOLE_LIFE', label: '종신보험' },
  { value: 'CI', label: '중대질병보험' },
  { value: 'AUTO', label: '자동차보험' },
];

const STAGE_LABELS = {
  INITIAL_REVIEW: '1차 의무심사 중',
  DOC_PENDING: '서류 보완 대기',
  FINAL_APPROVAL: '최종 승인 대기',
  INELIGIBLE: '심사 부적격 검토',
};

export default function UnderwritingListPage() {
  const [search, setSearch] = useState('');
  const [productType, setProductType] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchUnderwritingPending()
      .then((data) => setItems(Array.isArray(data) ? data : data?.items ?? data?.content ?? []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = items.filter((item) => {
    const matchSearch =
      !search ||
      (item.customerName ?? '').includes(search) ||
      (item.applicationNo ?? '').includes(search);
    const matchType = !productType || item.productType === productType;
    return matchSearch && matchType;
  });

  const waitCount = items.filter((i) => i.stage !== 'APPROVED' && i.stage !== 'REJECTED').length;
  const approvedToday = items.filter((i) => i.stage === 'APPROVED').length;
  const rejectedToday = items.filter((i) => i.stage === 'REJECTED').length;

  return (
    <Layout title="인수심사">
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h2 className={styles.pageTitle}>심사 대기열</h2>
            <p className={styles.pageSubtitle}>현재 대기 중인 신규 청약 건을 관리합니다.</p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.btnOutline}>보고서 다운로드</button>
            <button className={styles.btnPrimary}>+ 신규 심사 등록</button>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div>
              <p className={styles.statLabel}>심사 대기</p>
              <p className={styles.statValue}>{loading ? '…' : waitCount}<span className={styles.statUnit}>건</span></p>
              <p className={styles.statNote + ' ' + styles.noteGreen}>↑ 어제보다 +5건</p>
            </div>
            <div className={styles.statEmoji}>📋</div>
          </div>
          <div className={styles.statCard}>
            <div>
              <p className={styles.statLabel}>금일 승인</p>
              <p className={styles.statValue}>{loading ? '…' : approvedToday}<span className={styles.statUnit}>건</span></p>
              <p className={styles.statNote + ' ' + styles.noteGreen}>✓ 승인율 92%</p>
            </div>
            <div className={styles.statEmoji}>✅</div>
          </div>
          <div className={styles.statCard}>
            <div>
              <p className={styles.statLabel}>금일 거절</p>
              <p className={styles.statValue}>{loading ? '…' : rejectedToday}<span className={styles.statUnit}>건</span></p>
              <p className={styles.statNote + ' ' + styles.noteRed}>⚠ 리스크 감지 3건</p>
            </div>
            <div className={styles.statEmoji}>🚫</div>
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.toolbar}>
            <div className={styles.toolbarLeft}>
              <div className={styles.searchWrap}>
                <input
                  className={styles.searchInput}
                  type="text"
                  placeholder="고객명 또는 신청번호 검색"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className={styles.filterSelect}
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
              >
                {PRODUCT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.toolbarRight}>
              <button className={styles.iconBtn} onClick={() => {
                setLoading(true);
                fetchUnderwritingPending()
                  .then((data) => setItems(Array.isArray(data) ? data : data?.items ?? data?.content ?? []))
                  .catch((e) => setError(e.message))
                  .finally(() => setLoading(false));
              }}>⟳</button>
            </div>
          </div>

          {error && <div className={styles.error}>오류: {error}</div>}

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>신청번호</th>
                  <th>고객명</th>
                  <th>상품 유형</th>
                  <th>신청일</th>
                  <th>심사 단계</th>
                  <th className={styles.textRight}>관리</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={6} className={styles.msgCell}>불러오는 중…</td></tr>
                )}
                {!loading && filtered.length === 0 && (
                  <tr><td colSpan={6} className={styles.msgCell}>조회된 심사 건이 없습니다.</td></tr>
                )}
                {!loading && filtered.map((item, idx) => (
                  <tr key={item.applicationNo ?? idx} className={styles.row}>
                    <td className={styles.appNo}>{item.applicationNo ?? `#APP-${idx + 1}`}</td>
                    <td>
                      <div className={styles.nameCell}>
                        <div className={styles.avatar}>{(item.customerName ?? '?')[0]}</div>
                        <span>{item.customerName ?? '-'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={styles.productBadge}>{item.productType ?? '-'}</span>
                    </td>
                    <td className={styles.dateCell}>{(item.applicationDate ?? item.createdAt ?? '-').slice(0, 10)}</td>
                    <td>
                      <div className={styles.stageCell}>
                        <div className={`${styles.stageDot} ${item.stage === 'INELIGIBLE' ? styles.dotRed : styles.dotGreen}`} />
                        <span className={item.stage === 'INELIGIBLE' ? styles.stageRed : ''}>
                          {STAGE_LABELS[item.stage] ?? item.stage ?? '심사 대기'}
                        </span>
                      </div>
                    </td>
                    <td className={styles.textRight}>
                      <button className={styles.detailBtn}>상세보기</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.tableFooter}>
            <p className={styles.footerText}>전체 {filtered.length}개 표시 중</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
