import { useState, useEffect, useCallback } from 'react';
import { useAuth, isCustomer } from '../../context/AuthContext';
import { fetchContracts, fetchContract, cancelContract, CONTRACT_STATUS } from '../../api/contracts';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
}
function formatPrice(n) {
  return n?.toLocaleString('ko-KR') ?? '—';
}

// ── 상세 패널 ────────────────────────────────────────────────────
function DetailPanel({ contractNo, canCancel, onCancelled }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!contractNo) return;
    setLoading(true);
    setDetail(null);
    setShowCancelForm(false);
    setError('');
    fetchContract(contractNo)
      .then(setDetail)
      .catch(() => setError('상세 정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [contractNo]);

  const handleCancel = async (e) => {
    e.preventDefault();
    if (!cancelReason.trim()) return;
    setSubmitting(true);
    try {
      await cancelContract(contractNo, {
        reason: '기타',
        detailReason: cancelReason.trim(),
        noticeAgreed: true,
      });
      onCancelled();
    } catch {
      setError('해지 신청에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!contractNo) {
    return (
      <div className="card h-full flex flex-col items-center justify-center gap-3 text-on-surface-variant p-8">
        <span className="material-symbols-outlined text-4xl text-outline">description</span>
        <p className="text-sm">계약을 선택하면 상세 정보가 표시됩니다.</p>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="card h-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (error && !detail) {
    return <div className="card h-full flex items-center justify-center text-sm text-error p-8">{error}</div>;
  }
  if (!detail) return null;

  const st = CONTRACT_STATUS[detail.status] ?? { label: detail.status, cls: 'bg-surface-container text-outline' };

  return (
    <div className="card flex flex-col overflow-hidden">
      {/* 헤더 */}
      <div className="p-5 border-b border-outline-variant/50 bg-surface-container-low">
        <div className="flex items-center justify-between mb-2">
          <span className={`badge ${st.cls}`}>{st.label}</span>
          {detail.isExpiringSoon && (
            <span className="badge bg-error-container text-on-error-container text-[11px]">만기 임박</span>
          )}
        </div>
        <h3 className="font-bold text-on-surface">{detail.insuranceType}</h3>
        <p className="text-xs text-outline mt-0.5">{detail.contractNo}</p>
      </div>

      {/* 정보 */}
      <div className="p-5 border-b border-outline-variant/50 space-y-3">
        {[
          { label: '고객명',     value: detail.customerName },
          { label: '계약일',     value: formatDate(detail.contractDate) },
          { label: '만기일',     value: formatDate(detail.expiryDate) },
          { label: '월 보험료',  value: `${formatPrice(detail.monthlyPremium)}원` },
          { label: '연체 횟수',  value: `${detail.overdueCount ?? 0}회` },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-on-surface-variant">{label}</span>
            <span className="font-medium text-on-surface">{value}</span>
          </div>
        ))}
        {detail.isOverdue && (
          <div className="flex items-center gap-1.5 text-xs text-error bg-error-container/30 px-3 py-2 rounded-lg">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            연체 상태입니다.
          </div>
        )}
      </div>

      {/* 해지 신청 (NORMAL 상태, 권한 있을 때) */}
      {canCancel && detail.status === 'NORMAL' && (
        <div className="p-5">
          {!showCancelForm ? (
            <button
              onClick={() => setShowCancelForm(true)}
              className="btn-secondary w-full text-error border border-error/30 hover:bg-error-container/20"
            >
              해지 신청
            </button>
          ) : (
            <form onSubmit={handleCancel} className="space-y-3">
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
                해지 사유
              </label>
              <textarea
                className="input resize-none text-sm"
                rows={3}
                placeholder="해지 사유를 입력하세요..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                required
              />
              {error && <p className="text-xs text-error">{error}</p>}
              <div className="flex gap-2">
                <button type="button" className="btn-ghost flex-1" onClick={() => setShowCancelForm(false)}>취소</button>
                <button type="submit" className="flex-1 bg-error text-on-error px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90" disabled={submitting}>
                  {submitting ? '처리 중...' : '해지 확인'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────────
export default function ContractListPage() {
  const { user } = useAuth();
  const customer = isCustomer(user?.role);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedNo, setSelectedNo] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchContracts({ page, size: 20 });
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch {
      /* 빈 목록 처리 */
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const filtered = statusFilter ? items.filter((i) => i.status === statusFilter) : items;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  const STATUS_FILTERS = [
    { value: '', label: '전체' },
    { value: 'NORMAL', label: '정상' },
    { value: 'EXPIRED', label: '만기' },
    { value: 'CANCELLED', label: '해지' },
    { value: 'LAPSED', label: '실효' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">
            {customer ? '내 계약' : '계약 목록'}
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">총 {total}건</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── 목록 ───────────────────────── */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* 상태 필터 */}
          <div className="flex gap-1 flex-wrap">
            {STATUS_FILTERS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
                  ${statusFilter === value
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* 테이블 */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-outline">description</span>
              <p className="text-sm">계약 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/50 bg-surface-container-low">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant">보험종류</th>
                    {!customer && <th className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant">고객명</th>}
                    <th className="text-left px-4 py-3 text-xs font-semibold text-on-surface-variant">만기일</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-on-surface-variant">월 보험료</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-on-surface-variant">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const st = CONTRACT_STATUS[item.status] ?? { label: item.status, cls: 'bg-surface-container text-outline' };
                    return (
                      <tr
                        key={item.contractNo}
                        onClick={() => setSelectedNo(item.contractNo)}
                        className={`border-b border-outline-variant/30 cursor-pointer transition-colors
                          hover:bg-surface-container-low
                          ${selectedNo === item.contractNo ? 'bg-primary/5' : ''}`}
                      >
                        <td className="px-4 py-3 font-medium text-on-surface">{item.insuranceType}</td>
                        {!customer && <td className="px-4 py-3 text-on-surface-variant">{item.customerName}</td>}
                        <td className="px-4 py-3 text-on-surface-variant">{formatDate(item.expiryDate)}</td>
                        <td className="px-4 py-3 text-right font-medium text-on-surface">{formatPrice(item.monthlyPremium)}원</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`badge ${st.cls}`}>{st.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost p-1.5 disabled:opacity-30">
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                    ${p === page ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
                >{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost p-1.5 disabled:opacity-30">
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          )}
        </div>

        {/* ── 상세 패널 ──────────────────── */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 self-start">
          <DetailPanel
            contractNo={selectedNo}
            canCancel={true}
            onCancelled={() => { setSelectedNo(null); load(); }}
          />
        </div>
      </div>
    </div>
  );
}
