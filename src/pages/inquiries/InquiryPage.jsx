import { useState, useEffect, useCallback } from 'react';
import { useAuth, isStaff } from '../../context/AuthContext';
import {
  fetchInquiries,
  fetchInquiry,
  createInquiry,
  answerInquiry,
  INQUIRY_TYPE_LABEL,
  INQUIRY_STATUS_LABEL,
} from '../../api/inquiries';

// ── 상태별 스타일 ────────────────────────────────────────────────
const STATUS_STYLE = {
  PENDING:  { border: 'border-l-error',           badge: 'bg-error-container text-on-error-container' },
  ANSWERED: { border: 'border-l-primary-container', badge: 'bg-primary-container/20 text-primary' },
};

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
}

// ── 문의 카드 ────────────────────────────────────────────────────
function InquiryCard({ item, selected, onClick }) {
  const style = STATUS_STYLE[item.status] ?? STATUS_STYLE.PENDING;
  return (
    <div
      onClick={() => onClick(item)}
      className={`card border-l-4 ${style.border} p-5 cursor-pointer
                  transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
                  ${selected ? 'ring-2 ring-primary/30' : ''}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`badge shrink-0 ${style.badge}`}>
            {INQUIRY_STATUS_LABEL[item.status]}
          </span>
          <span className="text-sm font-semibold text-on-surface truncate">
            {item.title}
          </span>
        </div>
        <span className="text-xs text-outline shrink-0">{formatDate(item.createdAt)}</span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-[14px]">person</span>
          <span>{item.customerName}</span>
          <span className="text-outline">·</span>
          <span>{INQUIRY_TYPE_LABEL[item.inquiryType] ?? item.inquiryType}</span>
        </div>
        <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
      </div>
    </div>
  );
}

// ── 상세 패널 ────────────────────────────────────────────────────
function DetailPanel({ inquiryNo, canAnswer, onAnswerDone }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!inquiryNo) return;
    setLoading(true);
    setDetail(null);
    setAnswer('');
    setError('');
    fetchInquiry(inquiryNo)
      .then(setDetail)
      .catch(() => setError('상세 정보를 불러오지 못했습니다.'))
      .finally(() => setLoading(false));
  }, [inquiryNo]);

  const handleAnswer = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    setSubmitting(true);
    try {
      await answerInquiry(inquiryNo, answer.trim());
      onAnswerDone();
    } catch {
      setError('답변 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!inquiryNo) {
    return (
      <div className="card h-full flex flex-col items-center justify-center gap-3 text-on-surface-variant p-8">
        <span className="material-symbols-outlined text-4xl text-outline">inbox</span>
        <p className="text-sm">문의를 선택하면 상세 내용이 표시됩니다.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card h-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !detail) {
    return (
      <div className="card h-full flex items-center justify-center text-sm text-error p-8">
        {error}
      </div>
    );
  }

  if (!detail) return null;

  const style = STATUS_STYLE[detail.status] ?? STATUS_STYLE.PENDING;

  return (
    <div className="card flex flex-col gap-0 overflow-hidden">
      {/* 헤더 */}
      <div className={`border-l-4 ${style.border} p-5 border-b border-outline-variant/50`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`badge ${style.badge}`}>{INQUIRY_STATUS_LABEL[detail.status]}</span>
          <span className="text-xs text-on-surface-variant">
            {INQUIRY_TYPE_LABEL[detail.inquiryType] ?? detail.inquiryType}
          </span>
        </div>
        <h3 className="font-semibold text-on-surface">{detail.title}</h3>
        <p className="text-xs text-on-surface-variant mt-1">
          {detail.customerName} · {formatDate(detail.createdAt)}
        </p>
      </div>

      {/* 문의 내용 */}
      <div className="p-5 border-b border-outline-variant/50">
        <p className="text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">
          {detail.content}
        </p>
      </div>

      {/* 답변 */}
      {detail.answerContent && (
        <div className="p-5 bg-surface-container-low border-b border-outline-variant/50">
          <p className="text-xs font-semibold text-primary mb-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            답변
          </p>
          <p className="text-sm text-on-surface leading-relaxed whitespace-pre-wrap">
            {detail.answerContent}
          </p>
        </div>
      )}

      {/* 답변 입력 (직원 + PENDING) */}
      {canAnswer && detail.status === 'PENDING' && (
        <form onSubmit={handleAnswer} className="p-5 flex flex-col gap-3">
          <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">
            답변 작성
          </label>
          <textarea
            className="input resize-none text-sm"
            rows={4}
            placeholder="답변 내용을 입력하세요..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
          />
          {error && <p className="text-xs text-error">{error}</p>}
          <button type="submit" className="btn-primary self-end" disabled={submitting}>
            {submitting ? '등록 중...' : '답변 등록'}
          </button>
        </form>
      )}
    </div>
  );
}

// ── 새 문의 모달 ──────────────────────────────────────────────────
const INQUIRY_TYPES = Object.entries(INQUIRY_TYPE_LABEL).map(([value, label]) => ({ value, label }));

function NewInquiryModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    customerName: '', inquiryType: 'OTHER', title: '', content: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createInquiry(form);
      onCreated();
    } catch {
      setError('문의 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
      <div className="card w-full max-w-lg p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-on-surface">새 문의 작성</h3>
          <button onClick={onClose} className="btn-ghost p-1">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">이름</label>
            <input className="input" value={form.customerName} onChange={set('customerName')} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">문의 유형</label>
            <select className="input" value={form.inquiryType} onChange={set('inquiryType')}>
              {INQUIRY_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">제목</label>
            <input className="input" value={form.title} onChange={set('title')} required />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wide">내용</label>
            <textarea className="input resize-none" rows={4} value={form.content} onChange={set('content')} required />
          </div>
          {error && <p className="text-xs text-error">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" className="btn-secondary" onClick={onClose}>취소</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? '등록 중...' : '문의 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── 메인 페이지 ──────────────────────────────────────────────────
const STATUS_FILTERS = [
  { value: '', label: '전체' },
  { value: 'PENDING', label: '답변대기' },
  { value: 'ANSWERED', label: '답변완료' },
];

export default function InquiryPage() {
  const { user } = useAuth();
  const staff = isStaff(user?.role);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedNo, setSelectedNo] = useState(null);
  const [showNew, setShowNew] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchInquiries({
        status: statusFilter,
        customerName: staff ? keyword : '',
        page,
        size: 20,
      });
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch {
      /* 에러는 빈 목록으로 처리 */
    } finally {
      setLoading(false);
    }
  }, [statusFilter, keyword, page, staff]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / 20));

  const handleAnswerDone = () => {
    setSelectedNo(null);
    load();
  };

  const handleCreated = () => {
    setShowNew(false);
    load();
  };

  const pendingCount = items.filter((i) => i.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">문의 관리</h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            총 {total}건 · 답변대기 {pendingCount}건
          </p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">add</span>
          새 문의
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── 목록 ───────────────────────── */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* 필터 + 검색 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-1">
              {STATUS_FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => { setStatusFilter(value); setPage(1); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
                    ${statusFilter === value
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {staff && (
              <input
                className="input flex-1 text-sm"
                placeholder="고객명 검색..."
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              />
            )}
          </div>

          {/* 카드 목록 */}
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : items.length === 0 ? (
            <div className="card flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl text-outline">inbox</span>
              <p className="text-sm">문의 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <InquiryCard
                  key={item.inquiryNo}
                  item={item}
                  selected={selectedNo === item.inquiryNo}
                  onClick={(i) => setSelectedNo(i.inquiryNo)}
                />
              ))}
            </div>
          )}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-ghost p-1.5 disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                    ${p === page
                      ? 'bg-primary text-on-primary'
                      : 'text-on-surface-variant hover:bg-surface-container'}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-ghost p-1.5 disabled:opacity-30"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          )}
        </div>

        {/* ── 상세 패널 ──────────────────── */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 self-start">
          <DetailPanel
            inquiryNo={selectedNo}
            canAnswer={staff}
            onAnswerDone={handleAnswerDone}
          />
        </div>
      </div>

      {/* 새 문의 모달 */}
      {showNew && (
        <NewInquiryModal onClose={() => setShowNew(false)} onCreated={handleCreated} />
      )}
    </div>
  );
}
