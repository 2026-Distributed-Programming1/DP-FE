import { useEffect, useState } from 'react';
import {
  fetchChannelScreenings,
  approveChannelScreening,
  rejectChannelScreening,
} from '../../api/channelScreenings';
import Layout from '../../components/layout/Layout';
import styles from './ChannelScreeningListPage.module.css';

// FE-SALES-11: ChannelType enum 하드코딩 (UC 기준: 설계사/대리점)
const CHANNEL_TYPES = [
  { value: '',       label: '전체' },
  { value: 'AGENT',  label: '설계사' },
  { value: 'AGENCY', label: '대리점' },
];

const STATUS_OPTIONS = [
  { value: '',         label: '전체' },
  { value: 'PENDING',  label: '대기' },
  { value: 'APPROVED', label: '승인' },
  { value: 'REJECTED', label: '거절' },
];

const STATUS_MAP = {
  PENDING:  { label: '대기', cls: styles.badgeYellow },
  APPROVED: { label: '승인', cls: styles.badgeGreen  },
  REJECTED: { label: '거절', cls: styles.badgeRed    },
};

function ScreeningBadge({ status }) {
  const cfg = STATUS_MAP[status] ?? { label: status, cls: styles.badgeGray };
  return <span className={`${styles.badge} ${cfg.cls}`}>{cfg.label}</span>;
}

function channelLabel(type) {
  return CHANNEL_TYPES.find((t) => t.value === type)?.label ?? type ?? '-';
}

/* ── 확인 팝업 ── */
function ConfirmModal({ message, onConfirm, onCancel, loading }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p className={styles.modalMsg}>{message}</p>
        <div className={styles.modalBtns}>
          <button className={styles.modalConfirmBtn} onClick={onConfirm} disabled={loading}>
            {loading ? '처리 중…' : '확인'}
          </button>
          <button className={styles.modalCancelBtn} onClick={onCancel} disabled={loading}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 거절 사유 입력 팝업 ── */
function RejectModal({ onConfirm, onCancel, loading, error }) {
  const [reason, setReason] = useState('');
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>거절 사유 입력</h3>
        {error && <p className={styles.modalError}>{error}</p>}
        <textarea
          className={styles.rejectTextarea}
          placeholder="거절 사유를 입력하세요"
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className={styles.modalBtns}>
          <button
            className={styles.modalRejectBtn}
            onClick={() => onConfirm(reason)}
            disabled={loading}
          >
            {loading ? '처리 중…' : '확인'}
          </button>
          <button className={styles.modalCancelBtn} onClick={onCancel} disabled={loading}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── 승인 완료 결과 팝업 ── */
function ApproveResultModal({ result, applicantName, onClose }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>승인 완료</h3>
        <dl className={styles.resultDl}>
          <dt>승인번호</dt>
          <dd className={styles.mono}>{result?.screeningNo ?? result?.approvalNo ?? '-'}</dd>
          <dt>지원자명</dt>
          <dd>{applicantName ?? '-'}</dd>
          <dt>승인일시</dt>
          <dd>{result?.approvedAt ?? '-'}</dd>
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
  const [modal, setModal] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [rejectSuccess, setRejectSuccess] = useState(false);

  useEffect(() => {
    setModal(null);
    setActionError(null);
    setRejectSuccess(false);
  }, [item?.screeningNo]);

  function handleApproveConfirm() {
    setActionLoading(true);
    setActionError(null);
    approveChannelScreening(item.screeningNo)
      .then((result) => {
        onReload();
        setModal({ type: 'approve-result', data: result });
      })
      .catch((e) => {
        setActionError(e.message);
        setModal(null);
      })
      .finally(() => setActionLoading(false));
  }

  function handleRejectConfirm(reason) {
    if (!reason.trim()) {
      setActionError('거절 사유를 입력해주세요.');
      return;
    }
    setActionLoading(true);
    setActionError(null);
    rejectChannelScreening(item.screeningNo, reason.trim())
      .then(() => {
        onReload();
        setModal(null);
        setRejectSuccess(true);
      })
      .catch((e) => setActionError(e.message))
      .finally(() => setActionLoading(false));
  }

  const isPending = item.status === 'PENDING';
  const applicantName = item.applicantName ?? item.channelName;
  const certs = Array.isArray(item.certifications)
    ? item.certifications
    : item.certifications ? [item.certifications] : [];

  return (
    <>
      <aside className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>지원자 상세 정보</span>
          <button className={styles.closeBtn} onClick={onClose}>닫기</button>
        </div>
        <div className={styles.panelBody}>
          {rejectSuccess && (
            <div className={styles.rejectSuccessMsg}>
              해당 지원자가 거절 처리되었습니다.
            </div>
          )}
          {actionError && !modal && (
            <div className={styles.actionError}>{actionError}</div>
          )}

          <dl className={styles.dl}>
            <dt>지원자명</dt><dd>{applicantName ?? '-'}</dd>
            <dt>채널유형</dt><dd>{channelLabel(item.channelType)}</dd>
            <dt>지원일</dt>  <dd>{item.applicationDate ?? item.createdAt ?? '-'}</dd>
            <dt>심사상태</dt><dd><ScreeningBadge status={item.status} /></dd>
          </dl>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>경력 사항</h3>
            <p className={styles.textBlock}>{item.experience ?? '-'}</p>
          </section>

          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>자격증 목록</h3>
            {certs.length > 0 ? (
              <ul className={styles.certList}>
                {certs.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            ) : (
              <p className={styles.textBlock}>-</p>
            )}
          </section>

          {isPending && !rejectSuccess && (
            <div className={styles.actionRow}>
              <button
                className={styles.approveBtn}
                onClick={() => setModal('confirm-approve')}
                disabled={actionLoading}
              >
                심사 승인
              </button>
              <button
                className={styles.rejectOpenBtn}
                onClick={() => { setModal('reject'); setActionError(null); }}
                disabled={actionLoading}
              >
                심사 거절
              </button>
            </div>
          )}
        </div>
      </aside>

      {modal === 'confirm-approve' && (
        <ConfirmModal
          message="해당 지원자를 승인하시겠습니까?"
          onConfirm={handleApproveConfirm}
          onCancel={() => setModal(null)}
          loading={actionLoading}
        />
      )}
      {modal === 'reject' && (
        <RejectModal
          onConfirm={handleRejectConfirm}
          onCancel={() => { setModal(null); setActionError(null); }}
          loading={actionLoading}
          error={actionError}
        />
      )}
      {modal?.type === 'approve-result' && (
        <ApproveResultModal
          result={modal.data}
          applicantName={applicantName}
          onClose={() => { setModal(null); onClose(); }}
        />
      )}
    </>
  );
}

/* ── 메인 페이지 ── */
export default function ChannelScreeningListPage() {
  const [allItems, setAllItems] = useState([]);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', channelType: '', status: '' });
  const [applied, setApplied] = useState({ startDate: '', endDate: '', channelType: '', status: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNo, setSelectedNo] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchChannelScreenings()
      .then((data) => setAllItems(Array.isArray(data) ? data : (data.items ?? [])))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function handleSearch() {
    setApplied({ ...filters });
    setSelectedNo(null);
  }

  // FE-SALES-06: 서버 필터 미지원 — 클라이언트 필터
  const items = allItems.filter((item) => {
    const date = (item.applicationDate ?? item.createdAt ?? '').slice(0, 10);
    if (applied.startDate && date < applied.startDate) return false;
    if (applied.endDate   && date > applied.endDate)   return false;
    if (applied.channelType && item.channelType !== applied.channelType) return false;
    if (applied.status      && item.status      !== applied.status)      return false;
    return true;
  });

  const selectedItem = allItems.find((i) => i.screeningNo === selectedNo) ?? null;

  return (
    <Layout title="채널 심사">
      <div className={styles.root}>
        <div className={styles.tableArea}>
          <div className={styles.toolbar}>
            <div className={styles.filters}>
              <input
                type="date" className={styles.dateInput}
                value={filters.startDate}
                onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
              />
              <span className={styles.dateSep}>~</span>
              <input
                type="date" className={styles.dateInput}
                value={filters.endDate}
                onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
              />
              <select className={styles.select} value={filters.channelType}
                onChange={(e) => setFilters((f) => ({ ...f, channelType: e.target.value }))}>
                {CHANNEL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <select className={styles.select} value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
                {STATUS_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <button className={styles.searchBtn} onClick={handleSearch}>조회</button>
            </div>
            <span className={styles.totalCount}>{items.length > 0 ? `${items.length}건` : ''}</span>
          </div>

          {error && <div className={styles.errorBox}><strong>오류:</strong> {error}</div>}

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>지원자명</th>
                  <th>채널유형</th>
                  <th>지원일</th>
                  <th>경력</th>
                  <th>자격증</th>
                  <th>심사상태</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={6} className={styles.msgCell}>불러오는 중…</td></tr>}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={6} className={styles.msgCell}>조회 가능한 지원자가 없습니다.</td></tr>
                )}
                {!loading && items.map((item) => (
                  <tr
                    key={item.screeningNo}
                    className={`${styles.row} ${selectedNo === item.screeningNo ? styles.selectedRow : ''}`}
                    onClick={() => setSelectedNo((p) => p === item.screeningNo ? null : item.screeningNo)}
                  >
                    <td>{item.applicantName ?? item.channelName ?? '-'}</td>
                    <td>{channelLabel(item.channelType)}</td>
                    <td>{(item.applicationDate ?? item.createdAt ?? '-').slice(0, 10)}</td>
                    <td className={styles.truncate}>{item.experience ?? '-'}</td>
                    <td className={styles.truncate}>
                      {Array.isArray(item.certifications)
                        ? item.certifications.join(', ')
                        : (item.certifications ?? '-')}
                    </td>
                    <td><ScreeningBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selectedItem && (
          <DetailPanel
            item={selectedItem}
            onClose={() => setSelectedNo(null)}
            onReload={load}
          />
        )}
      </div>
    </Layout>
  );
}
