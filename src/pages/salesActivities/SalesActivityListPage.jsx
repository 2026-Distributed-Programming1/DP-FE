import { useState, useEffect, useCallback } from 'react';
import {
  fetchSalesActivities,
  createSalesActivity,
  CHANNEL_TYPE_OPTIONS,
} from '../../api/salesActivities';

function fmt(n, suffix = '') {
  if (n == null) return '—';
  return `${Number(n).toLocaleString('ko-KR')}${suffix}`;
}

function AchievementBadge({ rate }) {
  if (rate == null) return <span className="text-outline text-sm">—</span>;
  const pct = Number(rate).toFixed(1);
  if (rate < 70) return <span className="badge bg-error-container text-on-error-container">{pct}%</span>;
  if (rate < 90) return <span className="badge bg-error-container/30 text-error">{pct}%</span>;
  return <span className="badge bg-primary-container/20 text-primary">{pct}%</span>;
}

// 컴포넌트 바깥에 정의 (렌더링마다 새 타입으로 취급되어 포커스가 풀리는 문제 방지)
function Field({ label, type = 'text', placeholder, value, onChange, required }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-on-surface-variant">{label}</label>
      <input type={type} className="input text-sm" placeholder={placeholder} value={value} onChange={onChange} required={required} />
    </div>
  );
}

// ── 신규 등록 모달 ────────────────────────────────────────────────
function NewActivityModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    managerName: '', channelName: '', channelType: 'DESIGNER',
    startDate: '', endDate: '',
    visitCount: '', contractCount: '', achievementRate: '',
    improvementContent: '', revisedTarget: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createSalesActivity({
        ...form,
        visitCount: Number(form.visitCount),
        contractCount: Number(form.contractCount),
        achievementRate: Number(form.achievementRate),
        revisedTarget: form.revisedTarget ? Number(form.revisedTarget) : undefined,
      });
      onCreated();
    } catch {
      setError('등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const required = (k) => ['managerName','channelName','startDate','endDate','visitCount','contractCount','achievementRate'].includes(k);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-on-surface">영업활동 등록</h3>
          <button onClick={onClose} className="btn-ghost p-1"><span className="material-symbols-outlined text-[20px]">close</span></button>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
          <Field label="담당자명 *" value={form.managerName} onChange={set('managerName')} required={required('managerName')} />
          <Field label="채널명 *" value={form.channelName} onChange={set('channelName')} required={required('channelName')} />
          <div className="space-y-1.5 col-span-2">
            <label className="text-xs font-semibold text-on-surface-variant">채널 유형 *</label>
            <select className="input text-sm" value={form.channelType} onChange={set('channelType')}>
              {CHANNEL_TYPE_OPTIONS.filter(o => o.value).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <Field label="시작일 *" value={form.startDate} onChange={set('startDate')} type="date" required={required('startDate')} />
          <Field label="종료일 *" value={form.endDate} onChange={set('endDate')} type="date" required={required('endDate')} />
          <Field label="방문건수 *" value={form.visitCount} onChange={set('visitCount')} type="number" placeholder="0" required={required('visitCount')} />
          <Field label="계약건수 *" value={form.contractCount} onChange={set('contractCount')} type="number" placeholder="0" required={required('contractCount')} />
          <Field label="목표달성률(%) *" value={form.achievementRate} onChange={set('achievementRate')} type="number" placeholder="0" required={required('achievementRate')} />
          <Field label="수정 목표" value={form.revisedTarget} onChange={set('revisedTarget')} type="number" placeholder="선택" />
          <div className="space-y-1.5 col-span-2">
            <label className="text-xs font-semibold text-on-surface-variant">개선 내용</label>
            <textarea className="input resize-none text-sm" rows={2} value={form.improvementContent} onChange={set('improvementContent')} />
          </div>
          {error && <p className="col-span-2 text-xs text-error">{error}</p>}
          <button type="button" className="btn-secondary" onClick={onClose}>취소</button>
          <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? '등록 중...' : '등록'}</button>
        </form>
      </div>
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────────
export default function SalesActivityListPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [channelType, setChannelType] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSalesActivities({ channelType, page, size: 20 });
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch { /* 빈 처리 */ } finally {
      setLoading(false);
    }
  }, [channelType, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / 20));
  const atRiskCount = items.filter((i) => (i.achievementRate ?? 0) < 70).length;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-on-surface">영업 활동 관리</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            총 {total}건
            {atRiskCount > 0 && (
              <span className="ml-2 text-error font-medium">· 목표 미달 {atRiskCount}건</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* 채널 유형 필터 */}
          <div className="flex gap-1">
            {CHANNEL_TYPE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => { setChannelType(value); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
                  ${channelType === value ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">add</span>
            등록
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
          <span className="material-symbols-outlined text-4xl text-outline">trending_up</span>
          <p className="text-sm">등록된 영업활동이 없습니다.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/50 bg-surface-container-low">
                  {['채널명', '채널 유형', '방문건수', '계약건수', '전환율', '목표달성률', '기간'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr
                    key={item.activityNo}
                    onClick={() => setSelected(selected?.activityNo === item.activityNo ? null : item)}
                    className={`border-b border-outline-variant/30 cursor-pointer transition-colors
                      ${(item.achievementRate ?? 0) < 70 ? 'bg-error-container/5 hover:bg-error-container/10' : 'hover:bg-surface-container-low'}
                      ${selected?.activityNo === item.activityNo ? 'ring-1 ring-inset ring-primary/30' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium text-on-surface">{item.channelName}</td>
                    <td className="px-4 py-3 text-on-surface-variant">
                      {item.channelType === 'DESIGNER' ? '설계사' : '대리점'}
                    </td>
                    <td className="px-4 py-3">{fmt(item.visitCount)}</td>
                    <td className="px-4 py-3">{fmt(item.contractCount)}</td>
                    <td className="px-4 py-3">{item.conversionRate != null ? `${Number(item.conversionRate).toFixed(1)}%` : '—'}</td>
                    <td className="px-4 py-3"><AchievementBadge rate={item.achievementRate} /></td>
                    <td className="px-4 py-3 text-on-surface-variant text-xs">{item.startDate} ~ {item.endDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 선택된 행 상세 */}
      {selected && (
        <div className="card p-5 border-l-4 border-l-primary space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-on-surface">{selected.channelName} 상세</h3>
            <button onClick={() => setSelected(null)} className="btn-ghost p-1">
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            {[
              { label: '담당자', value: selected.managerName },
              { label: '수정 목표', value: selected.revisedTarget ?? '—' },
              { label: '개선 내용', value: selected.improvementContent || '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-on-surface-variant">{label}</p>
                <p className="font-medium text-on-surface mt-0.5">{value}</p>
              </div>
            ))}
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

      {showNew && <NewActivityModal onClose={() => setShowNew(false)} onCreated={() => { setShowNew(false); load(); }} />}
    </div>
  );
}
