import { useEffect, useState } from 'react';
import { fetchSalesOrgEvaluations, createSalesOrgEvaluation } from '../../api/salesOrgEvaluations';
import Layout from '../../components/layout/Layout';
import Pagination from '../../components/common/Pagination';
import styles from './SalesOrgEvaluationListPage.module.css';

// FE-SALES-11: ChannelType enum 하드코딩 (UC 기준: 설계사/대리점)
const CHANNEL_TYPES = [
  { value: '',       label: '전체' },
  { value: 'AGENT',  label: '설계사' },
  { value: 'AGENCY', label: '대리점' },
];

const GRADES = ['S', 'A', 'B', 'C', 'D'];

const GRADE_CLS = {
  S: styles.gradeS,
  A: styles.gradeA,
  B: styles.gradeB,
  C: styles.gradeC,
  D: styles.gradeD,
};

function monthStart() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function fmtAmount(v) {
  if (v == null) return '-';
  return Number(v).toLocaleString() + '원';
}

function fmtRate(v) {
  if (v == null) return '-';
  return Number(v).toFixed(1) + '%';
}

/* ── 취소 확인 팝업 ── */
function CancelConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p className={styles.modalMsg}>
          작성 중인 내용이 저장되지 않습니다. 취소하시겠습니까?
        </p>
        <div className={styles.modalBtns}>
          <button className={styles.modalConfirmBtn} onClick={onConfirm}>확인</button>
          <button className={styles.modalCancelBtn} onClick={onCancel}>취소</button>
        </div>
      </div>
    </div>
  );
}

/* ── 평가 등록 완료 결과 팝업 ── */
function ResultModal({ result, channelName, onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>평가 등록 완료</h3>
        <dl className={styles.resultDl}>
          <dt>평가번호</dt>
          <dd className={styles.mono}>{result?.evaluationNo ?? '-'}</dd>
          <dt>등록일시</dt>
          <dd>{result?.createdAt ?? '-'}</dd>
          <dt>채널명</dt>
          <dd>{channelName ?? '-'}</dd>
          <dt>평가등급</dt>
          <dd>
            <span className={`${styles.gradeBadge} ${GRADE_CLS[result?.evaluationGrade] ?? ''}`}>
              {result?.evaluationGrade ?? '-'}
            </span>
          </dd>
        </dl>
        <div className={styles.modalBtns}>
          <button className={styles.modalConfirmBtn} onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  );
}

/* ── 상세 패널 ── */
function DetailPanel({ item, onClose, onReload }) {
  const [view, setView] = useState('detail'); // 'detail' | 'form'
  const [grade, setGrade] = useState('');
  const [comment, setComment] = useState('');
  const [gradeError, setGradeError] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [modal, setModal] = useState(null);
  // modal: null | 'cancel-confirm' | { type: 'result', data }

  useEffect(() => {
    setView('detail');
    setGrade('');
    setComment('');
    setGradeError(false);
    setActionError(null);
    setModal(null);
  }, [item?.evaluationNo]);

  function handleSave() {
    if (!grade) {
      setGradeError(true);
      return;
    }
    setGradeError(false);
    setActionLoading(true);
    setActionError(null);
    createSalesOrgEvaluation({
      channelName: item.channelName,
      channelType: item.channelType,
      startDate: item.startDate,
      endDate: item.endDate,
      evaluationGrade: grade,
      comment: comment.trim() || null,
    })
      .then((result) => {
        onReload();
        setModal({ type: 'result', data: result });
      })
      .catch((e) => setActionError(e.message))
      .finally(() => setActionLoading(false));
  }

  function handleCancelClick() {
    setModal('cancel-confirm');
  }

  function handleCancelConfirm() {
    setModal(null);
    setView('detail');
    setGrade('');
    setComment('');
    setGradeError(false);
    setActionError(null);
  }

  const showBonusBtn = grade === 'S' || grade === 'A';

  return (
    <>
      <aside className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>
            {view === 'detail' ? '성과 상세 정보' : '평가 등록'}
          </span>
          <button className={styles.closeBtn} onClick={onClose}>닫기</button>
        </div>

        <div className={styles.panelBody}>
          {/* ── 상세 뷰 ── */}
          {view === 'detail' && (
            <>
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>채널 정보</h3>
                <dl className={styles.dl}>
                  <dt>채널명</dt>  <dd>{item.channelName ?? '-'}</dd>
                  <dt>채널유형</dt><dd>{CHANNEL_TYPES.find((t) => t.value === item.channelType)?.label ?? item.channelType ?? '-'}</dd>
                </dl>
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>성과 실적</h3>
                <dl className={styles.dl}>
                  <dt>매출실적</dt>    <dd>{fmtAmount(item.salesAmount)}</dd>
                  <dt>계약건수</dt>    <dd>{item.contractCount != null ? `${item.contractCount}건` : '-'}</dd>
                  <dt>목표달성률</dt>  <dd>{fmtRate(item.achievementRate)}</dd>
                  {item.evaluationGrade && (
                    <>
                      <dt>평가등급</dt>
                      <dd>
                        <span className={`${styles.gradeBadge} ${GRADE_CLS[item.evaluationGrade] ?? ''}`}>
                          {item.evaluationGrade}
                        </span>
                      </dd>
                    </>
                  )}
                </dl>
              </section>

              <div className={styles.actionRow}>
                <button
                  className={styles.primaryBtn}
                  onClick={() => setView('form')}
                >
                  평가 등록
                </button>
              </div>
            </>
          )}

          {/* ── 폼 뷰 ── */}
          {view === 'form' && (
            <>
              {actionError && (
                <div className={styles.actionError}>{actionError}</div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  평가 등급 <span className={styles.required}>*</span>
                </label>
                <select
                  className={`${styles.select} ${gradeError ? styles.selectError : ''}`}
                  value={grade}
                  onChange={(e) => { setGrade(e.target.value); setGradeError(false); }}
                >
                  <option value="">등급 선택</option>
                  {GRADES.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                {gradeError && (
                  <p className={styles.fieldError}>필수 항목을 입력해주세요.</p>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>평가 의견</label>
                <textarea
                  className={styles.textarea}
                  placeholder="평가 의견을 입력하세요 (선택)"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
              </div>

              {/* A3: S 또는 A 등급일 때 성과급 지급하기 버튼 노출 */}
              {showBonusBtn && (
                <button
                  className={styles.bonusBtn}
                  onClick={() => alert('성과급 지급 요청 페이지는 준비 중입니다.')}
                  disabled={actionLoading}
                >
                  성과급 지급하기
                </button>
              )}

              <div className={styles.actionRow}>
                <button
                  className={styles.primaryBtn}
                  onClick={handleSave}
                  disabled={actionLoading}
                >
                  {actionLoading ? '저장 중…' : '저장'}
                </button>
                <button
                  className={styles.secondaryBtn}
                  onClick={handleCancelClick}
                  disabled={actionLoading}
                >
                  취소
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {modal === 'cancel-confirm' && (
        <CancelConfirmModal
          onConfirm={handleCancelConfirm}
          onCancel={() => setModal(null)}
        />
      )}

      {modal?.type === 'result' && (
        <ResultModal
          result={modal.data}
          channelName={item.channelName}
          onClose={() => { setModal(null); onClose(); }}
        />
      )}
    </>
  );
}

/* ── 메인 페이지 ── */
export default function SalesOrgEvaluationListPage() {
  const [filters, setFilters] = useState({
    startDate: monthStart(),
    endDate: today(),
    channelType: '',
  });
  const [applied, setApplied] = useState({
    startDate: monthStart(),
    endDate: today(),
    channelType: '',
  });
  const [page, setPage] = useState(0);
  const [size] = useState(15);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNo, setSelectedNo] = useState(null);

  function load(p = page) {
    setLoading(true);
    setError(null);
    fetchSalesOrgEvaluations({ ...applied, page: p, size })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [applied, page]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleSearch() {
    setApplied({ ...filters });
    setPage(0);
    setSelectedNo(null);
  }

  const items = data?.items ?? data?.content ?? [];
  const total = data?.total ?? data?.totalElements ?? 0;

  const selectedItem = items.find((i) => i.evaluationNo === selectedNo) ?? null;

  return (
    <Layout title="영업조직 평가">
      <div className={styles.root}>
        <div className={styles.tableArea}>
          <div className={styles.toolbar}>
            <div className={styles.filters}>
              <input
                type="date"
                className={styles.dateInput}
                value={filters.startDate}
                onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
              />
              <span className={styles.dateSep}>~</span>
              <input
                type="date"
                className={styles.dateInput}
                value={filters.endDate}
                onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
              />
              <select
                className={styles.select}
                value={filters.channelType}
                onChange={(e) => setFilters((f) => ({ ...f, channelType: e.target.value }))}
              >
                {CHANNEL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <button className={styles.searchBtn} onClick={handleSearch}>조회</button>
            </div>
            <span className={styles.totalCount}>
              {total > 0 ? `총 ${total.toLocaleString()}건` : ''}
            </span>
          </div>

          {error && (
            <div className={styles.errorBox}><strong>오류:</strong> {error}</div>
          )}

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>채널명</th>
                  <th>채널유형</th>
                  <th>매출실적</th>
                  <th>계약건수</th>
                  <th>목표달성률</th>
                  <th>평가등급</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={6} className={styles.msgCell}>불러오는 중…</td></tr>
                )}
                {!loading && items.length === 0 && (
                  <tr>
                    <td colSpan={6} className={styles.msgCell}>
                      조회 가능한 데이터가 없습니다.
                    </td>
                  </tr>
                )}
                {!loading && items.map((item) => (
                  <tr
                    key={item.evaluationNo}
                    className={`${styles.row} ${selectedNo === item.evaluationNo ? styles.selectedRow : ''}`}
                    onClick={() =>
                      setSelectedNo((p) => p === item.evaluationNo ? null : item.evaluationNo)
                    }
                  >
                    <td>{item.channelName ?? '-'}</td>
                    <td>{CHANNEL_TYPES.find((t) => t.value === item.channelType)?.label ?? item.channelType ?? '-'}</td>
                    <td className={styles.right}>{fmtAmount(item.salesAmount)}</td>
                    <td className={styles.right}>{item.contractCount != null ? `${item.contractCount}건` : '-'}</td>
                    <td className={styles.right}>{fmtRate(item.achievementRate)}</td>
                    <td>
                      {item.evaluationGrade ? (
                        <span className={`${styles.gradeBadge} ${GRADE_CLS[item.evaluationGrade] ?? ''}`}>
                          {item.evaluationGrade}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {total > 0 && (
            <Pagination page={page} size={size} total={total} onChange={(p) => { setPage(p); setSelectedNo(null); }} />
          )}
        </div>

        {selectedItem && (
          <DetailPanel
            item={selectedItem}
            onClose={() => setSelectedNo(null)}
            onReload={() => load(page)}
          />
        )}
      </div>
    </Layout>
  );
}