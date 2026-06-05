import { useState, useEffect, useCallback } from 'react';
import {
  fetchInterviewSchedules,
  createInterviewSchedule,
  cancelInterviewSchedule,
} from '../../api/interviewSchedules';

function formatDt(iso) {
  return iso ? new Date(iso).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
}

const STATUS_CLS = { 예정: 'bg-primary-container/20 text-primary', 완료: 'bg-surface-container text-outline', 취소: 'bg-error-container/30 text-error' };

function NewModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ customerName: '', designerName: '', interviewType: '초회면담', scheduledAt: '', location: '', preparation: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try { await createInterviewSchedule(form); onCreated(); }
    catch { setError('등록에 실패했습니다.'); } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="card w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-on-surface">면담 일정 등록</h3>
          <button onClick={onClose} className="btn-ghost p-1"><span className="material-symbols-outlined text-[20px]">close</span></button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          {[['고객명', 'customerName', '', 'text'], ['설계사명', 'designerName', '', 'text'], ['면담 장소', 'location', 'col-span-2', 'text'], ['준비사항', 'preparation', 'col-span-2', 'text']].map(([label, key, span, type]) => (
            <div key={key} className={`space-y-1.5 ${span}`}>
              <label className="text-xs font-semibold text-on-surface-variant">{label}</label>
              <input type={type} className="input text-sm" value={form[key]} onChange={set(key)} required={['customerName', 'designerName'].includes(key)} />
            </div>
          ))}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">면담 유형</label>
            <select className="input text-sm" value={form.interviewType} onChange={set('interviewType')}>
              {['초회면담', '2차면담', '계약면담', '사후면담'].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant">면담 일시 *</label>
            <input type="datetime-local" className="input text-sm" value={form.scheduledAt} onChange={set('scheduledAt')} required />
          </div>
          {error && <p className="col-span-2 text-xs text-error">{error}</p>}
          <button type="button" className="btn-secondary" onClick={onClose}>취소</button>
          <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? '등록 중...' : '등록'}</button>
        </form>
      </div>
    </div>
  );
}

export default function InterviewSchedulePage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchInterviewSchedules({ page, size: 20 });
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch { } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (scheduleNo) => {
    if (!confirm('면담을 취소하시겠습니까?')) return;
    setCancelling(true);
    try { await cancelInterviewSchedule(scheduleNo); setSelected(null); load(); }
    catch { } finally { setCancelling(false); }
  };

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">면담 일정</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">총 {total}건</p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">add</span>면담 등록
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : items.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-outline">calendar_month</span>
              <p className="text-sm">면담 일정이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.scheduleNo} onClick={() => setSelected(item.scheduleNo === selected ? null : item.scheduleNo)}
                  className={`card p-4 cursor-pointer transition-all hover:shadow-md ${selected === item.scheduleNo ? 'ring-2 ring-primary/30' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`badge text-[11px] ${STATUS_CLS[item.status] ?? 'bg-surface-container text-outline'}`}>{item.status}</span>
                      <span className="font-semibold text-on-surface text-sm">{item.customerName}</span>
                    </div>
                    <span className="text-xs text-outline shrink-0">{formatDt(item.scheduledAt)}</span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-on-surface-variant">
                    <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">person</span>{item.designerName}</span>
                    <span>{item.interviewType}</span>
                    {item.location && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">location_on</span>{item.location}</span>}
                  </div>
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
          {selected ? (() => {
            const item = items.find(i => i.scheduleNo === selected);
            if (!item) return null;
            return (
              <div className="card overflow-hidden">
                <div className="p-5 border-b border-outline-variant/50 bg-surface-container-low">
                  <span className={`badge ${STATUS_CLS[item.status] ?? 'bg-surface-container text-outline'}`}>{item.status}</span>
                  <h3 className="font-bold text-on-surface mt-1">{item.customerName}</h3>
                  <p className="text-xs text-outline">{item.scheduleNo}</p>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    { label: '설계사', value: item.designerName },
                    { label: '면담 유형', value: item.interviewType },
                    { label: '면담 일시', value: formatDt(item.scheduledAt) },
                    { label: '장소', value: item.location || '—' },
                    { label: '준비사항', value: item.preparation || '—' },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-on-surface-variant">{label}</span>
                      <span className="font-medium text-on-surface">{value}</span>
                    </div>
                  ))}
                </div>
                {item.status === '예정' && (
                  <div className="p-5">
                    <button onClick={() => handleCancel(item.scheduleNo)} disabled={cancelling}
                      className="w-full bg-error/10 text-error py-2 rounded-lg text-sm font-semibold hover:bg-error/20 transition-colors">
                      {cancelling ? '처리 중...' : '면담 취소'}
                    </button>
                  </div>
                )}
              </div>
            );
          })() : (
            <div className="card h-full flex flex-col items-center justify-center gap-3 text-on-surface-variant p-8">
              <span className="material-symbols-outlined text-4xl text-outline">calendar_month</span>
              <p className="text-sm">면담을 선택하면 상세 정보가 표시됩니다.</p>
            </div>
          )}
        </div>
      </div>

      {showNew && <NewModal onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); load(); }} />}
    </div>
  );
}
