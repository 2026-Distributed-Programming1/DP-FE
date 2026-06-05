import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, isCustomer } from '../../context/AuthContext';
import { fetchInsuranceProducts } from '../../api/insuranceProducts';

const CATEGORY_ICON = {
  '자동차': 'directions_car',
  '건강': 'favorite',
  '생명': 'favorite_border',
  '화재': 'local_fire_department',
  '여행': 'travel_explore',
  '운전자': 'person',
};

function getIcon(category) {
  return CATEGORY_ICON[category] ?? 'shield';
}

function formatPrice(n) {
  return n?.toLocaleString('ko-KR') ?? '—';
}

function ProductCard({ product, selected, onClick }) {
  return (
    <div
      onClick={() => onClick(product)}
      className={`card p-6 flex flex-col gap-4 cursor-pointer transition-all duration-200
                  hover:-translate-y-1 hover:shadow-md
                  ${selected ? 'ring-2 ring-primary/40' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-3xl">
            {getIcon(product.category)}
          </span>
        </div>
        <span className="badge bg-surface-container text-on-surface-variant text-[11px]">
          {product.category}
        </span>
      </div>
      <div>
        <h3 className="font-semibold text-on-surface">{product.productName}</h3>
        <p className="text-sm text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
          {product.coverageSummary}
        </p>
      </div>
      <div className="mt-auto pt-4 border-t border-outline-variant/50 flex items-center justify-between">
        <span className="text-xs text-outline">월 보험료</span>
        <span className="font-bold text-primary">{formatPrice(product.monthlyPremium)}원</span>
      </div>
    </div>
  );
}

function DetailPanel({ product, canApply, onApply }) {
  if (!product) {
    return (
      <div className="card h-full flex flex-col items-center justify-center gap-3 text-on-surface-variant p-8">
        <span className="material-symbols-outlined text-4xl text-outline">shield</span>
        <p className="text-sm">상품을 선택하면 상세 정보가 표시됩니다.</p>
      </div>
    );
  }

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="p-6 border-b border-outline-variant/50 bg-primary/5">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-primary text-3xl">
            {getIcon(product.category)}
          </span>
        </div>
        <span className="badge bg-surface-container text-on-surface-variant text-xs mb-2">
          {product.category}
        </span>
        <h3 className="font-bold text-lg text-on-surface">{product.productName}</h3>
        <p className="text-sm text-primary font-semibold mt-1">
          월 {formatPrice(product.monthlyPremium)}원
        </p>
      </div>

      <div className="p-5 border-b border-outline-variant/50">
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-3 flex items-center gap-1">
          <span className="material-symbols-outlined text-primary text-[14px]">check_circle</span>
          보장 내용
        </p>
        <p className="text-sm text-on-surface leading-relaxed">{product.coverageSummary}</p>
      </div>

      {product.exclusionSummary && (
        <div className="p-5 border-b border-outline-variant/50 bg-error-container/10">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-error text-[14px]">cancel</span>
            면책 사항
          </p>
          <p className="text-sm text-on-surface-variant leading-relaxed">{product.exclusionSummary}</p>
        </div>
      )}

      {canApply && (
        <div className="p-5">
          <button onClick={() => onApply(product)} className="btn-primary w-full py-3">
            이 상품 신청하기
          </button>
        </div>
      )}
    </div>
  );
}

export default function InsuranceProductPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const customer = isCustomer(user?.role);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('전체');

  useEffect(() => {
    setLoading(true);
    fetchInsuranceProducts()
      .then((data) => setProducts(data.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const categories = ['전체', ...new Set(products.map((p) => p.category).filter(Boolean))];
  const filtered = categoryFilter === '전체' ? products : products.filter((p) => p.category === categoryFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-on-surface">보험상품</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">
          총 {products.length}개 상품
          {customer ? ' · 원하는 상품을 선택해 신청하세요.' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="flex gap-1 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
                  ${categoryFilter === cat
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-outline">search_off</span>
              <p className="text-sm">해당 카테고리의 상품이 없습니다.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map((product) => (
                <ProductCard
                  key={product.productName}
                  product={product}
                  selected={selected?.productName === product.productName}
                  onClick={setSelected}
                />
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-5 lg:sticky lg:top-24 self-start">
          <DetailPanel
            product={selected}
            canApply={customer}
            onApply={(p) => navigate('/my/insurance-applications/new', { state: { product: p } })}
          />
        </div>
      </div>
    </div>
  );
}
