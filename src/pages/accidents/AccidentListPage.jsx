import { useState, useEffect, useCallback } from 'react';
import {
  fetchAccidents,
  fetchAccident,
  fetchDispatchRecord,
  recordDispatch,
  ACCIDENT_TYPE_LABEL,
  ACCIDENT_STATUS_LABEL,
} from '../../api/accidents';

function formatDate(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}

// ── 사고 카드 ────────────────────────────────────────────────────
function AccidentCard({ item, selected, onClick }) {
  const st = ACCIDENT_STATUS_LABEL[item.status] ?? { label: item.status, cls: 'bg-surface-container text-outline' };
  return (
    <div
      onClick={() => onClick(item)}
      className={`card p-4 cursor-pointer transition-all duration-200 hover:shadow-md border-l-4
        ${item.status === 'RECEIVED' ? 'border-l-error' : 'border-l-primary-container'}
        ${selected ? 'ring-2 ring-primary/30' : ''}`}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-[11px] font-mono text-outline">{item.reportNo}</span>
        <span className={`badge text-[11px] ${st.cls}`}>{st.label}</span>
      </div>
      <p className="font-semibold text-on-surface text-sm">{item.ownerName ?? item.customerId}</p>
      <div className="mt-2 space-y-1">
        {item.vehicleNo && (
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[13px]">directions_car</span>
            <span>{item.vehicleNo}</span>
          </div>
        )}
        {item.location && (
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[13px]">location_on</span>
            <span className="truncate">{item.location}</span>
          </div>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="badge bg-surface-container text-on-surface-variant text-[11px]">
          {ACCIDENT_TYPE_LABEL[item.accidentType] ?? item.accidentType}
        </span>
        <span className="text-[11px] text-outline">{formatDate(item.reportedAt)}</span>
      </div>
    </div>
  );
}

// ── 출동 기록 등록 폼 ────────────────────────────────────────────
function DispatchRecordForm({ dispatchNo, onRecorded }) {
  const [form, setForm] = useState({ agentName: '', policeRequired: false, towingRequired: false, notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({
    ...f,
    [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('agentName', form.agentName);
      fd.append('policeRequired', form.policeRequired);
      fd.append('towingRequired', form.towingRequired);
      if (form.notes) fd.append('notes', form.notes);
      await recordDispatch(dispatchNo, fd);
      onRecorded();
    } catch {
      setError('출동 기록 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-4 border-t border-outline-variant/50">
      <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">출동 기록 등록</p>
      <input className="input text-sm" placeholder="출동 요원 이름" value={form.agentName} onChange={set('agentName')} />
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
          <input type="checkbox" className="accent-primary" checked={form.policeRequired} onChange={set('policeRequired')} />
          경찰 신고 필요
        </label>
        <label className="flex items-center gap-2 text-sm text-on-surface cursor-pointer">
          <input type="checkbox" className="accent-primary" checked={form.towingRequired} onChange={set('towingRequired')} />
          견인 필요
        </label>
      </div>
      <textarea className="input resize-none text-sm" rows={3} placeholder="메모 (선택)" value={form.notes} onChange={set('notes')} />
      {error && <p className="text-xs text-error">{error}</p>}
      <button type="submit" className="btn-primary w-full" disabled={submitting}>
        {submitting ? '등록 중...' : '출동 기록 등록'}
      </button>
    </form>
  );
}

// ── 상세 패널 ────────────────────────────────────────────────────
function DetailPanel({ reportNo, onUpdate }) {
  const [detail, setDetail] = useState(null);
  const [dispatchRecord, setDispatchRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recordLoaded, setRecordLoaded] = useState(false);

  useEffect(() => {
    if (!reportNo) return;
    setLoading(true);
    setDetail(null);
    setDispatchRecord(null);
    setRecordLoaded(false);
    fetchAccident(reportNo)
      .then(async (acc) => {
        setDetail(acc);
        if (acc.dispatchNo) {
          try {
            const rec = await fetchDispatchRecord(acc.dispatchNo);
            setDispatchRecord(rec);
          } catch { /* 기록 없음 */ }
          setRecordLoaded(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [reportNo]);

  if (!reportNo) {
    return (
      <div className="card h-full flex flex-col items-center justify-center gap-3 text-on-surface-variant p-8">
        <span className="material-symbols-outlined text-4xl text-outline">car_crash</span>
        <p className="text-sm">사고를 선택하면 상세 정보가 표시됩니다.</p>
      </div>
    );
  }
  if (loading) return (
    <div className="card h-full flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!detail) return null;

  const st = ACCIDENT_STATUS_LABEL[detail.status] ?? { label: detail.status, cls: 'bg-surface-container text-outline' };

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="p-5 border-b border-outline-variant/50 bg-surface-container-low">
        <div className="flex items-center gap-2 mb-1">
          <span className={`badge ${st.cls}`}>{st.label}</span>
          <span className="badge bg-surface-container text-on-surface-variant text-[11px]">
            {ACCIDENT_TYPE_LABEL[detail.accidentType]}
          </span>
        </div>
        <p className="text-xs font-mono text-outline">{detail.reportNo}</p>
      </div>

      <div className="p-5 border-b border-outline-variant/50 space-y-3">
        {[
          { label: '차량번호',  value: detail.vehicleNo },
          { label: '소유자',    value: detail.ownerName },
          { label: '연락처',    value: detail.phoneNo },
          { label: '사고 위치', value: detail.location },
          { label: '피해 유형', value: detail.damageType },
          { label: '접수 일시', value: formatDate(detail.reportedAt) },
          { label: '출동 번호', value: detail.dispatchNo ?? '없음' },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-on-surface-variant">{label}</span>
            <span className="font-medium text-on-surface text-right max-w-[60%]">{value ?? '—'}</span>
          </div>
        ))}
        {detail.needsDispatch && (
          <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/5 px-3 py-2 rounded-lg">
            <span className="material-symbols-outlined text-[14px]">emergency_share</span>
            출동 요청됨
          </div>
        )}
      </div>

      {/* 출동 기록 */}
      {detail.dispatchNo && (
        <div className="p-5">
          {dispatchRecord ? (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-primary flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                출동 기록 완료
              </p>
              <p className="text-sm text-on-surface-variant">담당: {dispatchRecord.agentName ?? '—'}</p>
              {dispatchRecord.notes && <p className="text-sm text-on-surface">{dispatchRecord.notes}</p>}
            </div>
          ) : recordLoaded ? (
            <DispatchRecordForm
              dispatchNo={detail.dispatchNo}
              onRecorded={() => { onUpdate(); }}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────────
export default function AccidentListPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [selectedNo, setSelectedNo] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAccidents({ page, size: 20 });
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">사고 접수·출동</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">총 {total}건</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-error-container/30 rounded-full text-xs text-error font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
            접수 {items.filter((i) => i.status === 'RECEIVED').length}건
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── 목록 ───────────────────────── */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-outline">car_crash</span>
              <p className="text-sm">접수된 사고가 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <AccidentCard
                  key={item.reportNo}
                  item={item}
                  selected={selectedNo === item.reportNo}
                  onClick={(i) => setSelectedNo(i.reportNo)}
                />
              ))}
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-2">
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
        </div>

        {/* ── 상세 패널 ──────────────────── */}
        <div className="lg:col-span-7 lg:sticky lg:top-24 self-start">
          <DetailPanel reportNo={selectedNo} onUpdate={() => { setSelectedNo(null); load(); }} />
        </div>
      </div>
    </div>
  );
}
