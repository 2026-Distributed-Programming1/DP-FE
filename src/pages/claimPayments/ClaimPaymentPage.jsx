import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { fetchClaims } from '../../api/claims';
import styles from './ClaimPaymentPage.module.css';

const COVERAGE_ITEMS = [
  { name: '차량 수리비', sub: '엔진룸 및 범퍼 파손', limit: '보험가액 한도', claimed: '₩ 8,500,000', approved: '₩ 8,500,000', status: '전액 인정', statusCls: 'green' },
  { name: '대차료 (렌트)', sub: '동급 차종 5일 기준', limit: '실비 보상', claimed: '₩ 1,200,000', approved: '₩ 950,000', status: '부분 조정', statusCls: 'secondary' },
  { name: '차량 가치 하락', sub: '출고 1년 미만 신차', limit: '수리비의 20%', claimed: '₩ 3,000,000', approved: '₩ 3,000,000', status: '전액 인정', statusCls: 'green' },
];

export default function ClaimPaymentPage() {
  const [claims, setClaims] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchClaims({ page: 0, size: 10 })
      .then((data) => {
        const list = data?.items ?? data?.content ?? (Array.isArray(data) ? data : []);
        setClaims(list);
        if (list.length > 0) setSelected(list[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout title="보험금 지급">
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <div className={styles.badge}>✅ 보상 청구 심사 중</div>
            <h2 className={styles.pageTitle}>보험금 산정 및 정산 상세</h2>
            <p className={styles.pageSubtitle}>
              사건 번호: #{selected?.claimNo ?? 'CL-2024-0892'} | {selected?.customerName ?? '김철수'} 고객님
            </p>
          </div>
          <div className={styles.headerActions}>
            <button className={styles.btnOutline}>임시 저장</button>
            <button className={styles.btnPrimary}>최종 승인 및 지급</button>
          </div>
        </div>

        <div className={styles.topGrid}>
          <div className={styles.caseSummaryCard}>
            <div className={styles.caseIcon}>⚖️</div>
            <div className={styles.caseInfo}>
              <h3 className={styles.sectionTitle}>사건 개요 및 현황</h3>
              <div className={styles.caseGrid}>
                <div>
                  <p className={styles.fieldLabel}>사고 유형</p>
                  <p className={styles.fieldValue}>{selected?.claimType ?? '자동차 대물 배상'}</p>
                </div>
                <div>
                  <p className={styles.fieldLabel}>사고 일시</p>
                  <p className={styles.fieldValue}>{selected?.accidentDate ?? '2024년 05월 12일 14:30'}</p>
                </div>
                <div>
                  <p className={styles.fieldLabel}>피보험자</p>
                  <p className={styles.fieldValue}>{selected?.customerName ?? '김철수'}</p>
                </div>
                <div>
                  <p className={styles.fieldLabel}>가입 상품</p>
                  <p className={styles.fieldValue}>Kindred 안심 자동차 보험 V3</p>
                </div>
              </div>
              <div className={styles.caseNote}>
                "교차로 진입 시 상대 차량의 신호 위반으로 인한 측면 충돌 사고. 과실 비율 협의 완료 및 차량 파손 부위 견적 확인됨."
              </div>
            </div>
          </div>

          <div className={styles.paymentCard}>
            <h3 className={styles.paymentLabel}>최종 지급 예정 금액</h3>
            <p className={styles.paymentSub}>총 손해 사정액</p>
            <p className={styles.paymentAmount}>₩ 12,450,000</p>
            <div className={styles.paymentBreakdown}>
              <div className={styles.paymentRow}>
                <span>기지급액</span>
                <span>₩ 0</span>
              </div>
              <div className={styles.paymentRow}>
                <span>자기부담금</span>
                <span className={styles.deduction}>- ₩ 200,000</span>
              </div>
              <div className={`${styles.paymentRow} ${styles.paymentTotal}`}>
                <span>실제 지급액</span>
                <span className={styles.totalAmount}>₩ 12,250,000</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.faultCard}>
          <div className={styles.faultHeader}>
            <h3 className={styles.sectionTitle}>과실 비율 조정</h3>
            <span className={styles.agreedBadge}>협의 완료 (2024.05.15)</span>
          </div>
          <div className={styles.faultBars}>
            <div className={styles.faultBar}>
              <div className={styles.faultBarLabel}>
                <span>피보험자 (김철수)</span>
                <span className={styles.faultPct}>20%</span>
              </div>
              <div className={styles.barTrack}>
                <div className={`${styles.barFill} ${styles.barGreen}`} style={{ width: '20%' }} />
              </div>
            </div>
            <div className={styles.faultBar}>
              <div className={styles.faultBarLabel}>
                <span>상대방 (이영희)</span>
                <span className={styles.faultPct2}>80%</span>
              </div>
              <div className={styles.barTrack}>
                <div className={`${styles.barFill} ${styles.barSecondary}`} style={{ width: '80%' }} />
              </div>
            </div>
          </div>
          <div className={styles.faultNote}>
            ℹ️ 신호 위반 및 과속 주행 근거로 상대방 과실 80% 확정. 블랙박스 영상 분석 결과 반영됨.
          </div>
        </div>

        <div className={styles.tableCard}>
          <div className={styles.tableCardHeader}>
            <h3 className={styles.sectionTitle}>보장 범위 및 약관 분석</h3>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>보장 항목</th>
                  <th>보상 한도</th>
                  <th>신청 금액</th>
                  <th>인정 금액</th>
                  <th>상태</th>
                </tr>
              </thead>
              <tbody>
                {COVERAGE_ITEMS.map((item, i) => (
                  <tr key={i} className={styles.tableRow}>
                    <td>
                      <p className={styles.itemName}>{item.name}</p>
                      <p className={styles.itemSub}>{item.sub}</p>
                    </td>
                    <td>{item.limit}</td>
                    <td>{item.claimed}</td>
                    <td className={styles.boldCell}>{item.approved}</td>
                    <td>
                      <span className={`${styles.statusBadge} ${styles[`badge_${item.statusCls}`]}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.tableFootnote}>
            ℹ️ 렌트 비용은 표준 요금제 가이드라인에 따라 소폭 조정되었습니다.
          </div>
        </div>

        <div className={styles.logicGrid}>
          <div className={styles.logicCard}>
            <p className={styles.logicLabel}>기초 손해액</p>
            <p className={styles.logicAmount}>₩ 12,450,000</p>
            <p className={styles.logicNote}>수리비 + 렌트비 + 가치하락</p>
          </div>
          <div className={styles.logicCard}>
            <p className={styles.logicLabel}>과실 상계 (20%)</p>
            <p className={`${styles.logicAmount} ${styles.amountRed}`}>- ₩ 0</p>
            <p className={styles.logicNote}>상대 100% 과실 적용 (특약)</p>
          </div>
          <div className={styles.logicCard}>
            <p className={styles.logicLabel}>자기부담금</p>
            <p className={`${styles.logicAmount} ${styles.amountRed}`}>- ₩ 200,000</p>
            <p className={styles.logicNote}>고객 선택 최소 금액</p>
          </div>
          <div className={`${styles.logicCard} ${styles.logicCardPrimary}`}>
            <p className={styles.logicLabel}>최종 지급액</p>
            <p className={styles.logicAmount}>₩ 12,250,000</p>
            <p className={styles.logicNote}>2024.05.20 지급 예정</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
