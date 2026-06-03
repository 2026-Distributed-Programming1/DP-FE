import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import styles from './PaymentHistoryPage.module.css';

const MOCK_DATA = [
  { id: 'TX-90123', date: '2023.10.24', customerName: '이정민', productName: '종합 건강 실손 보험', policyNo: 'KIND-9021', amount: '₩125,000', method: '카드', status: '완납' },
  { id: 'TX-90122', date: '2023.10.23', customerName: '박서준', productName: '초간편 운전자 보험', policyNo: 'KIND-5541', amount: '₩45,000', method: '계좌이체', status: '미납' },
  { id: 'TX-90121', date: '2023.10.22', customerName: '최지우', productName: '무배당 연금보험', policyNo: 'KIND-1002', amount: '₩350,000', method: '간편결제', status: '완납' },
  { id: 'TX-90120', date: '2023.10.22', customerName: '정해인', productName: '화재 배상 책임 보험', policyNo: 'KIND-7782', amount: '₩88,200', method: '카드', status: '완납' },
];

export default function PaymentHistoryPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const filtered = MOCK_DATA.filter((row) => {
    if (statusFilter === 'pending' && row.status !== '미납') return false;
    if (statusFilter === 'completed' && row.status !== '완납') return false;
    if (searchQuery && !row.customerName.includes(searchQuery) && !row.policyNo.includes(searchQuery)) return false;
    return true;
  });

  return (
    <Layout title="수납/입금 관리">
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h2 className={styles.pageTitle}>수납/입금 관리</h2>
          <button className={styles.btnPrimary}>
            <span className={styles.btnIcon}>⏰</span>
            미납 알림 자동 발송 설정
          </button>
        </div>

        <section className={styles.filterCard}>
          <div className={styles.filterGrid}>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>조회 기간</label>
              <div className={styles.dateRange}>
                <input
                  type="date"
                  className={styles.input}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <span className={styles.dateSep}>~</span>
                <input
                  type="date"
                  className={styles.input}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>수납 상태</label>
              <select
                className={styles.input}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">전체 내역</option>
                <option value="pending">미납 (Pending)</option>
                <option value="completed">완납 (Completed)</option>
              </select>
            </div>
            <div className={styles.filterField}>
              <label className={styles.filterLabel}>고객명/증권번호</label>
              <input
                type="text"
                className={styles.input}
                placeholder="검색어 입력"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className={styles.searchBtn}>
              🔍 조회하기
            </button>
          </div>
        </section>

        <section className={styles.tableCard}>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>납부일</th>
                  <th>납부 ID</th>
                  <th>고객명</th>
                  <th>보험 상품명</th>
                  <th>증권번호</th>
                  <th>납부금액</th>
                  <th>수단</th>
                  <th>상태</th>
                  <th>관리</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id} className={styles.tableRow}>
                    <td>{row.date}</td>
                    <td className={styles.muted}>{row.id}</td>
                    <td className={styles.customerName}>{row.customerName}</td>
                    <td>{row.productName}</td>
                    <td className={styles.muted}>{row.policyNo}</td>
                    <td className={styles.amount}>{row.amount}</td>
                    <td>
                      <span className={styles.methodBadge}>{row.method}</span>
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${row.status === '완납' ? styles.statusPaid : styles.statusUnpaid}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>
                      <button className={styles.detailBtn} onClick={() => navigate(`/payment-records/${row.id}`)}>상세보기</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <span className={styles.paginationInfo}>전체 1,248건 중 1-10건 표시</span>
            <div className={styles.paginationBtns}>
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                ‹
              </button>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  className={`${styles.pageBtn} ${currentPage === n ? styles.pageBtnActive : ''}`}
                  onClick={() => setCurrentPage(n)}
                >
                  {n}
                </button>
              ))}
              <button
                className={styles.pageBtn}
                onClick={() => setCurrentPage((p) => Math.min(5, p + 1))}
              >
                ›
              </button>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}