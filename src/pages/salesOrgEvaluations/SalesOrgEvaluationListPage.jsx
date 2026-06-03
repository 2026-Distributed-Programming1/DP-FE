import { useState, useEffect, useCallback } from 'react';
import {
  fetchSalesOrgEvaluations,
  createSalesOrgEvaluation,
  createBonusRequest,
  EVAL_GRADE_CLS,
  EVAL_GRADE_LABEL,
  CHANNEL_TYPE_OPTIONS,
} from '../../api/salesOrgEvaluations';

function fmt(n) { return n?.toLocaleString('ko-KR') ?? '—'; }

function DetailPanel({ item, onEvaluated }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ evaluationGrade: 'B', evaluationComment: '' });
  const [baseSalary, setBaseSalary] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setShowForm(false); setError(''); }, [item]);

  if (!item) return (
    <div className="card h-full flex flex-col items-center justify-center gap-3 text-on-surface-variant p-8">
      <span className="material-symbols-outlined text-4xl text-outline">leaderboard</span>
      <p className="text-sm">채널을 선택하면 상세 정보가 표시됩니다.</p>
    </div>
  );

  const gradeHighEnough = ['S', 'A'].includes(form.evaluationGrade);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await createSalesOrgEvaluation({
        channelName: item.channelName, channelType: item.channelType,
        salesResult: item.salesResult, contractCount: item.contractCount,
        achievementRate: item.achievementRate,
        ...form,
      });
      if (gradeHighEnough && baseSalary) {
        await createBonusRequest({
          evaluationNo: result.evaluationNo, channelName: item.channelName,
          channelType: item.channelType, evaluationGrade: form.evaluationGrade,
          baseSalary: Number(baseSalary), requestReason: '평가 등급에 따른 성과급 요청',
        });
      }
      onEvaluated();
    } catch { setError('평가 등록에 실패했습니다.'); } finally { setSubmitting(false); }
  };

  return (
    <div className="card flex flex-col overflow-hidden">
      <div className="p-5 border-b border-outline-variant/50 bg-surface-container-low">
        <h3 className="font-bold text-on-surface">{item.channelName}</h3>
        <p className="text-xs text-on-surface-variant mt-0.5">{item.channelType === 'DESIGNER' ? '설계사' : '대리점'}</p>
      </div>
      <div className="p-5 border-b border-outline-variant/50 space-y-3">
        {[
          { label: '매출실적', value: `${fmt(item.salesResult)}원` },
          { label: '계약건수', value: `${fmt(item.contractCount)}건` },
          { label: '목표달성률', value: item.achievementRate != null ? `${Number(item.achievementRate).toFixed(1)}%` : '—' },
          { label: '평가등급', value: item.evaluationGrade ? EVAL_GRADE_LABEL[item.evaluationGrade] : '미평가' },
        ].map(({ label, value }) => (
          <div key={label} className="flex justify-between text-sm">
            <span className="text-on-surface-variant">{label}</span>
            <span className="font-medium text-on-surface">{value}</span>
          </div>
        ))}
      </div>
      <div className="p-5">
        {!showForm ? (
          <button onClick={() => setShowForm(true)} className="btn-primary w-full">평가 등록</button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant">평가 등급</label>
              <div className="flex gap-1">
                {['S', 'A', 'B', 'C', 'D'].map((g) => (
                  <button key={g} type="button" onClick={() => setForm(f => ({ ...f, evaluationGrade: g }))}
                    className={`flex-1 py-2 rounded-lg text-sm font-bold border-2 transition-colors ${form.evaluationGrade === g ? EVAL_GRADE_CLS[g] + ' border-transparent' : 'border-outline-variant text-on-surface-variant'}`}>{g}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-on-surface-variant">평가 의견 (선택)</label>
              <textarea className="input resize-none text-sm" rows={2} value={form.evaluationComment} onChange={(e) => setForm(f => ({ ...f, evaluationComment: e.target.value }))} />
            </div>
            {gradeHighEnough && (
              <div className="space-y-1.5 bg-primary/5 p-3 rounded-lg">
                <label className="text-xs font-semibold text-primary">성과급 요청 (S/A 등급)</label>
                <input type="number" className="input text-sm" placeholder="기본급 입력 (원)" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} />
              </div>
            )}
            {error && <p className="text-xs text-error">{error}</p>}
            <div className="flex gap-2">
              <button type="button" className="btn-ghost flex-1" onClick={() => setShowForm(false)}>취소</button>
              <button type="submit" className="btn-primary flex-1" disabled={submitting}>{submitting ? '등록 중...' : '등록'}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function SalesOrgEvaluationListPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [channelType, setChannelType] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchSalesOrgEvaluations({ channelType, page, size: 20 });
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch { } finally { setLoading(false); }
  }, [channelType, page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">영업조직 평가</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">총 {total}건</p>
        </div>
        <div className="flex gap-1">
          {CHANNEL_TYPE_OPTIONS.map(({ value, label }) => (
            <button key={value} onClick={() => { setChannelType(value); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${channelType === value ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>{label}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 flex flex-col gap-3">
          {loading ? (
            <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
          ) : items.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-outline">leaderboard</span>
              <p className="text-sm">평가 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline-variant/50 bg-surface-container-low">
                    {['채널명', '채널유형', '매출실적', '계약건수', '달성률', '등급'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-on-surface-variant">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.evaluationNo} onClick={() => setSelected(item)}
                      className={`border-b border-outline-variant/30 cursor-pointer hover:bg-surface-container-low transition-colors ${selected?.evaluationNo === item.evaluationNo ? 'bg-primary/5' : ''}`}>
                      <td className="px-4 py-3 font-medium text-on-surface">{item.channelName}</td>
                      <td className="px-4 py-3 text-on-surface-variant">{item.channelType === 'DESIGNER' ? '설계사' : '대리점'}</td>
                      <td className="px-4 py-3">{fmt(item.salesResult)}원</td>
                      <td className="px-4 py-3">{fmt(item.contractCount)}건</td>
                      <td className="px-4 py-3">{item.achievementRate != null ? `${Number(item.achievementRate).toFixed(1)}%` : '—'}</td>
                      <td className="px-4 py-3">
                        {item.evaluationGrade
                          ? <span className={`badge ${EVAL_GRADE_CLS[item.evaluationGrade]}`}>{item.evaluationGrade}</span>
                          : <span className="text-outline text-xs">미평가</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost p-1.5 disabled:opacity-30"><span className="material-symbols-outlined text-[18px]">chevron_left</span></button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-sm font-medium ${p === page ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost p-1.5 disabled:opacity-30"><span className="material-symbols-outlined text-[18px]">chevron_right</span></button>
            </div>
          )}
        </div>
        <div className="lg:col-span-5 lg:sticky lg:top-24 self-start">
          <DetailPanel item={selected} onEvaluated={() => { setSelected(null); load(); }} />
        </div>
      </div>
    </div>
  );
}
