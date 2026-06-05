import { useState, useEffect, useCallback } from 'react';
import {
  fetchUnderwritingPending,
  createUnderwriting,
  APPLICATION_TYPE_LABEL,
} from '../../api/underwriting';

// ── 심사 모달 ─────────────────────────────────────────────────────
function ReviewModal({ item, onClose, onDone }) {
  const [form, setForm] = useState({
    reviewType: '표준심사',
    reviewOpinion: '',
    riskGrade: '표준',
    result: 'APPROVED',
    resultCondition: '',
    rejectionReason: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createUnderwriting({
        applicationType: item.applicationType,
        appNo: item.applicationNo,
        customerName: item.customerName,
        reviewType: form.reviewType,
        reviewOpinion: form.reviewOpinion,
        riskGrade: form.riskGrade,
        result: form.result,
        resultCondition: form.result === 'APPROVED' ? form.resultCondition || null : null,
        rejectionReason: form.result === 'REJECTED' ? form.rejectionReason || null : null,
      });
      onDone();
    } catch {
      setError('심사 처리에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="card w-full max-w-md p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-on-surface">인수심사 처리</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">
              {item.customerName} · {item.productName}
            </p>
          </div>
          <button onClick={onClose} className="btn-ghost p-1">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* 심사 유형 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">심사 유형</label>
            <select className="input text-sm" value={form.reviewType} onChange={set('reviewType')}>
              {['표준심사', '특별심사', '조건부심사'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* 위험 등급 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">위험 등급</label>
            <select className="input text-sm" value={form.riskGrade} onChange={set('riskGrade')}>
              {['표준', '준표준', '고위험'].map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* 심사 의견 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">심사 의견</label>
            <textarea
              className="input resize-none text-sm"
              rows={3}
              placeholder="심사 내용을 입력하세요..."
              value={form.reviewOpinion}
              onChange={set('reviewOpinion')}
              required
            />
          </div>

          {/* 결과 선택 */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">심사 결과</label>
            <div className="flex gap-2">
              {[
                { value: 'APPROVED', label: '승인', cls: 'border-primary bg-primary/5 text-primary' },
                { value: 'REJECTED', label: '거절', cls: 'border-error bg-error/5 text-error' },
              ].map(({ value, label, cls }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, result: value }))}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition-colors
                    ${form.result === value ? cls : 'border-outline-variant text-on-surface-variant hover:border-primary/30'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* 조건부 필드 */}
          {form.result === 'APPROVED' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant">결과 조건 (선택)</label>
              <input className="input text-sm" placeholder="예: 특약 제한" value={form.resultCondition} onChange={set('resultCondition')} />
            </div>
          )}
          {form.result === 'REJECTED' && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant">거절 사유</label>
              <textarea className="input resize-none text-sm" rows={2} value={form.rejectionReason} onChange={set('rejectionReason')} required />
            </div>
          )}

          {error && <p className="text-xs text-error">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>취소</button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity disabled:opacity-50
                ${form.result === 'APPROVED' ? 'bg-primary text-on-primary' : 'bg-error text-on-error'}`}
              disabled={submitting}
            >
              {submitting ? '처리 중...' : form.result === 'APPROVED' ? '승인 처리' : '거절 처리'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────────
export default function UnderwritingListPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [reviewTarget, setReviewTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchUnderwritingPending({ page, size: 20 });
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch { /* 빈 처리 */ } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">인수심사 대기열</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">현재 대기 중인 신청 건을 심사합니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="card px-4 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium">대기 {total}건</span>
          </div>
          <button onClick={load} className="btn-ghost p-2">
            <span className="material-symbols-outlined text-[20px]">refresh</span>
          </button>
        </div>
      </div>

      {/* 테이블 */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl text-outline">fact_check</span>
          <p className="text-sm">심사 대기 건이 없습니다.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/50 bg-surface-container-low">
                  {['신청번호', '고객명', '상품명', '신청 유형', '납입방법', '심사'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.applicationNo}
                    className="border-b border-outline-variant/30 hover:bg-surface-container-low transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-primary">{item.applicationNo}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-xs shrink-0">
                          {item.customerName?.[0]}
                        </div>
                        <span className="font-medium text-on-surface">{item.customerName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-on-surface">{item.productName}</td>
                    <td className="px-4 py-3">
                      <span className="badge bg-surface-container text-on-surface-variant text-[11px]">
                        {APPLICATION_TYPE_LABEL[item.applicationType] ?? item.applicationType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">
                      {item.paymentMethod === 'IMMEDIATE_TRANSFER' ? '즉시이체' : '가상계좌'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setReviewTarget(item)}
                        className="px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary rounded-full text-xs font-semibold transition-colors"
                      >
                        심사하기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost p-1.5 disabled:opacity-30">
            <span className="material-symbols-outlined text-[18px]">chevron_left</span>
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium ${p === page ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
            >{p}</button>
          ))}
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost p-1.5 disabled:opacity-30">
            <span className="material-symbols-outlined text-[18px]">chevron_right</span>
          </button>
        </div>
      )}

      {/* 심사 모달 */}
      {reviewTarget && (
        <ReviewModal
          item={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onDone={() => { setReviewTarget(null); load(); }}
        />
      )}
    </div>
  );
}
