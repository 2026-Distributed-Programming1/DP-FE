import { useEffect, useState } from 'react';
import { fetchSalesActivities } from '../../api/salesActivities';
import Layout from '../../components/layout/Layout';
import styles from './SalesActivityListPage.module.css';

const CHANNEL_TYPES = [
  { value: '', label: '전체 채널' },
  { value: 'DIRECT', label: '직영 영업' },
  { value: 'AGENCY', label: '대리점' },
  { value: 'BROKER', label: '브로커' },
  { value: 'ONLINE', label: '온라인' },
  { value: 'BANCASSURANCE', label: '방카슈랑스' },
];

const PERIOD_OPTIONS = [
  { value: 30, label: '최근 30일' },
  { value: 90, label: '이번 분기' },
  { value: 365, label: '올해 전체' },
];

function dateAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

const STATUS_LABEL = { Good: 'Good', Active: 'Active', 'At Risk': 'At Risk', Critical: 'Critical' };
const STATUS_CLASS = { Good: 'statusGood', Active: 'statusActive', 'At Risk': 'statusAtRisk', Critical: 'statusCritical' };

function getStatus(item) {
  const rate = item.conversionRate ?? 0;
  if (rate >= 20) return 'Good';
  if (rate >= 12) return 'Active';
  if (rate >= 6) return 'At Risk';
  return 'Critical';
}

export default function SalesActivityListPage() {
  const [periodDays, setPeriodDays] = useState(30);
  const [channelType, setChannelType] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  function load() {
    setLoading(true);
    const startDate = dateAgo(periodDays);
    fetchSalesActivities({ startDate, endDate: today(), channelType, page: 0, size: 50 })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const items = data?.items ?? data?.content ?? [];
  const total = data?.total ?? data?.totalElements ?? items.length;

  const totalContracts = items.reduce((s, i) => s + (i.contractCount ?? 0), 0);
  const totalVisits = items.reduce((s, i) => s + (i.visitCount ?? 0), 0);
  const avgConversion = items.length > 0
    ? (items.reduce((s, i) => s + (i.conversionRate ?? 0), 0) / items.length).toFixed(1)
    : '0.0';
  const atRiskCount = items.filter((i) => {
    const s = getStatus(i);
    return s === 'At Risk' || s === 'Critical';
  }).length;

  return (
    <Layout title="영업활동 관리">
      <div className={styles.page}>
        {/* Header + Filters */}
        <div className={styles.topRow}>
          <div>
            <h1 className={styles.pageTitle}>영업 활동 관리</h1>
            <p className={styles.pageSub}>실시간 채널별 성과 및 목표 달성 현황을 분석합니다.</p>
          </div>
          <div className={styles.filterPanel}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>기간 설정</span>
              <select
                className={styles.filterSelect}
                value={periodDays}
                onChange={(e) => setPeriodDays(Number(e.target.value))}
              >
                {PERIOD_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>채널 유형</span>
              <select
                className={styles.filterSelect}
                value={channelType}
                onChange={(e) => setChannelType(e.target.value)}
              >
                {CHANNEL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <button className={styles.filterBtn} onClick={load}>
              필터 적용
            </button>
          </div>
        </div>

        {/* Bento Grid */}
        <div className={styles.bentoGrid}>
          {/* Performance Table */}
          <div className={`${styles.glassCard} ${styles.spanLarge}`}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>채널별 성과 리포트</h2>
              <span className={styles.totalBadge}>총 {total}건</span>
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>채널명</th>
                    <th>방문 수</th>
                    <th>계약 수</th>
                    <th>전환율</th>
                    <th className={styles.thCenter}>목표 상태</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan={5} className={styles.msgCell}>불러오는 중…</td></tr>
                  )}
                  {!loading && items.length === 0 && (
                    <tr><td colSpan={5} className={styles.msgCell}>조회된 영업활동이 없습니다.</td></tr>
                  )}
                  {!loading && items.map((item, i) => {
                    const status = getStatus(item);
                    return (
                      <tr key={item.managementNo ?? i} className={styles.tableRow}>
                        <td className={styles.tdBold}>{item.channelName ?? item.channelType ?? '-'}</td>
                        <td>{(item.visitCount ?? 0).toLocaleString()}</td>
                        <td>{(item.contractCount ?? 0).toLocaleString()}</td>
                        <td>{item.conversionRate != null ? `${item.conversionRate}%` : '-'}</td>
                        <td className={styles.tdCenter}>
                          <span className={`${styles.badge} ${styles[STATUS_CLASS[status]]}`}>
                            {STATUS_LABEL[status]}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Visual Cards */}
          <div className={`${styles.glassCard} ${styles.spanSmall} ${styles.promoCard}`}>
            <p className={styles.promoLabel}>예상 수익 계산기</p>
            <h3 className={styles.promoTitle}>실시간 손익 시뮬레이션</h3>
            <button className={styles.promoLink}>시작하기 →</button>
            <div className={styles.promoEmoji}>🧮</div>
          </div>

          <div className={`${styles.glassCard} ${styles.spanSmall} ${styles.promoCard2}`}>
            <p className={styles.promoLabel}>차량 보험 연계</p>
            <h3 className={styles.promoTitle}>신규 영업 기회</h3>
            <span className={styles.promoBadge}>24개의 신규 잠재고객</span>
            <div className={styles.promoEmoji}>🚗</div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={`${styles.statIconWrap} ${styles.statIconGreen}`}>📊</div>
            <div>
              <p className={styles.statLabel}>평균 전환율</p>
              <h4 className={styles.statValue}>{avgConversion}%</h4>
              <p className={styles.statTrend}>실적 기반 산출</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIconWrap} ${styles.statIconSecondary}`}>📋</div>
            <div>
              <p className={styles.statLabel}>총 계약 수</p>
              <h4 className={styles.statValue}>{totalContracts.toLocaleString()}건</h4>
              <p className={styles.statMuted}>전체 집계</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIconWrap} ${styles.statIconTertiary}`}>👥</div>
            <div>
              <p className={styles.statLabel}>총 방문 수</p>
              <h4 className={styles.statValue}>{totalVisits.toLocaleString()}건</h4>
              <p className={styles.statMuted}>기간 내 합계</p>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={`${styles.statIconWrap} ${styles.statIconError}`}>⚠️</div>
            <div>
              <p className={styles.statLabel}>리스크 경보</p>
              <h4 className={styles.statValue}>{atRiskCount}개 채널</h4>
              <p className={styles.statError}>즉각적 조치 필요</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
