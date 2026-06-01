import { useEffect, useState } from 'react';
import { fetchSalesActivities } from '../../api/salesActivities';
import Layout from '../../components/layout/Layout';
import Pagination from '../../components/common/Pagination';
import styles from './SalesActivityListPage.module.css';

// FE-SALES-11: ChannelType enum 하드코딩
const CHANNEL_TYPES = [
  { value: '', label: '전체 채널' },
  { value: 'DIRECT', label: '직접' },
  { value: 'AGENCY', label: '대리점' },
  { value: 'BROKER', label: '브로커' },
  { value: 'ONLINE', label: '온라인' },
  { value: 'BANCASSURANCE', label: '방카슈랑스' },
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function monthAgo() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}

export default function SalesActivityListPage() {
  const [startDate, setStartDate] = useState(monthAgo());
  const [endDate, setEndDate] = useState(today());
  const [channelType, setChannelType] = useState('');
  const [page, setPage] = useState(0);
  const [size] = useState(15);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchSalesActivities({ startDate, endDate, channelType, page, size })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [startDate, endDate, channelType, page, size]);

  function handleSearch() {
    setPage(0);
  }

  function handleChannelChange(e) {
    setChannelType(e.target.value);
    setPage(0);
  }

  const items = data?.items ?? data?.content ?? [];
  const total = data?.total ?? data?.totalElements ?? 0;

  return (
    <Layout title="영업활동 관리">
      <div className={styles.root}>
        <div className={styles.tableArea}>
          <div className={styles.toolbar}>
            <div className={styles.filters}>
              <input
                type="date"
                className={styles.dateInput}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span className={styles.dateSep}>~</span>
              <input
                type="date"
                className={styles.dateInput}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <select className={styles.select} value={channelType} onChange={handleChannelChange}>
                {CHANNEL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <button className={styles.searchBtn} onClick={handleSearch}>조회</button>
            </div>
            <span className={styles.totalCount}>{total > 0 ? `총 ${total.toLocaleString()}건` : ''}</span>
          </div>

          {error && <div className={styles.errorBox}><strong>오류:</strong> {error}</div>}

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>활동번호</th>
                  <th>채널유형</th>
                  <th>채널명</th>
                  <th>활동유형</th>
                  <th>시작일</th>
                  <th>종료일</th>
                  <th>등록일</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} className={styles.msgCell}>불러오는 중…</td></tr>
                )}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={7} className={styles.msgCell}>조회된 영업활동이 없습니다.</td></tr>
                )}
                {!loading && items.map((item) => (
                  <tr key={item.managementNo ?? item.id} className={styles.row}>
                    <td className={styles.mono}>{item.managementNo ?? item.id ?? '-'}</td>
                    <td>{item.channelType ?? '-'}</td>
                    <td>{item.channelName ?? '-'}</td>
                    <td>{item.activityType ?? '-'}</td>
                    <td>{item.startDate ?? '-'}</td>
                    <td>{item.endDate ?? '-'}</td>
                    <td>{item.createdAt ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {total > 0 && (
            <Pagination page={page} size={size} total={total} onChange={setPage} />
          )}
        </div>
      </div>
    </Layout>
  );
}
