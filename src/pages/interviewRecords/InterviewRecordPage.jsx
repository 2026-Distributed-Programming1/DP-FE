import { useState, useEffect, useCallback } from 'react';
import { fetchInterviewRecords, createInterviewRecord, updateInterviewRecord } from '../../api/interviewRecords';

function formatDt(iso) {
  return iso ? new Date(iso).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
}

function RecordModal({ record, onClose, onSaved }) {
  const editing = !!record;
  const [form, setForm] = useState(record ? {
    content: record.content ?? '', customerReaction: record.customerReaction ?? '', followUpAction: record.followUpAction ?? '',
  } : { customerName: '', interviewedAt: '', content: '', customerReaction: '', followUpAction: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editing) await updateInterviewRecord(record.recordNo, { content: form.content, customerReaction: form.customerReaction, followUpAction: form.followUpAction });
      else await createInterviewRecord(form);
      onSaved();
    } catch { setError('저장에 실패했습니다.'); } finally { setSubmitting(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="card w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-on-surface">{editing ? '면담 기록 수정' : '면담 기록 등록'}</h3>
          <button onClick={onClose} className="btn-ghost p-1"><span className="material-symbols-outlined text-[20px]">close</span></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          {!editing && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant">고객명 *</label>
                <input className="input text-sm" value={form.customerName} onChange={set('customerName')} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-on-surface-variant">면담 일시 *</label>
                <input type="datetime-local" className="input text-sm" value={form.interviewedAt} onChange={set('interviewedAt')} required />
              </div>
            </>
          )}
          {[['면담 내용 *', 'content', 3], ['고객 반응', 'customerReaction', 2], ['후속 조치', 'followUpAction', 2]].map(([label, k, rows]) => (
            <div key={k} className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant">{label}</label>
              <textarea className="input resize-none text-sm" rows={rows} value={form[k]} onChange={set(k)} required={label.includes('*')} />
            </div>
          ))}
          {error && <p className="text-xs text-error">{error}</p>}
          <div className="flex gap-2">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>취소</button>
            <button type="submit" className="btn-primary flex-1" disabled={submitting}>{submitting ? '저장 중...' : '저장'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function InterviewRecordPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [modalRecord, setModalRecord] = useState(undefined); // undefined=닫힘, null=신규, object=수정

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const d = await fetchInterviewRecords({ page, size: 20 });
      setItems(d.items ?? []);
      setTotal(d.total ?? 0);
    } catch { } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">면담 기록</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">총 {total}건</p>
        </div>
        <button onClick={() => setModalRecord(null)} className="btn-primary flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">add</span>기록 등록
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
      ) : items.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
          <span className="material-symbols-outlined text-4xl text-outline">edit_note</span>
          <p className="text-sm">면담 기록이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.recordNo} className="card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-on-surface">{item.customerName}</p>
                  <p className="text-xs text-on-surface-variant">{formatDt(item.interviewedAt)} · {item.recordNo}</p>
                </div>
                <button onClick={() => setModalRecord(item)} className="btn-ghost p-1.5 text-xs">
                  <span className="material-symbols-outlined text-[18px]">edit</span>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                {[['면담 내용', item.content], ['고객 반응', item.customerReaction], ['후속 조치', item.followUpAction]].map(([label, value]) => (
                  <div key={label}>
                    <p className="text-xs text-on-surface-variant">{label}</p>
                    <p className="text-on-surface mt-0.5 leading-relaxed">{value || '—'}</p>
                  </div>
                ))}
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

      {modalRecord !== undefined && (
        <RecordModal record={modalRecord} onClose={() => setModalRecord(undefined)} onSaved={() => { setModalRecord(undefined); load(); }} />
      )}
    </div>
  );
}
