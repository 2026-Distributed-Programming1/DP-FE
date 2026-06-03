import { useEffect, useState } from 'react';
import { fetchContracts } from '../../api/contracts';
import Layout from '../../components/layout/Layout';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import ContractDetailPanel from './ContractDetailPanel';
import styles from './ContractListPage.module.css';

// 실제 API insuranceType 값은 한글 문자열. type 파라미터 enum 값은 미확인 (FE-CONTRACT-04)
const CONTRACT_TYPES = [
  { value: '', label: '전체' },
];

function dday(days) {
  if (days == null || days < 0) return null;
  if (days <= 30) return `D-${days}`;
  return null;
}

export default function ContractListPage() {
  const [type, setType] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(15);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedNo, setSelectedNo] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchContracts({ type, page, size })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [type, page, size]);

  function handleTypeChange(e) {
    setType(e.target.value);
    setPage(0);
    setSelectedNo(null);
  }

  function handleRowClick(contractNo) {
    setSelectedNo((prev) => (prev === contractNo ? null : contractNo));
  }

  const items = data?.items ?? data?.content ?? [];
  const total = data?.total ?? data?.totalElements ?? 0;

  return (
    <Layout title="계약 조회">
      <div className={styles.root}>
        <div className={styles.tableArea}>
          <div className={styles.toolbar}>
            <div className={styles.filters}>
              <label className={styles.filterLabel}>보험종류</label>
              <select className={styles.select} value={type} onChange={handleTypeChange}>
                {CONTRACT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <span className={styles.totalCount}>
              {total > 0 ? `총 ${total.toLocaleString()}건` : ''}
            </span>
          </div>

          {error && (
            <div className={styles.errorBox}>
              <strong>오류:</strong> {error}
            </div>
          )}

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>계약번호</th>
                  <th>고객명</th>
                  <th>보험종류</th>
                  <th>상태</th>
                  <th>보험료</th>
                  <th>만기일</th>
                  <th>연체</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={7} className={styles.msgCell}>불러오는 중…</td>
                  </tr>
                )}
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={7} className={styles.msgCell}>조회된 계약이 없습니다.</td>
                  </tr>
                )}
                {!loading && items.map((item) => {
                  const dd = dday(item.daysUntilExpiry);
                  const isSelected = selectedNo === item.contractNo;
                  return (
                    <tr
                      key={item.contractNo}
                      className={`${styles.row} ${isSelected ? styles.selectedRow : ''}`}
                      onClick={() => handleRowClick(item.contractNo)}
                    >
                      <td className={styles.mono}>{item.contractNo}</td>
                      <td>{item.customerName ?? '-'}</td>
                      <td>{item.insuranceType ?? '-'}</td>
                      <td><StatusBadge status={item.status} /></td>
                      <td className={styles.right}>
                        {item.monthlyPremium != null ? `${item.monthlyPremium.toLocaleString()}원` : '-'}
                      </td>
                      <td>
                        <span>{item.endDate ?? '-'}</span>
                        {dd && <span className={styles.ddayBadge}>{dd}</span>}
                      </td>
                      <td>
                        {item.isOverdue
                          ? <span className={styles.overdueText}>연체</span>
                          : <span className={styles.normalText}>-</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {total > 0 && (
            <Pagination page={page} size={size} total={total} onChange={setPage} />
          )}
        </div>

        {selectedNo && (
          <ContractDetailPanel
            contractNo={selectedNo}
            onClose={() => setSelectedNo(null)}
          />
        )}
      </div>
    </Layout>
  );
}
