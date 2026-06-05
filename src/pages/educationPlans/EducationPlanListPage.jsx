import { useState, useEffect, useCallback } from 'react';
import { fetchEducationPlans, createEducationPlan, approveEducationPlan, rejectEducationPlan, PLAN_STATUS_LABEL } from '../../api/educationPlans';

function formatDate(iso) {
  return iso ? new Date(iso).toLocaleDateString('ko-KR') : '—';
}

function DetailPanel({ item, onAction }) {
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setShowReject(false);
    setRejectReason('');
    setError('');
  }, [item]);

  if (!item)
    return (
      <div className='card h-full flex flex-col items-center justify-center gap-3 text-on-surface-variant p-8'>
        <span className='material-symbols-outlined text-4xl text-outline'>school</span>
        <p className='text-sm'>교육 계획을 선택하면 상세 정보가 표시됩니다.</p>
      </div>
    );

  const st = PLAN_STATUS_LABEL[item.status] ?? { label: item.status, cls: 'bg-surface-container text-outline' };

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await approveEducationPlan(item.planNo);
      onAction();
    } catch {
      setError('승인에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await rejectEducationPlan(item.planNo, rejectReason);
      onAction();
    } catch {
      setError('반려에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='card flex flex-col overflow-hidden'>
      <div className='p-5 border-b border-outline-variant/50 bg-surface-container-low'>
        <span className={`badge ${st.cls}`}>{st.label}</span>
        <h3 className='font-bold text-on-surface mt-2'>{item.educationName}</h3>
        <p className='text-xs text-outline mt-0.5'>{item.planNo}</p>
      </div>
      <div className='p-5 border-b border-outline-variant/50 space-y-3'>
        {[
          { label: '강사명', value: item.trainerName },
          { label: '채널 유형', value: item.channelType === 'DESIGNER' ? '설계사' : '대리점' },
          { label: '교육 기간', value: `${item.startDate} ~ ${item.endDate}` },
          { label: '대상 인원', value: `${item.targetCount}명` },
          { label: '예산', value: item.budget ? `${item.budget.toLocaleString()}원` : '—' },
          { label: '교육 목표', value: item.educationGoal },
        ].map(({ label, value }) => (
          <div key={label} className='flex justify-between text-sm'>
            <span className='text-on-surface-variant'>{label}</span>
            <span className='font-medium text-on-surface text-right max-w-[60%]'>{value ?? '—'}</span>
          </div>
        ))}
        {item.educationContent && (
          <div className='pt-2 border-t border-outline-variant/30'>
            <p className='text-xs text-on-surface-variant mb-1'>교육 내용</p>
            <p className='text-sm text-on-surface leading-relaxed'>{item.educationContent}</p>
          </div>
        )}
      </div>
      {item.status === 'UNDER_REVIEW' && (
        <div className='p-5 space-y-3'>
          {!showReject ? (
            <div className='flex gap-2'>
              <button onClick={handleApprove} disabled={submitting} className='flex-1 bg-primary text-on-primary py-2 rounded-lg text-sm font-semibold'>
                승인
              </button>
              <button onClick={() => setShowReject(true)} className='flex-1 bg-error/10 text-error py-2 rounded-lg text-sm font-semibold'>
                반려
              </button>
            </div>
          ) : (
            <form onSubmit={handleReject} className='space-y-2'>
              <textarea className='input resize-none text-sm' rows={3} placeholder='반려 사유...' value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} required />
              <div className='flex gap-2'>
                <button type='button' className='btn-ghost flex-1' onClick={() => setShowReject(false)}>
                  취소
                </button>
                <button type='submit' disabled={submitting} className='flex-1 bg-error text-on-error py-2 rounded-lg text-sm font-semibold'>
                  반려
                </button>
              </div>
            </form>
          )}
          {error && <p className='text-xs text-error'>{error}</p>}
        </div>
      )}
    </div>
  );
}

function NewPlanModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    trainerName: '',
    educationName: '',
    channelType: 'DESIGNER',
    startDate: '',
    endDate: '',
    targetCount: '',
    budget: '',
    educationGoal: '',
    educationContent: '',
    textbookList: '',
    action: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e, action) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createEducationPlan({ ...form, targetCount: Number(form.targetCount), budget: Number(form.budget), action });
      onCreated();
    } catch {
      setError('등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4'>
      <div className='card w-full max-w-lg max-h-[90vh] overflow-y-auto p-6 space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='font-semibold text-on-surface'>교육 계획 작성</h3>
          <button onClick={onClose} className='btn-ghost p-1'>
            <span className='material-symbols-outlined text-[20px]'>close</span>
          </button>
        </div>
        <form className='grid grid-cols-2 gap-3'>
          {[
            ['교육명', 'educationName', 'col-span-2'],
            ['강사명', 'trainerName', ''],
            ['대상 인원', 'targetCount', ''],
            ['예산(원)', 'budget', ''],
            ['시작일', 'startDate', ''],
            ['종료일', 'endDate', ''],
          ].map(([label, key, span]) => (
            <div key={key} className={`space-y-1.5 ${span}`}>
              <label className='text-xs font-semibold text-on-surface-variant'>{label}</label>
              <input
                type={key.includes('Date') ? 'date' : key.includes('Count') || key.includes('budget') ? 'number' : 'text'}
                className='input text-sm'
                value={form[key]}
                onChange={set(key)}
                required
              />
            </div>
          ))}
          <div className='space-y-1.5 col-span-2'>
            <label className='text-xs font-semibold text-on-surface-variant'>채널 유형</label>
            <select className='input text-sm' value={form.channelType} onChange={set('channelType')}>
              <option value='DESIGNER'>설계사</option>
              <option value='AGENCY'>대리점</option>
            </select>
          </div>
          <div className='space-y-1.5 col-span-2'>
            <label className='text-xs font-semibold text-on-surface-variant'>교육 목표</label>
            <textarea className='input resize-none text-sm' rows={2} value={form.educationGoal} onChange={set('educationGoal')} required />
          </div>
          <div className='space-y-1.5 col-span-2'>
            <label className='text-xs font-semibold text-on-surface-variant'>교육 내용</label>
            <textarea className='input resize-none text-sm' rows={2} value={form.educationContent} onChange={set('educationContent')} required />
          </div>
          {error && <p className='col-span-2 text-xs text-error'>{error}</p>}
          <button type='button' className='btn-secondary' onClick={onClose}>
            취소
          </button>
          <button type='button' className='btn-ghost border border-outline-variant' disabled={submitting} onClick={(e) => handleSubmit(e, '')}>
            임시저장
          </button>
          <button type='button' className='btn-primary col-span-2' disabled={submitting} onClick={(e) => handleSubmit(e, 'REQUEST_APPROVAL')}>
            승인 요청
          </button>
        </form>
      </div>
    </div>
  );
}

export default function EducationPlanListPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchEducationPlans({ status: statusFilter, page, size: 20 });
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => {
    load();
  }, [load]);
  const totalPages = Math.max(1, Math.ceil(total / 20));

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-xl font-bold text-on-surface'>교육 계획</h1>
          <p className='text-sm text-on-surface-variant mt-0.5'>총 {total}건</p>
        </div>
        <div className='flex items-center gap-2'>
          <div className='flex gap-1'>
            {[
              { v: '', l: '전체' },
              { v: 'TEMP_SAVE', l: '임시저장' },
              { v: 'UNDER_REVIEW', l: '승인요청' },
              { v: 'APPROVED', l: '승인' },
              { v: 'REJECTED', l: '반려' },
            ].map(({ v, l }) => (
              <button
                key={v}
                onClick={() => {
                  setStatusFilter(v);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${statusFilter === v ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}>
                {l}
              </button>
            ))}
          </div>
          <button onClick={() => setShowNew(true)} className='btn-primary flex items-center gap-1.5'>
            <span className='material-symbols-outlined text-[16px]'>add</span>신규
          </button>
        </div>
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
        <div className='lg:col-span-7 flex flex-col gap-3'>
          {loading ? (
            <div className='flex justify-center py-16'>
              <div className='w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin' />
            </div>
          ) : items.length === 0 ? (
            <div className='card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant'>
              <span className='material-symbols-outlined text-4xl text-outline'>school</span>
              <p className='text-sm'>교육 계획이 없습니다.</p>
            </div>
          ) : (
            <div className='card overflow-hidden'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-outline-variant/50 bg-surface-container-low'>
                    {['교육명', '강사명', '기간', '대상', '상태'].map((h) => (
                      <th key={h} className='px-4 py-3 text-left text-xs font-semibold text-on-surface-variant'>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const st = PLAN_STATUS_LABEL[item.status] ?? { label: item.status, cls: 'bg-surface-container text-outline' };
                    return (
                      <tr
                        key={item.planNo}
                        onClick={() => setSelected(item)}
                        className={`border-b border-outline-variant/30 cursor-pointer hover:bg-surface-container-low transition-colors ${selected?.planNo === item.planNo ? 'bg-primary/5' : ''}`}>
                        <td className='px-4 py-3 font-medium text-on-surface'>{item.educationName}</td>
                        <td className='px-4 py-3 text-on-surface-variant'>{item.trainerName}</td>
                        <td className='px-4 py-3 text-xs text-on-surface-variant'>
                          {item.startDate}~{item.endDate}
                        </td>
                        <td className='px-4 py-3 text-on-surface-variant'>{item.targetCount}명</td>
                        <td className='px-4 py-3'>
                          <span className={`badge ${st.cls}`}>{st.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {totalPages > 1 && (
            <div className='flex items-center justify-center gap-1 pt-2'>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className='btn-ghost p-1.5 disabled:opacity-30'>
                <span className='material-symbols-outlined text-[18px]'>chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium ${p === page ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className='btn-ghost p-1.5 disabled:opacity-30'>
                <span className='material-symbols-outlined text-[18px]'>chevron_right</span>
              </button>
            </div>
          )}
        </div>
        <div className='lg:col-span-5 lg:sticky lg:top-24 self-start'>
          <DetailPanel
            item={selected}
            onAction={() => {
              setSelected(null);
              load();
            }}
          />
        </div>
      </div>
      {showNew && (
        <NewPlanModal
          onClose={() => setShowNew(false)}
          onCreated={() => {
            setShowNew(false);
            load();
          }}
        />
      )}
    </div>
  );
}
