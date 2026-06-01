import { useEffect, useState } from 'react';
import { fetchInquiries, fetchInquiry } from '../../api/inquiries';
import Layout from '../../components/layout/Layout';
import styles from './InquiryListPage.module.css';

// FE-INQ-01 / FE-EDU-INQ-01: enum name 하드코딩
const INQUIRY_STATUSES = [
  { value: '', label: '전체 상태' },
  { value: 'PENDING', label: '대기' },
  { value: 'ANSWERED', label: '답변완료' },
  { value: 'CLOSED', label: '종료' },
];

const INQUIRY_TYPES = {
  CONTRACT: '계약',
  PAYMENT: '납입',
  CLAIM: '청구',
  GENERAL: '일반',
  COMPLAINT: '불만',
};

const STATUS_CLS = {
  PENDING: styles.badgeYellow,
  ANSWERED: styles.badgeGreen,
  CLOSED: styles.badgeGray,
};

function InquiryStatusBadge({ status }) {
  const label = { PENDING: '대기', ANSWERED: '답변완료', CLOSED: '종료' }[status] ?? status;
  return (
    <span className={`${styles.badge} ${STATUS_CLS[status] ?? styles.badgeGray}`}>{label}</span>
  );
}

function DetailPanel({ inquiryNo, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!inquiryNo) return;
    setLoading(true);
    setError(null);
    fetchInquiry(inquiryNo)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [inquiryNo]);

  return (
    <aside className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>문의 상세</span>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
      </div>
      <div className={styles.panelBody}>
        {loading && <p className={styles.msg}>불러오는 중…</p>}
        {error && <p className={`${styles.msg} ${styles.error}`}>{error}</p>}
        {data && (
          <>
            <div className={styles.inquiryNo}>{data.inquiryNo}</div>
            <InquiryStatusBadge status={data.status} />

            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>문의 내용</h3>
              <dl className={styles.dl}>
                <dt>고객명</dt><dd>{data.customerName ?? '-'}</dd>
                <dt>문의유형</dt><dd>{INQUIRY_TYPES[data.inquiryType] ?? data.inquiryType ?? '-'}</dd>
                <dt>제목</dt><dd>{data.title ?? '-'}</dd>
                <dt>등록일</dt><dd>{data.createdAt ?? '-'}</dd>
                <dt>답변일</dt><dd>{data.answeredAt ?? '-'}</dd>
              </dl>
            </section>

            {data.content && (
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>문의 본문</h3>
                <p className={styles.contentBox}>{data.content}</p>
              </section>
            )}

            {data.answer && (
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>답변</h3>
                <p className={styles.answerBox}>{data.answer}</p>
              </section>
            )}

            {/* FE-INQ-04: status == ANSWERED이면 답변 버튼 숨김 */}
            {data.status !== 'ANSWERED' && data.status !== 'CLOSED' && (
              <section className={styles.section}>
                <button className={styles.actionBtn} disabled title="Phase 2에서 구현 예정">
                  답변 등록
                </button>
                <p className={styles.actionNote}>답변 등록은 Phase 2에서 연결됩니다.</p>
              </section>
            )}
          </>
        )}
      </div>
    </aside>
  );
}

export default function InquiryListPage() {
  const [customerName, setCustomerName] = useState('');
  const [status, setStatus] = useState('');
  const [searchName, setSearchName] = useState('');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNo, setSelectedNo] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchInquiries({ customerName: searchName, status })
      .then((data) => setItems(Array.isArray(data) ? data : (data.items ?? data.content ?? [])))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [searchName, status]);

  function handleSearch() {
    setSearchName(customerName);
    setSelectedNo(null);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleSearch();
  }

  function handleStatusChange(e) {
    setStatus(e.target.value);
    setSelectedNo(null);
  }

  return (
    <Layout title="문의 목록">
      <div className={styles.root}>
        <div className={styles.tableArea}>
          <div className={styles.toolbar}>
            <div className={styles.filters}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="고객명 검색"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button className={styles.searchBtn} onClick={handleSearch}>검색</button>
              <select className={styles.select} value={status} onChange={handleStatusChange}>
                {INQUIRY_STATUSES.map((s) => (
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
                  <th>문의번호</th>
                  <th>고객명</th>
                  <th>문의유형</th>
                  <th>제목</th>
                  <th>상태</th>
                  <th>등록일</th>
                  <th>답변일</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} className={styles.msgCell}>불러오는 중…</td></tr>
                )}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={7} className={styles.msgCell}>조회된 문의가 없습니다.</td></tr>
                )}
                {!loading && items.map((item) => (
                  <tr
                    key={item.inquiryNo}
                    className={`${styles.row} ${selectedNo === item.inquiryNo ? styles.selectedRow : ''}`}
                    onClick={() => setSelectedNo((p) => p === item.inquiryNo ? null : item.inquiryNo)}
                  >
                    <td className={styles.mono}>{item.inquiryNo}</td>
                    <td>{item.customerName ?? '-'}</td>
                    <td>{INQUIRY_TYPES[item.inquiryType] ?? item.inquiryType ?? '-'}</td>
                    <td className={styles.titleCell}>{item.title ?? '-'}</td>
                    <td><InquiryStatusBadge status={item.status} /></td>
                    <td>{item.createdAt ?? '-'}</td>
                    <td>{item.answeredAt ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* FE-INQ-03: 서버 페이지네이션 미지원 */}
        </div>

        {selectedNo && (
          <DetailPanel inquiryNo={selectedNo} onClose={() => setSelectedNo(null)} />
        )}
      </div>
    </Layout>
  );
}
