import { useState, useEffect, useCallback } from 'react';
import {
  fetchChannelScreenings,
  approveChannelScreening,
  rejectChannelScreening,
  SCREENING_STATUS_LABEL,
} from '../../api/channelScreenings';

function DetailPanel({ item, onAction }) {
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setShowReject(false); setRejectReason(''); setError(''); }, [item]);

  if (!item) return (
    <div className="card h-full flex flex-col items-center justify-center gap-3 text-on-surface-variant p-8">
      <span className="material-symbols-outlined text-4xl text-outline">verified</span>
      <p className="text-sm">지원자를 선택하면 상세 정보가 표시됩니다.</p>
    </div>
  );

  const st = SCREENING_STATUS_LABEL[item.status] ?? { label: item.status, cls: 'bg-surface-container text-outline' };

  const handleApprove = async () => {
    if (!confirm('승인하시겠습니까?')) return;
    setSubmitting(true);
    try { await approveChannelScreening(item.screeningNo); onAction(); }
    catch { setError('승인 처리에 실패했습니다.'); }
    finally { setSubmitting(false); }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try { await rejectChannelScreening(item.screeningNo, rejectReason); onAction(); }
    catch { setError('거절 처리에 실패했습니다.'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="p-5 border-b border-outline-variant/50 bg-surface-container-low">
        <span className={`badge ${st.cls}`}>{st.label}</span>
        <h3 className="font-bold text-on-surface mt-2">{item.applicantName}</h3>
        <p className="text-xs text-outline mt-0.5">{item.screeningNo}</p>
      </div>
      <div className="p-5 border-b border-outline-variant/50 space-y-3">
        {[
          { label: '채널 유형', value: item.channelType === 'DESIGNER' ? '설계사' : '대리점' },
          { label: '지원일',   value: item.applicationDate },
          { label: '경력',     value: item.career },
          { label: '자격증',   value: item.certifications?.join(', ') || '—' },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-on-surface-variant">{label}</span>
            <span className="font-medium text-on-surface">{value ?? '—'}</span>
          </div>
        ))}
      </div>
      {item.status === 'PENDING' && (
        <div className="p-5 space-y-3">
          {!showReject ? (
            <div className="flex gap-2">
              <button onClick={handleApprove} disabled={submitting} className="flex-1 bg-primary text-on-primary py-2 rounded-lg text-sm font-semibold hover:opacity-90">승인</button>
              <button onClick={() => setShowReject(true)} className="flex-1 bg-error/10 text-error py-2 rounded-lg text-sm font-semibold hover:bg-error/20">거절</button>
            </div>
          ) : (
            <form onSubmit={handleReject} className="space-y-2">
              <textarea className="input resize-none text-sm" rows={3} placeholder="거절 사유를 입력하세요..." value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} required />
              {error && <p className="text-xs text-error">{error}</p>}
              <div className="flex gap-2">
                <button type="button" className="btn-ghost flex-1" onClick={() => setShowReject(false)}>취소</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-error text-on-error py-2 rounded-lg text-sm font-semibold">{submitting ? '처리 중...' : '거절 확인'}</button>
              </div>
            </form>
          )}
          {error && !showReject && <p className="text-xs text-error">{error}</p>}
        </div>
      )}
    </div>
  );
}

export default function ChannelScreeningListPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchChannelScreenings({ page, size: 20 });
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch { } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const filtered = statusFilter ? items.filter((i) => i.status === statusFilter) : items;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">채널 심사</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">총 {total}건 · 대기 {items.filter(i => i.status === 'PENDING').length}건</p>
        </div>
        <div className="flex gap-1">
          {[{ v: '', l: '전체' }, { v: 'PENDING', l: '대기' }, { v: 'APPROVED', l: '승인' }, { v: 'REJECTED', l: '거절' }].map(({ v, l }) => (
            <button key={v} onClick={() => setStatusFilter(v)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${statusFilter === v ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-outline">group</span>
              <p className="text-sm">심사 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/50 bg-surface-container-low">
                    {['지원자명', '채널 유형', '지원일', '상태'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item) => {
                    const st = SCREENING_STATUS_LABEL[item.status] ?? { label: item.status, cls: 'bg-surface-container text-outline' };
                    return (
                      <tr key={item.screeningNo} onClick={() => setSelected(item)}
                        className={`border-b border-outline-variant/30 cursor-pointer hover:bg-surface-container-low transition-colors ${selected?.screeningNo === item.screeningNo ? 'bg-primary/5' : ''}`}>
                        <td className="px-4 py-3 font-medium text-on-surface">{item.applicantName}</td>
                        <td className="px-4 py-3 text-on-surface-variant">{item.channelType === 'DESIGNER' ? '설계사' : '대리점'}</td>
                        <td className="px-4 py-3 text-on-surface-variant text-xs">{item.applicationDate}</td>
                        <td className="px-4 py-3"><span className={`badge ${st.cls}`}>{st.label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost p-1.5 disabled:opacity-30"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium ${p === page ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}>{p}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost p-1.5 disabled:opacity-30"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
            </div>
          )}
        </div>
        <div className="lg:col-span-5 lg:sticky lg:top-24 self-start">
          <DetailPanel item={selected} onAction={() => { setSelected(null); load(); }} />
        </div>
      </div>
    </div>
  );
}
