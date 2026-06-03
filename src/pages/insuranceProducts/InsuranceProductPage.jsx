import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { fetchInsuranceProducts } from '../../api/insuranceProducts';
import styles from './InsuranceProductPage.module.css';

const CATEGORIES = ['전체', '건강', '운전자', '생활', '기업'];

const STATIC_PRODUCTS = [
  { icon: '🏥', name: '프리미엄 건강보험', desc: '암, 뇌, 심장 3대 질병 진단비부터 수술비, 입원비까지 빈틈없이 보장합니다.', price: '42,500원 ~', tag: '추천 상품', featured: true },
  { icon: '🚗', name: '안심 운전자보험', desc: '교통사고 처리 지원금은 물론 변호사 선임 비용까지 실속 있게 챙기세요.', price: '12,000원 ~', tag: null, featured: false },
  { icon: '🏠', name: '홈 실드 주택보험', desc: '화재, 누수는 물론 우리 집 가전제품 수리비까지 일상 속 위험을 대비합니다.', price: '8,900원 ~', tag: null, featured: false },
];

const ENTERPRISE_PLANS = [
  { name: '글로벌 임원 케어', target: 'C-Level 경영진', maxCoverage: '50억원', feature: '해외 긴급구조 포함' },
  { name: '스타트업 단체보험', target: '50인 미만 중소기업', maxCoverage: '12억원', feature: '간편 가입 프로세스' },
];

export default function InsuranceProductPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('전체');

  useEffect(() => {
    fetchInsuranceProducts()
      .then((data) => setProducts(Array.isArray(data) ? data : (data?.items ?? data?.content ?? [])))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);

  const displayProducts = products.length > 0 ? products : STATIC_PRODUCTS;
  const filteredProducts = activeCategory === '전체'
    ? displayProducts
    : displayProducts.filter((p) => (p.category ?? '') === activeCategory);

  return (
    <Layout title="보험상품 포털">
      <div className={styles.page}>
        {/* Hero Section */}
        <header className={styles.hero}>
          <div className={styles.heroLeft}>
            <div className={styles.heroPill}>
              <span className={styles.heroPillDot} />
              인슈플로우와 함께하는 똑똑한 보험 관리
            </div>
            <h1 className={styles.heroTitle}>
              당신의 일상이<br /><span className={styles.heroTitleAccent}>더욱 안전해지도록</span>
            </h1>
            <p className={styles.heroSub}>
              라이프스타일에 맞춘 최적의 보험 솔루션을 만나보세요.
              복잡한 보험도 인슈플로우라면 투명하고 간편합니다.
            </p>
          </div>
          <div className={styles.heroCard}>
            <div className={styles.heroCardTop}>
              <div className={styles.heroCardIconWrap}>🛡️</div>
              <div>
                <p className={styles.heroCardMeta}>나의 보험 요약</p>
                <p className={styles.heroCardTitle}>총 4건 가입 중</p>
              </div>
            </div>
            <div className={styles.heroCardBody}>
              <div className={styles.heroCardRow}>
                <span>이번 달 보험료</span>
                <span className={styles.heroCardPrice}>245,000원</span>
              </div>
              <div className={styles.heroProgressBar}>
                <div className={styles.heroProgressFill} style={{ width: '75%' }} />
              </div>
              <button className={styles.heroCardBtn}>보장 분석 받기</button>
            </div>
          </div>
        </header>

        {/* Quick Menu */}
        <section className={styles.quickMenu}>
          {[
            { icon: '🧮', label: '보험료 계산' },
            { icon: '🚨', label: '사고 접수' },
            { icon: '📋', label: '보험금 청구' },
            { icon: '📄', label: '계약 조회' },
          ].map((item) => (
            <button key={item.label} className={styles.quickBtn}>
              <div className={styles.quickIconWrap}>{item.icon}</div>
              <span className={styles.quickLabel}>{item.label}</span>
            </button>
          ))}
        </section>

        {/* Category Filter + Products */}
        <section className={styles.productsSection}>
          <div className={styles.productsHeader}>
            <h2 className={styles.sectionTitle}>맞춤형 추천 상품</h2>
            <div className={styles.categoryFilter}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`${styles.catBtn} ${activeCategory === cat ? styles.catBtnActive : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className={styles.loadingMsg}>상품 불러오는 중…</div>
          ) : (
            <div className={styles.productsGrid}>
              {(filteredProducts.length > 0 ? filteredProducts : STATIC_PRODUCTS).map((p, i) => (
                <div key={p.productNo ?? p.name ?? i} className={`${styles.productCard} ${p.featured ? styles.productCardFeatured : ''}`}>
                  <div className={styles.productTop}>
                    <div className={styles.productIconWrap}>{p.icon ?? '📦'}</div>
                    {p.tag && <span className={styles.productTag}>{p.tag}</span>}
                  </div>
                  <h3 className={styles.productName}>{p.name ?? p.productName ?? '-'}</h3>
                  <p className={styles.productDesc}>{p.desc ?? p.description ?? '-'}</p>
                  <div className={styles.productFooter}>
                    <div className={styles.productPriceRow}>
                      <span className={styles.productPriceLabel}>월 예상 보험료</span>
                      <span className={styles.productPrice}>{p.price ?? p.monthlyPremium ?? '-'}</span>
                    </div>
                    <button className={`${styles.productBtn} ${p.featured ? styles.productBtnFeatured : ''}`}>자세히 보기</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Enterprise Plans */}
        <section className={styles.enterpriseSection}>
          <div className={styles.enterpriseHeader}>
            <div>
              <h2 className={styles.sectionTitle}>법인 전용 플랜</h2>
              <p className={styles.enterpriseSub}>기업을 위한 최적의 리스크 관리 솔루션</p>
            </div>
            <button className={styles.compareBtn}>상품 비교하기 →</button>
          </div>
          <div className={styles.enterpriseTableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>상품명</th>
                  <th>대상</th>
                  <th className={styles.thRight}>최대 보장</th>
                  <th>특징</th>
                  <th className={styles.thCenter}>신청</th>
                </tr>
              </thead>
              <tbody>
                {ENTERPRISE_PLANS.map((plan) => (
                  <tr key={plan.name} className={styles.tableRow}>
                    <td>
                      <div className={styles.planNameCell}>
                        <div className={styles.planIconWrap}>🏢</div>
                        <span className={styles.planName}>{plan.name}</span>
                      </div>
                    </td>
                    <td className={styles.tdSmall}>{plan.target}</td>
                    <td className={`${styles.tdRight} ${styles.tdBoldGreen}`}>{plan.maxCoverage}</td>
                    <td>
                      <span className={styles.featureBadge}>{plan.feature}</span>
                    </td>
                    <td className={styles.tdCenter}>
                      <button className={styles.applyBtn}>→</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Promo Banner */}
        <section className={styles.promoBanner}>
          <div className={styles.promoContent}>
            <h2 className={styles.promoTitle}>지금 갈아타면 <span className={styles.promoAccent}>최대 25%</span> 할인</h2>
            <p className={styles.promoSub}>기존 보험보다 더 넓은 보장, 더 저렴한 보험료를 확인하세요.</p>
            <button className={styles.promoBtn}>내 절약 금액 계산하기</button>
          </div>
          <div className={styles.promoEmoji}>💰</div>
        </section>
      </div>
    </Layout>
  );
}
