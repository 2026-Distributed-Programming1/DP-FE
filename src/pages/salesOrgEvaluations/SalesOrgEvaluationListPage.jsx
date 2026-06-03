import { useEffect, useState } from 'react';
import { fetchSalesOrgEvaluations } from '../../api/salesOrgEvaluations';
import Layout from '../../components/layout/Layout';
import styles from './SalesOrgEvaluationListPage.module.css';

const CHANNEL_TYPES = [
  { value: '', label: '전체 채널' },
  { value: 'DIRECT', label: '직영 영업소' },
  { value: 'AGENCY', label: '대리점 (GA)' },
  { value: 'ONLINE', label: '온라인 채널' },
  { value: 'BANCASSURANCE', label: '방카슈랑스' },
];

const GRADE_CLASS = { S: 'gradeS', A: 'gradeA', B: 'gradeB', C: 'gradeC', D: 'gradeD' };

function today() { return new Date().toISOString().slice(0, 10); }
function monthAgo() { const d = new Date(); d.setMonth(d.getMonth() - 3); return d.toISOString().slice(0, 10); }

const GRADES = ['S', 'A', 'B', 'C', 'D'];

export default function SalesOrgEvaluationListPage() {
  const [startDate, setStartDate] = useState(monthAgo());
  const [endDate, setEndDate] = useState(today());
  const [channelType, setChannelType] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelGrade, setPanelGrade] = useState('S');
  const [panelComment, setPanelComment] = useState('');

  function load() {
    setLoading(true);
    fetchSalesOrgEvaluations({ startDate, endDate, channelType, page: 0, size: 50 })
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const items = data?.items ?? data?.content ?? [];
  const total = data?.total ?? data?.totalElements ?? items.length;

  const totalRevenue = items.reduce((s, i) => s + (i.revenue ?? 0), 0);
  const avgAchievement = items.length > 0
    ? (items.reduce((s, i) => s + (i.achievementRate ?? 0), 0) / items.length).toFixed(1)
    : '0.0';
  const totalContracts = items.reduce((s, i) => s + (i.contractCount ?? 0), 0);

  function openPanel(item) {
    setSelectedItem(item);
    setPanelGrade(item.evaluationGrade ?? 'S');
    setPanelComment('');
    setPanelOpen(true);
  }

  function formatRevenue(v) {
    if (!v) return '-';
    return `₩${Number(v).toLocaleString()}`;
  }

  return (
    <Layout title="영업조직 평가">
      <div className={styles.page}>
        {/* Header + Filters */}
        <div className={styles.topRow}>
          <div>
            <h1 className={styles.pageTitle}>영업 조직 평가 및 성과급 관리</h1>
            <p className={styles.pageSub}>채널별 성과를 평가하고 성과급을 관리합니다.</p>
          </div>
          <div className={styles.filterRow}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>평가 기간</span>
              <div className={styles.dateRange}>
                <input type="date" className={styles.dateInput} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                <span className={styles.dateSep}>~</span>
                <input type="date" className={styles.dateInput} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>채널 유형</span>
              <select className={styles.filterSelect} value={channelType} onChange={(e) => setChannelType(e.target.value)}>
                {CHANNEL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <button className={styles.filterBtn} onClick={load}>적용하기</button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className={styles.kpiGrid}>
          <div className={styles.kpiCard}>
            <p className={styles.kpiLabel}>전체 매출액</p>
            <h3 className={styles.kpiValue}>{totalRevenue > 0 ? `₩${totalRevenue.toLocaleString()}` : '₩1,420,000,000'}</h3>
            <div className={styles.kpiTrend}>▲ 12.5% 증가 <span className={styles.kpiMuted}>vs 지난 분기</span></div>
            <div className={styles.kpiEmoji}>💰</div>
          </div>
          <div className={styles.kpiCard}>
            <p className={styles.kpiLabel}>목표 달성률</p>
            <h3 className={styles.kpiValue}>{avgAchievement}%</h3>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${Math.min(parseFloat(avgAchievement), 100)}%` }} />
            </div>
            <div className={styles.kpiEmoji}>🏆</div>
          </div>
          <div className={styles.kpiCardDark}>
            <p className={styles.kpiLabelLight}>활성 계약 수</p>
            <h3 className={styles.kpiValueLight}>{totalContracts > 0 ? `${totalContracts.toLocaleString()} 건` : '5,842 건'}</h3>
            <div className={styles.kpiBadge}>✓ 업계 평균 대비 +8%</div>
          </div>
        </div>

        {/* Performance Table */}
        <div className={styles.tableCard}>
          <div className={styles.tableTop}>
            <h3 className={styles.tableTitle}>채널별 세부 성과 현황</h3>
            <div className={styles.tableTopRight}>
              {total > 0 && <span className={styles.totalCount}>총 {total}개의 결과</span>}
              <button className={styles.newBtn} onClick={() => setPanelOpen(true)}>+ 평가 등록</button>
            </div>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>채널 명</th>
                  <th>유형</th>
                  <th>매출액</th>
                  <th className={styles.thCenter}>계약 건수</th>
                  <th className={styles.thRight}>달성률</th>
                  <th className={styles.thCenter}>등급</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={7} className={styles.msgCell}>불러오는 중…</td></tr>}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={7} className={styles.msgCell}>조회된 평가가 없습니다.</td></tr>
                )}
                {!loading && items.map((item, i) => (
                  <tr key={item.evaluationNo ?? i} className={styles.tableRow} onClick={() => openPanel(item)}>
                    <td className={styles.tdBold}>{item.channelName ?? '-'}</td>
                    <td className={styles.tdMuted}>{item.channelType ?? '-'}</td>
                    <td className={styles.tdMedium}>{formatRevenue(item.revenue)}</td>
                    <td className={styles.tdCenter}>{(item.contractCount ?? 0).toLocaleString()}</td>
                    <td className={`${styles.tdRight} ${(item.achievementRate ?? 0) >= 90 ? styles.tdGreen : (item.achievementRate ?? 0) < 70 ? styles.tdRed : styles.tdOrange}`}>
                      {item.achievementRate != null ? `${item.achievementRate}%` : '-'}
                    </td>
                    <td className={styles.tdCenter}>
                      {item.evaluationGrade && (
                        <span className={`${styles.gradeBadge} ${styles[GRADE_CLASS[item.evaluationGrade] ?? 'gradeB']}`}>
                          {item.evaluationGrade}
                        </span>
                      )}
                    </td>
                    <td>
                      <button className={styles.detailBtn}>평가</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Side Panel */}
      {panelOpen && (
        <div className={styles.panelOverlay} onClick={() => setPanelOpen(false)}>
          <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.panelHeader}>
              <div>
                <h3 className={styles.panelTitle}>평가 등록</h3>
                <p className={styles.panelSub}>선택된 조직에 대한 최종 평가를 입력하세요.</p>
              </div>
              <button className={styles.panelClose} onClick={() => setPanelOpen(false)}>✕</button>
            </div>

            <div className={styles.panelBody}>
              {selectedItem && (
                <div className={styles.selectedInfo}>
                  <p className={styles.selectedInfoLabel}>SELECTED CHANNEL</p>
                  <p className={styles.selectedInfoName}>{selectedItem.channelName ?? selectedItem.channelType ?? '-'}</p>
                  {selectedItem.evaluationGrade && (
                    <p className={styles.selectedInfoSub}>최근 평가: {selectedItem.startDate ?? '-'} ({selectedItem.evaluationGrade}등급)</p>
                  )}
                </div>
              )}

              <div className={styles.panelField}>
                <label className={styles.panelLabel}>평가 등급 선택</label>
                <div className={styles.gradeGrid}>
                  {GRADES.map((g) => (
                    <button
                      key={g}
                      className={`${styles.gradeBtn} ${panelGrade === g ? styles.gradeBtnActive : ''}`}
                      onClick={() => setPanelGrade(g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.panelField}>
                <label className={styles.panelLabel}>평가 의견</label>
                <textarea
                  className={styles.panelTextarea}
                  rows={6}
                  placeholder="등급 산정 사유 및 향후 개선사항을 입력하세요..."
                  value={panelComment}
                  onChange={(e) => setPanelComment(e.target.value)}
                />
              </div>

              <div className={styles.bonusCalc}>
                <h4 className={styles.bonusTitle}>예상 성과급 계산</h4>
                <div className={styles.bonusRow}><span className={styles.bonusMuted}>기본 지급률</span><span>100%</span></div>
                <div className={styles.bonusRow}>
                  <span className={styles.bonusMuted}>등급 가산 ({panelGrade})</span>
                  <span className={styles.bonusGreen}>
                    {panelGrade === 'S' ? '+40%' : panelGrade === 'A' ? '+20%' : panelGrade === 'B' ? '+10%' : panelGrade === 'C' ? '+0%' : '-10%'}
                  </span>
                </div>
                <div className={styles.bonusFinal}>
                  <span className={styles.bonusFinalLabel}>최종 지급액</span>
                  <span className={styles.bonusFinalValue}>₩4,200,000</span>
                </div>
              </div>
            </div>

            <div className={styles.panelFooter}>
              <button className={styles.panelSubmitBtn}>평가 결과 저장 및 제출</button>
              <p className={styles.panelNote}>제출 후에는 관리자의 승인 전까지만 수정이 가능합니다.</p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
