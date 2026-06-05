import { useState, useEffect, useCallback } from 'react';
import { useAuth, isStaff } from '../../context/AuthContext';
import { fetchConsultations, createConsultation, acceptConsultation } from '../../api/consultations';

// ── 고객용 신청 폼 ────────────────────────────────────────────────
function ConsultationForm({ onCreated }) {
  const [form, setForm] = useState({ type: '방문 상담', location: '', contact: '', content: '', scheduledAt: '' });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await createConsultation(form);
      setDone(result);
      onCreated?.();
    } catch { setError('신청에 실패했습니다.'); } finally { setSubmitting(false); }
  };

  if (done) return (
    <div className="card p-8 text-center space-y-4 max-w-md mx-auto">
      <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        <span className="material-symbols-outlined text-primary text-3xl">check_circle</span>
      </div>
      <h3 className="font-bold text-on-surface">상담 신청 완료</h3>
      <p className="text-sm text-on-surface-variant">접수번호: <span className="font-mono font-semibold">{done.consultNo}</span></p>
      <button onClick={() => setDone(null)} className="btn-secondary w-full">새 신청</button>
    </div>
  );

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-on-surface">상담 신청</h1>
        <p className="text-sm text-on-surface-variant mt-0.5">원하는 상담 유형을 선택하고 내용을 입력하세요.</p>
      </div>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant">상담 유형</label>
          <div className="flex gap-2">
            {['방문 상담', '전화 상담', '온라인 상담'].map(t => (
              <button key={t} type="button" onClick={() => setForm(f => ({ ...f, type: t }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-colors
                  ${form.type === t ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant text-on-surface-variant hover:border-primary/30'}`}
              >{t}</button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant">연락처 *</label>
          <input className="input text-sm" placeholder="010-1234-5678" value={form.contact} onChange={set('contact')} required />
        </div>
        {form.type === '방문 상담' && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">희망 장소</label>
            <input className="input text-sm" placeholder="예: 서울 강남지점" value={form.location} onChange={set('location')} />
          </div>
        )}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant">희망 일시</label>
          <input type="datetime-local" className="input text-sm" value={form.scheduledAt} onChange={set('scheduledAt')} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-on-surface-variant">상담 내용 *</label>
          <textarea className="input resize-none text-sm" rows={3} placeholder="상담 내용을 입력하세요..." value={form.content} onChange={set('content')} required />
        </div>
        {error && <p className="text-xs text-error">{error}</p>}
        <button type="submit" className="btn-primary w-full py-2.5" disabled={submitting}>
          {submitting ? '신청 중...' : '상담 신청'}
        </button>
      </form>
    </div>
  );
}

// ── 직원용 목록 ──────────────────────────────────────────────────
function ConsultationList() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [accepting, setAccepting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchConsultations({ page, size: 20 });
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch { } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleAccept = async (consultNo) => {
    setAccepting(true);
    try { await acceptConsultation(consultNo); setSelected(null); load(); }
    catch { } finally { setAccepting(false); }
  };

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">상담 목록</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">총 {total}건</p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : items.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-outline">chat</span>
              <p className="text-sm">상담 신청이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.consultNo} onClick={() => setSelected(item)}
                  className={`card p-4 cursor-pointer transition-all hover:shadow-md border-l-4
                    ${item.status === '접수' ? 'border-l-error' : 'border-l-primary-container'}
                    ${selected?.consultNo === item.consultNo ? 'ring-2 ring-primary/30' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className={`badge text-[11px] ${item.status === '접수' ? 'bg-error-container/30 text-error' : 'bg-primary-container/20 text-primary'}`}>{item.status}</span>
                      <p className="font-semibold text-on-surface mt-1">{item.type}</p>
                    </div>
                    <span className="text-xs text-outline">{item.scheduledAt ? new Date(item.scheduledAt).toLocaleDateString('ko-KR') : '—'}</span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-1">{item.contact}</p>
                </div>
              ))}
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
        </div>
        <div className="lg:col-span-5 lg:sticky lg:top-24 self-start">
          {selected ? (
            <div className="card flex flex-col overflow-hidden">
              <div className="p-5 border-b border-outline-variant/50">
                <span className={`badge text-[11px] ${selected.status === '접수' ? 'bg-error-container/30 text-error' : 'bg-primary-container/20 text-primary'}`}>{selected.status}</span>
                <h3 className="font-bold text-on-surface mt-1">{selected.type}</h3>
                <p className="text-xs text-outline mt-0.5">{selected.consultNo}</p>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { label: '연락처', value: selected.contact },
                  { label: '장소', value: selected.location || '—' },
                  { label: '희망 일시', value: selected.scheduledAt ? new Date(selected.scheduledAt).toLocaleString('ko-KR') : '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-on-surface-variant">{label}</span>
                    <span className="font-medium text-on-surface">{value}</span>
                  </div>
                ))}
                {selected.content && <p className="text-sm text-on-surface pt-2 border-t border-outline-variant/30">{selected.content}</p>}
              </div>
              {selected.status === '접수' && (
                <div className="p-5">
                  <button onClick={() => handleAccept(selected.consultNo)} disabled={accepting} className="btn-primary w-full">{accepting ? '처리 중...' : '상담 수락'}</button>
                </div>
              )}
            </div>
          ) : (
            <div className="card h-full flex flex-col items-center justify-center gap-3 text-on-surface-variant p-8">
              <span className="material-symbols-outlined text-4xl text-outline">chat</span>
              <p className="text-sm">상담을 선택하면 상세 정보가 표시됩니다.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── 라우트 분기 ──────────────────────────────────────────────────
export default function ConsultationPage() {
  const { user } = useAuth();
  return isStaff(user?.role) ? <ConsultationList /> : <ConsultationForm />;
}
