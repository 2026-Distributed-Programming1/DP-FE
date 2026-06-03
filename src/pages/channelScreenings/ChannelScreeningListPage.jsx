import { useEffect, useState } from 'react';
import {
  fetchChannelScreenings,
  approveChannelScreening,
  rejectChannelScreening,
} from '../../api/channelScreenings';
import Layout from '../../components/layout/Layout';
import styles from './ChannelScreeningListPage.module.css';

const CHANNEL_TYPES = [
  { value: '', label: '전체' },
  { value: 'AGENT', label: 'Agent (전속)' },
  { value: 'AGENCY', label: 'Agency (대리점)' },
];

const STATUS_OPTIONS = [
  { value: '', label: '전체' },
  { value: 'PENDING', label: 'Pending (대기)' },
  { value: 'APPROVED', label: 'Approved (승인)' },
  { value: 'REJECTED', label: 'Rejected (거절)' },
];

const STATUS_MAP = {
  PENDING:  { label: 'Pending',  cls: styles.badgePending },
  APPROVED: { label: 'Approved', cls: styles.badgeApproved },
  REJECTED: { label: 'Rejected', cls: styles.badgeRejected },
};

const AVATAR_CLS = {
  PENDING:  styles.avatarPending,
  APPROVED: styles.avatarApproved,
  REJECTED: styles.avatarRejected,
};

function StatusBadge({ status }) {
  const cfg = STATUS_MAP[status] ?? { label: status, cls: styles.badgePending };
  return <span className={`${styles.badge} ${cfg.cls}`}>{cfg.label}</span>;
}

function channelLabel(type) {
  return CHANNEL_TYPES.find((t) => t.value === type)?.label ?? type ?? '-';
}

/* ── 확인 모달 ── */
function ConfirmModal({ message, onConfirm, onCancel, loading }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <p className={styles.modalMsg}>{message}</p>
        <div className={styles.modalBtns}>
          <button className={styles.modalConfirmBtn} onClick={onConfirm} disabled={loading}>
            {loading ? '처리 중…' : '확인'}
          </button>
          <button className={styles.modalCancelBtn} onClick={onCancel} disabled={loading}>취소</button>
        </div>
      </div>
    </div>
  );
}

/* ── 거절 모달 ── */
function RejectModal({ onConfirm, onCancel, loading, error }) {
  const [reason, setReason] = useState('');
  return (
    <div className={styles.modalOverlay}>
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
          <button className={styles.modalRejectBtn} onClick={() => onConfirm(reason)} disabled={loading}>
            {loading ? '처리 중…' : '확인'}
          </button>
          <button className={styles.modalCancelBtn} onClick={onCancel} disabled={loading}>취소</button>
        </div>
      </div>
    </div>
  );
}

/* ── 승인 결과 모달 ── */
function ApproveResultModal({ result, applicantName, onClose }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3 className={styles.modalTitle}>승인 완료</h3>
        <dl className={styles.resultDl}>
          <dt>승인번호</dt>
          <dd>{result?.screeningNo ?? result?.approvalNo ?? '-'}</dd>
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

/* ── 슬라이드 오버 상세 패널 ── */
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
    approveChannelScreening(item.screeningNo)
      .then((result) => { onReload(); setModal({ type: 'approve-result', data: result }); })
      .catch((e) => { setActionError(e.message); setModal(null); })
      .finally(() => setActionLoading(false));
  }

  function handleRejectConfirm(reason) {
    if (!reason.trim()) { setActionError('거절 사유를 입력해주세요.'); return; }
    setActionLoading(true);
    rejectChannelScreening(item.screeningNo, reason.trim())
      .then(() => { onReload(); setModal(null); setRejectSuccess(true); })
      .catch((e) => setActionError(e.message))
      .finally(() => setActionLoading(false));
  }

  const isPending = item.status === 'PENDING';
  const applicantName = item.applicantName ?? item.channelName ?? '-';
  const certs = Array.isArray(item.certifications)
    ? item.certifications
    : item.certifications ? [item.certifications] : [];

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <aside className={styles.slidePanel}>
        <div className={styles.panelInner}>
          {/* Panel Header */}
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.panelLabel}>Applicant Review</span>
              <h2 className={styles.panelName}>{applicantName}</h2>
              <p className={styles.panelDesc}>심사 대기중인 지원자 상세 정보입니다.</p>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>

          {/* Sticky Action Bar */}
          {isPending && !rejectSuccess && (
            <div className={styles.actionBar}>
              {actionError && <p className={styles.actionError}>{actionError}</p>}
              <button
                className={styles.btnApprove}
                onClick={() => setModal('confirm-approve')}
                disabled={actionLoading}
              >
                심사 승인
              </button>
              <button
                className={styles.btnReject}
                onClick={() => { setModal('reject'); setActionError(null); }}
                disabled={actionLoading}
              >
                심사 거절
              </button>
            </div>
          )}

          {rejectSuccess && (
            <div className={styles.rejectSuccessMsg}>해당 지원자가 거절 처리되었습니다.</div>
          )}

          {/* Basic Info */}
          <div className={styles.infoGrid}>
            <div className={styles.infoCard}>
              <p className={styles.infoLabel}>채널 유형</p>
              <p className={styles.infoValue}>{channelLabel(item.channelType)}</p>
            </div>
            <div className={styles.infoCard}>
              <p className={styles.infoLabel}>신청 일자</p>
              <p className={styles.infoValue}>{(item.applicationDate ?? item.createdAt ?? '-').slice(0, 10)}</p>
            </div>
          </div>

          {/* Experience */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>📋 상세 경력 사항</h3>
            <div className={styles.expBlock}>
              <p className={styles.expText}>{item.experience ?? '-'}</p>
            </div>
          </section>

          {/* Certifications */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>🏅 보유 전문 자격증</h3>
            {certs.length > 0 ? (
              <div className={styles.certList}>
                {certs.map((c, i) => (
                  <div key={i} className={styles.certCard}>
                    <span className={styles.certIcon}>✓</span>
                    <span className={styles.certName}>{c}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.emptyText}>-</p>
            )}
          </section>

          {/* Documents */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>📎 첨부 서류 확인</h3>
            <div className={styles.docList}>
              <div className={styles.docItem}>
                <span>📄 경력증명서_{applicantName}.pdf</span>
                <span className={styles.docDownload}>⬇</span>
              </div>
              <div className={styles.docItem}>
                <span>📁 자격증_증빙파일.zip</span>
                <span className={styles.docDownload}>⬇</span>
              </div>
            </div>
          </section>
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

  const items = allItems.filter((item) => {
    const date = (item.applicationDate ?? item.createdAt ?? '').slice(0, 10);
    if (applied.startDate && date < applied.startDate) return false;
    if (applied.endDate && date > applied.endDate) return false;
    if (applied.channelType && item.channelType !== applied.channelType) return false;
    if (applied.status && item.status !== applied.status) return false;
    return true;
  });

  const selectedItem = allItems.find((i) => i.screeningNo === selectedNo) ?? null;

  return (
    <Layout title="채널 심사">
      <div className={styles.page}>
        {/* Hero */}
        <div className={styles.hero}>
          <div>
            <h1 className={styles.title}>판매채널 채용 심사</h1>
            <p className={styles.subtitle}>새로운 판매 채널 파트너의 역량을 심사하고 승인 프로세스를 관리합니다.</p>
          </div>
        </div>

        {/* Filters */}
        <div className={styles.filterPanel}>
          <div className={styles.filterGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>모집 기간 (시작 ~ 종료)</label>
              <div className={styles.dateRange}>
                <input
                  className={styles.inputRound}
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))}
                />
                <span className={styles.dateSep}>~</span>
                <input
                  className={styles.inputRound}
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))}
                />
              </div>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>채널 유형</label>
              <select
                className={styles.selectRound}
                value={filters.channelType}
                onChange={(e) => setFilters((f) => ({ ...f, channelType: e.target.value }))}
              >
                {CHANNEL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>심사 상태</label>
              <select
                className={styles.selectRound}
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              >
                {STATUS_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className={styles.searchBtnWrap}>
              <button className={styles.searchBtn} onClick={handleSearch}>🔍 조회하기</button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className={styles.tablePanel}>
          {error && <div className={styles.errorBox}>{error}</div>}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>지원자명</th>
                  <th>채널 유형</th>
                  <th>신청 일자</th>
                  <th>경력사항</th>
                  <th>보유 자격증</th>
                  <th className={styles.thCenter}>심사 상태</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={6} className={styles.msg}>불러오는 중…</td></tr>}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={6} className={styles.msg}>조회 가능한 지원자가 없습니다.</td></tr>
                )}
                {!loading && items.map((item) => {
                  const name = item.applicantName ?? item.channelName ?? '-';
                  const certs = Array.isArray(item.certifications)
                    ? item.certifications
                    : item.certifications ? [item.certifications] : [];
                  return (
                    <tr
                      key={item.screeningNo}
                      className={`${styles.tableRow} ${selectedNo === item.screeningNo ? styles.tableRowActive : ''}`}
                      onClick={() => setSelectedNo((p) => p === item.screeningNo ? null : item.screeningNo)}
                    >
                      <td>
                        <div className={styles.nameCell}>
                          <div className={`${styles.avatar} ${AVATAR_CLS[item.status] ?? styles.avatarPending}`}>
                            {name[0]}
                          </div>
                          <span className={styles.nameText}>{name}</span>
                        </div>
                      </td>
                      <td className={styles.cell}>{channelLabel(item.channelType)}</td>
                      <td className={styles.cell}>{(item.applicationDate ?? item.createdAt ?? '-').slice(0, 10)}</td>
                      <td className={styles.cell}>{item.experience ?? '-'}</td>
                      <td className={styles.cell}>
                        <div className={styles.certTags}>
                          {certs.length > 0
                            ? certs.map((c, i) => <span key={i} className={styles.certTag}>{c}</span>)
                            : <span className={styles.noCert}>해당없음</span>}
                        </div>
                      </td>
                      <td className={styles.statusCell}>
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className={styles.pagination}>
            <p className={styles.paginationInfo}>총 {items.length}건</p>
            <div className={styles.paginationBtns}>
              <button className={styles.pageBtn}>‹</button>
              <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
              <button className={styles.pageBtn}>2</button>
              <button className={styles.pageBtn}>3</button>
              <button className={styles.pageBtn}>›</button>
            </div>
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
