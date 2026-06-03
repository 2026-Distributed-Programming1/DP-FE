import { useEffect, useState } from 'react';
import { fetchInquiries } from '../../api/inquiries';
import Layout from '../../components/layout/Layout';
import styles from './InquiryListPage.module.css';

const STATUS_LABEL = { PENDING: '대기', IN_PROGRESS: '진행 중', ANSWERED: '답변완료', CLOSED: '종료' };
const STATUS_CLASS = { PENDING: 'statusPending', IN_PROGRESS: 'statusProgress', ANSWERED: 'statusAnswered', CLOSED: 'statusClosed' };
const BORDER_CLASS = { PENDING: 'borderError', IN_PROGRESS: 'borderPrimary', ANSWERED: 'borderGray', CLOSED: 'borderGray' };

const STATUS_FILTERS = [
  { value: '', label: '전체' },
  { value: 'PENDING', label: '대기 중' },
  { value: 'IN_PROGRESS', label: '진행 중' },
  { value: 'ANSWERED', label: '답변완료' },
];

const FAQ_ITEMS = [
  { tag: '가장 많이 찾음', text: '비밀번호를 분실했을 때 어떻게 찾나요?' },
  { tag: '신규 등록', text: '디지털 보장 분석 서비스 이용 가이드' },
  { tag: '업데이트', text: '2024년 변경된 보험 약관 안내' },
];

function timeAgo(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return '방금 전';
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days === 1) return '어제';
  return `${days}일 전`;
}

function getInitial(name) { return name ? name[0] : '?'; }

export default function InquiryListPage() {
  const [customerName, setCustomerName] = useState('');
  const [searchName, setSearchName] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchInquiries({ customerName: searchName, status: statusFilter })
      .then((data) => setItems(Array.isArray(data) ? data : (data?.items ?? data?.content ?? [])))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [searchName, statusFilter]);

  const newCount = items.filter((i) => i.status === 'PENDING').length;
  const resolvedCount = items.filter((i) => i.status === 'ANSWERED' || i.status === 'CLOSED').length;

  const filteredItems = statusFilter
    ? items.filter((i) => i.status === statusFilter)
    : items;

  return (
    <Layout title="문의 목록">
      <div className={styles.page}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroLeft}>
            <span className={styles.heroIcon}>🎧</span>
            <div>
              <h1 className={styles.heroTitle}>고객 지원 센터</h1>
              <p className={styles.heroSub}>문의 내용을 확인하고 효율적으로 관리하세요. 신속한 응대는 고객의 신뢰를 만듭니다.</p>
              <div className={styles.heroActions}>
                <button className={styles.heroBtn}>+ 새 문의 작성</button>
                <button className={styles.heroBtnOutline}>상담 일지 다운로드</button>
              </div>
            </div>
          </div>
        </section>

        {/* Bento Grid */}
        <div className={styles.bentoGrid}>
          {/* Inquiry List - Main */}
          <div className={styles.mainCol}>
            <div className={styles.listHeader}>
              <h2 className={styles.listTitle}>1:1 문의 내역</h2>
              <div className={styles.filterTabs}>
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    className={`${styles.filterTab} ${statusFilter === f.value ? styles.filterTabActive : ''}`}
                    onClick={() => setStatusFilter(f.value)}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className={styles.searchRow}>
              <input
                className={styles.searchInput}
                type="text"
                placeholder="고객명 검색..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && setSearchName(customerName)}
              />
              <button className={styles.searchBtn} onClick={() => setSearchName(customerName)}>검색</button>
            </div>

            {loading && <div className={styles.msg}>불러오는 중…</div>}
            {!loading && filteredItems.length === 0 && <div className={styles.msg}>조회된 문의가 없습니다.</div>}

            <div className={styles.cardList}>
              {filteredItems.map((item, i) => (
                <div
                  key={item.inquiryNo ?? i}
                  className={`${styles.inquiryCard} ${styles[BORDER_CLASS[item.status] ?? 'borderGray']} ${selectedItem?.inquiryNo === item.inquiryNo ? styles.inquiryCardSelected : ''}`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className={styles.cardTop}>
                    <div className={styles.cardTopLeft}>
                      <span className={`${styles.statusBadge} ${styles[STATUS_CLASS[item.status] ?? 'statusPending']}`}>
                        {STATUS_LABEL[item.status] ?? item.status ?? '대기'}
                      </span>
                      <h3 className={styles.cardTitle}>{item.title ?? '-'}</h3>
                    </div>
                    <span className={styles.cardTime}>{timeAgo(item.createdAt)}</span>
                  </div>
                  {item.content && (
                    <p className={styles.cardContent}>{item.content}</p>
                  )}
                  <div className={styles.cardBottom}>
                    <div className={styles.customerCell}>
                      <div className={styles.customerAvatar}>{getInitial(item.customerName)}</div>
                      <span className={styles.customerName}>{item.customerName ?? '-'} 고객님</span>
                    </div>
                    <button className={`${styles.cardAction} ${item.status === 'CLOSED' ? styles.cardActionGray : ''}`}>
                      {item.status === 'CLOSED' ? '처리 기록 →' : '상세 보기 →'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className={styles.sideCol}>
            {/* Quick Stats */}
            <div className={styles.statsCard}>
              <h3 className={styles.statsTitle}>📊 오늘의 현황</h3>
              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <span className={styles.statItemLabel}>새 문의</span>
                  <span className={`${styles.statItemValue} ${styles.statRed}`}>{newCount}건</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statItemLabel}>해결됨</span>
                  <span className={`${styles.statItemValue} ${styles.statGreen}`}>{resolvedCount}건</span>
                </div>
              </div>
              <div className={styles.responseRate}>
                <div className={styles.responseRateRow}>
                  <span>목표 응답 시간 준수</span>
                  <span>92%</span>
                </div>
                <div className={styles.rateBar}>
                  <div className={styles.rateFill} style={{ width: '92%' }} />
                </div>
              </div>
            </div>

            {/* FAQ Management */}
            <div className={styles.faqCard}>
              <div className={styles.faqHeader}>
                <h3 className={styles.statsTitle}>❓ FAQ 관리</h3>
              </div>
              <div className={styles.faqList}>
                {FAQ_ITEMS.map((faq, i) => (
                  <div key={i} className={styles.faqItem}>
                    <span className={styles.faqTag}>{faq.tag}</span>
                    <p className={styles.faqText}>{faq.text}</p>
                  </div>
                ))}
              </div>
              <button className={styles.addFaqBtn}>+ 새 FAQ 항목 추가</button>
            </div>

            {/* Promo */}
            <div className={styles.promoCard}>
              <div className={styles.promoOverlay}>
                <span className={styles.promoTag}>CS Manager Pro</span>
                <h4 className={styles.promoTitle}>지원팀 역량 강화 교육 신청</h4>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
