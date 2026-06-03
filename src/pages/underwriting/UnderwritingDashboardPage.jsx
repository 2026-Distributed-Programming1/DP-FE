import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { fetchUnderwritingPending } from '../../api/underwriting';
import styles from './UnderwritingDashboardPage.module.css';

const STATUS_COLORS = {
  IN_REVIEW: { label: 'In Review', cls: 'secondary' },
  LOW_RISK: { label: 'Low Risk', cls: 'success' },
  ACTION_NEEDED: { label: 'Action Needed', cls: 'error' },
};

export default function UnderwritingDashboardPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchUnderwritingPending()
      .then((data) => setItems(Array.isArray(data) ? data : data?.items ?? data?.content ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const waitQueue = items.filter((i) => i.stage !== 'APPROVED' && i.stage !== 'REJECTED').length;
  const approved = items.filter((i) => i.stage === 'APPROVED').length;
  const highRisk = items.filter((i) => i.stage === 'INELIGIBLE').length;

  return (
    <Layout title="인수심사 대시보드">
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <h2 className={styles.pageTitle}>Underwriting Dashboard</h2>
            <p className={styles.pageSubtitle}>Reviewing real-time policy applications and risk profiles.</p>
          </div>
          <button className={styles.btnPrimary}>+ New Assessment</button>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>📋</div>
            <div>
              <div className={styles.statNum}>{loading ? '…' : waitQueue}</div>
              <div className={styles.statLabel}>Wait Queue</div>
            </div>
          </div>
          <div className={`${styles.statCard} ${styles.statCardAccent}`}>
            <div className={styles.statIcon}>✅</div>
            <div>
              <div className={`${styles.statNum} ${styles.numGreen}`}>{loading ? '…' : approved}</div>
              <div className={styles.statLabel}>Approved Today</div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>⚠️</div>
            <div>
              <div className={`${styles.statNum} ${styles.numRed}`}>{loading ? '…' : highRisk}</div>
              <div className={styles.statLabel}>High Risk Flagged</div>
            </div>
          </div>
        </div>

        <div className={styles.mainGrid}>
          <div className={styles.applicationsCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Active Applications</h3>
              <button className={styles.linkBtn}>View All</button>
            </div>
            <div className={styles.applicationList}>
              {loading && <div className={styles.loadingMsg}>불러오는 중…</div>}
              {!loading && items.length === 0 && (
                <div className={styles.emptyMsg}>심사 데이터가 없습니다.</div>
              )}
              {!loading && items.slice(0, 5).map((item, idx) => (
                <div key={item.applicationNo ?? idx} className={styles.appItem}>
                  <div className={styles.appItemLeft}>
                    <div className={styles.appItemIcon}>📄</div>
                    <div>
                      <div className={styles.appItemName}>{item.productName ?? item.productType ?? '보험 상품'}</div>
                      <div className={styles.appItemSub}>
                        Applicant: {item.customerName ?? '-'} · {(item.applicationDate ?? item.createdAt ?? '').slice(0, 10)}
                      </div>
                    </div>
                  </div>
                  <div className={styles.appItemRight}>
                    <span className={styles.reviewBadge}>In Review</span>
                    <button className={styles.moreBtn}>⋯</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.trendsCard}>
            <h3 className={styles.cardTitle}>Market Trends</h3>
            <div className={styles.approvalRateBox}>
              <div className={styles.approvalRateHeader}>
                <span className={styles.approvalRateLabel}>Approval Rate</span>
                <span className={styles.approvalRateValue}>92%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '92%' }} />
              </div>
              <p className={styles.approvalRateNote}>+4% since last quarter. Higher efficiency in automated screening.</p>
            </div>
            <div className={styles.systemHealth}>
              <h4 className={styles.systemHealthTitle}>System Health</h4>
              <div className={styles.healthItem}>
                <div className={styles.healthDot} />
                <span>AI Model Beta-9</span>
                <span className={styles.healthStatus}>Operational</span>
              </div>
              <div className={styles.healthItem}>
                <div className={styles.healthDot} />
                <span>Data Sync Engine</span>
                <span className={styles.healthStatus}>Stable</span>
              </div>
            </div>
            <div className={styles.tipBox}>
              <span className={styles.tipIcon}>💡</span>
              <div>
                <div className={styles.tipTitle}>Smart Tip</div>
                <div className={styles.tipText}>Focus on pending auto policies first to meet daily goals.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
