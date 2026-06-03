import { useState, useEffect, useCallback } from 'react';
import { fetchExpiringContracts, createExpiringNotice } from '../../api/contractExtras';

function formatDate(iso) { return iso ? new Date(iso).toLocaleDateString('ko-KR') : '—'; }
function fmt(n) { return n?.toLocaleString('ko-KR') ?? '—'; }

function NoticeModal({ contractNo, onClose, onCreated }) {
  const [form, setForm] = useState({ phone: '', email: '', isRenewable: true, expectedPremium: '', noticeMemo: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createExpiringNotice(contractNo, { ...form, expectedPremium: Number(form.expectedPremium) || null });
      onCreated();
    } catch { setError('안내 기록 등록에 실패했습니다.'); } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="card w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-on-surface">만기 안내 기록 — {contractNo}</h3>
          <button onClick={onClose} className="btn-ghost p-1"><span className="material-symbols-outlined text-[20px]">close</span></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {[['연락처', 'phone', 'text'], ['이메일', 'email', 'email'], ['예상 갱신 보험료', 'expectedPremium', 'number'], ['메모', 'noticeMemo', 'text']].map(([label, k, type]) => (
            <div key={k} className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant">{label}</label>
              <input type={type} className="input text-sm" value={form[k]} onChange={set(k)} />
            </div>
          ))}
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="accent-primary" checked={form.isRenewable} onChange={set('isRenewable')} />
            갱신 가능
          </label>
          {error && <p className="text-xs text-error">{error}</p>}
          <div className="flex gap-2">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>취소</button>
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>{submitting ? '등록 중...' : '안내 등록'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ExpiringContractsPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [noticeTarget, setNoticeTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetchExpiringContracts({ page, size: 20 });
      setItems(d.items ?? []);
      setTotal(d.total ?? 0);
    } catch { } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-on-surface">만기 임박 계약</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">만기 D-30 이내 계약 {total}건</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl text-outline">event</span>
          <p className="text-sm">만기 임박 계약이 없습니다.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant/50 bg-surface-container-low">
                {['계약번호', '고객명', '보험종류', '만기일', 'D-day', '월 보험료', '안내'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.contractNo} className="border-b border-outline-variant/30 hover:bg-surface-container-low">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{item.contractNo}</td>
                  <td className="px-4 py-3 font-medium text-on-surface">{item.contractorName}</td>
                  <td className="px-4 py-3 text-on-surface-variant">{item.insuranceType}</td>
                  <td className="px-4 py-3 text-on-surface-variant text-xs">{formatDate(item.expiryDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`badge ${item.remainingDays <= 7 ? 'bg-error-container text-on-error-container' : 'bg-error-container/30 text-error'}`}>
                      D-{item.remainingDays}
                    </span>
                  </td>
                  <td className="px-4 py-3">{fmt(item.monthlyPremium)}원</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setNoticeTarget(item.contractNo)} className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary rounded-full text-xs font-semibold transition-colors">
                      안내 등록
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost p-1.5 disabled:opacity-30"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium ${p === page ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}>{p}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost p-1.5 disabled:opacity-30"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
        </div>
      )}

      {noticeTarget && <NoticeModal contractNo={noticeTarget} onClose={() => setNoticeTarget(null)} onCreated={() => { setNoticeTarget(null); load(); }} />}
    </div>
  );
}
