import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import styles from './PaymentDetailPage.module.css';

const MOCK_DETAIL = {
  'TX-90123': {
    customerName: '이정민',
    productName: '종합 건강 실손 보험',
    policyNo: 'KA-2024-00192837',
    paymentDate: '2023년 10월 24일',
    serialNo: 'PAY-992-X2',
    paymentMethod: '신용카드 (현대 4421-****)',
    amount: '₩ 125,000',
    installment: '12회차',
    installmentType: '정기납',
    overdueFee: '₩ 0 (미발생)',
    approvalNo: 'AUTH-8827103',
    status: 'approved',
  },
  'TX-90122': {
    customerName: '박서준',
    productName: '초간편 운전자 보험',
    policyNo: 'KA-2023-00548821',
    paymentDate: '2023년 10월 23일',
    serialNo: 'PAY-991-Y7',
    paymentMethod: '계좌이체 (국민 ****-1234)',
    amount: '₩ 45,000',
    installment: '8회차',
    installmentType: '정기납',
    overdueFee: '₩ 2,300',
    approvalNo: '-',
    status: 'pending',
  },
  'TX-90121': {
    customerName: '최지우',
    productName: '무배당 연금보험',
    policyNo: 'KA-2022-00087312',
    paymentDate: '2023년 10월 22일',
    serialNo: 'PAY-990-Z1',
    paymentMethod: '간편결제 (카카오페이)',
    amount: '₩ 350,000',
    installment: '24회차',
    installmentType: '정기납',
    overdueFee: '₩ 0 (미발생)',
    approvalNo: 'AUTH-7712044',
    status: 'approved',
  },
  'TX-90120': {
    customerName: '정해인',
    productName: '화재 배상 책임 보험',
    policyNo: 'KA-2021-00334455',
    paymentDate: '2023년 10월 22일',
    serialNo: 'PAY-989-A3',
    paymentMethod: '신용카드 (신한 5533-****)',
    amount: '₩ 88,200',
    installment: '36회차',
    installmentType: '정기납',
    overdueFee: '₩ 0 (미발생)',
    approvalNo: 'AUTH-6633921',
    status: 'approved',
  },
};

const STATUS_META = {
  pending: {
    icon: '⏳',
    iconCls: 'iconPending',
    label: '승인 대기 중',
    desc: '해당 결제 내역은 현재 데이터 검증 단계에 있습니다. 원장 반영을 확인해 주세요.',
  },
  approved: {
    icon: '✅',
    iconCls: 'iconApproved',
    label: '승인 완료',
    desc: '결제가 정상적으로 처리되어 원장에 반영되었습니다.',
  },
};

export default function PaymentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const detail = MOCK_DETAIL[id] ?? Object.values(MOCK_DETAIL)[0];
  const statusMeta = STATUS_META[detail.status];

  return (
    <Layout title="수납 상세 정보">
      <div className={styles.page}>
        <header className={styles.pageHeader}>
          <div className={styles.headerTitle}>
            <h1 className={styles.title}>수납 상세 정보</h1>
            <p className={styles.subtitle}>납입 내역 확인 및 결제 상태 업데이트</p>
          </div>
          <button className={styles.backBtn} onClick={() => navigate('/payment-records')}>
            ← 목록으로 돌아가기
          </button>
        </header>

        <div className={styles.grid}>
          {/* Left: Detail Info */}
          <section className={styles.detailCard}>
            <div className={styles.detailCardHeader}>
              <h3 className={styles.cardTitle}>결제 정보 상세</h3>
              <span className={styles.contractStatus}>✔ 보험계약 정상</span>
            </div>

            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <p className={styles.fieldLabel}>고객 성함</p>
                <p className={styles.fieldValue}>{detail.customerName}</p>
              </div>
              <div className={styles.field}>
                <p className={styles.fieldLabel}>보험 상품명</p>
                <p className={styles.fieldValue}>{detail.productName}</p>
              </div>
              <div className={styles.field}>
                <p className={styles.fieldLabel}>증권 번호</p>
                <p className={`${styles.fieldValue} ${styles.mono}`}>{detail.policyNo}</p>
              </div>
              <div className={styles.field}>
                <p className={styles.fieldLabel}>납입 일자</p>
                <p className={styles.fieldValue}>{detail.paymentDate}</p>
              </div>
              <div className={styles.field}>
                <p className={styles.fieldLabel}>수납 일련번호</p>
                <p className={styles.fieldValue}>{detail.serialNo}</p>
              </div>
              <div className={styles.field}>
                <p className={styles.fieldLabel}>결제 수단</p>
                <p className={styles.fieldValue}>💳 {detail.paymentMethod}</p>
              </div>
              <div className={styles.field}>
                <p className={styles.fieldLabel}>실제 납부 금액</p>
                <p className={styles.amountValue}>{detail.amount}</p>
              </div>
              <div className={styles.field}>
                <p className={styles.fieldLabel}>납입 회차</p>
                <div className={styles.installmentRow}>
                  <p className={styles.fieldValue}>{detail.installment}</p>
                  <span className={styles.installmentBadge}>{detail.installmentType}</span>
                </div>
              </div>
              <div className={styles.field}>
                <p className={styles.fieldLabel}>연체 이자</p>
                <p className={`${styles.fieldValue} ${detail.overdueFee !== '₩ 0 (미발생)' ? styles.errorText : ''}`}>
                  {detail.overdueFee}
                </p>
              </div>
              <div className={styles.field}>
                <p className={styles.fieldLabel}>승인 번호</p>
                <p className={styles.fieldValue}>{detail.approvalNo}</p>
              </div>
            </div>
          </section>

          {/* Right: Actions */}
          <aside className={styles.rightPanel}>
            <div className={styles.statusCard}>
              <div className={`${styles.statusIcon} ${styles[statusMeta.iconCls]}`}>
                {statusMeta.icon}
              </div>
              <h4 className={styles.statusLabel}>{statusMeta.label}</h4>
              <p className={styles.statusDesc}>{statusMeta.desc}</p>
              <div className={styles.actionBtns}>
                <button className={styles.btnPrimary}>승인 및 원장 업데이트</button>
                <button className={styles.btnOutline}>수납 반려</button>
                <button className={styles.btnLink}>결제 이력 상세보기</button>
              </div>
            </div>

            <div className={styles.noticeCard}>
              <div className={styles.noticeContent}>
                <span className={styles.noticeIcon}>ℹ️</span>
                <div>
                  <p className={styles.noticeTitle}>시스템 알림</p>
                  <p className={styles.noticeText}>
                    원장 업데이트 완료 시, 고객님께 카카오 알림톡 및 LMS가 자동으로 발송됩니다.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </Layout>
  );
}
