import { useEffect, useState } from 'react';
import {
  fetchExpiringContracts,
  sendExpiringNotice,
  fetchExpiringNotices,
  recordNoticeResponse,
} from '../../api/expiringContracts';
import Layout from '../../components/layout/Layout';
import styles from './ExpiringContractListPage.module.css';

const TABS = ['만기 안내', '갱신 처리', '처리 이력'];

const RESPONSE_OPTIONS = [
  { value: 'RENEWAL',  label: '갱신 희망' },
  { value: 'CANCEL',   label: '해지 희망' },
  { value: 'PENDING',  label: '추후 결정' },
];

const RESPONSE_LABEL = {
  RENEWAL: '갱신 희망',
  CANCEL:  '해지 희망',
  PENDING: '추후 결정',
};

const RESPONSE_CLS = {
  RENEWAL: styles.badgeGreen,
  CANCEL:  styles.badgeRed,
  PENDING: styles.badgeYellow,
};

function dDayLabel(expiryDate) {
  if (!expiryDate) return '-';
  const diff = Math.ceil(
    (new Date(expiryDate).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000
  );
  if (diff < 0) return `만료 D+${Math.abs(diff)}`;
  if (diff === 0) return 'D-Day';
  return `D-${diff}`;
}

function isExpired(expiryDate) {
  if (!expiryDate) return false;
  return new Date(expiryDate).setHours(0,0,0,0) < new Date().setHours(0,0,0,0);
}

/* ── 확인 팝업 ── */
function ConfirmModal({ message, onConfirm, onCancel, loading }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <p className={styles.modalMsg}>{message}</p>
        <div className={styles.modalBtns}>
          <button className={styles.modalConfirmBtn} onClick={onConfirm} disabled={loading}>
            {loading ? '처리 중…' : '예'}
          </button>
          <button className={styles.modalCancelBtn} onClick={onCancel} disabled={loading}>아니오</button>
        </div>
      </div>
    </div>
  );
}

/* ── 만기 안내 탭 ── */
function NoticeTab({ contract, onReload }) {
  const [memo, setMemo] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [sending, setSending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const [sendError, setSendError] = useState(null);
  const [saveError, setSaveError] = useState(null);

  function handleSendNotice() {
    setSending(true);
    setSendError(null);
    setSendResult(null);
    sendExpiringNotice(contract.contractNo, {})
      .then((res) => {
        setSendResult(res);
        onReload();
      })
      .catch((e) => setSendError(e.message))
      .finally(() => setSending(false));
  }

  function handleSaveMemo() {
    setSaving(true);
    setSaveError(null);
    sendExpiringNotice(contract.contractNo, { memo: memo.trim() || null })
      .then(() => {
        setShowForm(false);
        setMemo('');
        onReload();
      })
      .catch((e) => setSaveError(e.message))
      .finally(() => setSaving(false));
  }

  return (
    <div className={styles.tabContent}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>고객 연락처</h3>
        <dl className={styles.dl}>
          <dt>계약자명</dt><dd>{contract.customerName ?? '-'}</dd>
          <dt>전화번호</dt><dd>{contract.phone ?? '-'}</dd>
          <dt>이메일</dt>  <dd>{contract.email ?? '-'}</dd>
        </dl>
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>안내 내용 미리보기</h3>
        <div className={styles.previewBox}>
          <p>만료일: <strong>{contract.expiryDate ?? '-'}</strong></p>
          <p>갱신 가능 여부: <strong>{isExpired(contract.expiryDate) ? '갱신 불가' : '갱신 가능'}</strong></p>
          <p>갱신 시 예상 보험료: <strong>{contract.renewalPremium != null ? `${Number(contract.renewalPremium).toLocaleString()}원` : '문의 필요'}</strong></p>
        </div>
      </section>

      {sendResult && (
        <div className={styles.successMsg}>안내 문자가 발송되었습니다.</div>
      )}
      {sendError && <div className={styles.errorMsg}>{sendError}</div>}

      <div className={styles.btnGroup}>
        <button className={styles.primaryBtn} onClick={handleSendNotice} disabled={sending}>
          {sending ? '발송 중…' : '안내 문자 발송'}
        </button>
        <button
          className={styles.secondaryBtn}
          onClick={() => { setShowForm((v) => !v); setSaveError(null); }}
        >
          안내 기록
        </button>
      </div>

      {showForm && (
        <div className={styles.memoForm}>
          <label className={styles.label}>메모</label>
          <textarea
            className={styles.textarea}
            rows={3}
            placeholder="안내 내용을 입력하세요"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
          {saveError && <p className={styles.fieldError}>{saveError}</p>}
          <div className={styles.btnGroup}>
            <button className={styles.primaryBtn} onClick={handleSaveMemo} disabled={saving}>
              {saving ? '저장 중…' : '저장'}
            </button>
            <button
              className={styles.secondaryBtn}
              onClick={() => { setShowForm(false); setMemo(''); setSaveError(null); }}
              disabled={saving}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── 갱신 처리 탭 ── */
function RenewalTab({ contract }) {
  const expired = isExpired(contract.expiryDate);
  const [endDate, setEndDate] = useState('');

  return (
    <div className={styles.tabContent}>
      {expired && (
        <div className={styles.expiredBanner}>
          이 계약은 {contract.expiryDate}에 이미 만료되었습니다.
          갱신처리는 만료일 이전에만 가능합니다.
        </div>
      )}

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>현재 계약 정보</h3>
        <dl className={styles.dl}>
          <dt>보험종류</dt>    <dd>{contract.insuranceType ?? '-'}</dd>
          <dt>계약기간</dt>    <dd>{contract.startDate ?? '-'} ~ {contract.expiryDate ?? '-'}</dd>
          <dt>월 보험료</dt>   <dd>{contract.monthlyPremium != null ? `${Number(contract.monthlyPremium).toLocaleString()}원` : '-'}</dd>
        </dl>
      </section>

      {!expired && (
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>갱신 후 계약 정보</h3>
          <div className={styles.formGroup}>
            <label className={styles.label}>갱신 종료일</label>
            <input
              type="date"
              className={styles.dateInput}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <button
            className={styles.primaryBtn}
            onClick={() => alert('갱신 처리 API는 준비 중입니다.')}
          >
            갱신 확정
          </button>
        </section>
      )}
    </div>
  );
}

/* ── 처리 이력 탭 ── */
function HistoryTab({ contractNo }) {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [respondingNo, setRespondingNo] = useState(null);
  const [responseVal, setResponseVal] = useState('');
  const [responseLoading, setResponseLoading] = useState(false);
  const [responseError, setResponseError] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchExpiringNotices(contractNo)
      .then((data) => setNotices(Array.isArray(data) ? data : (data.items ?? [])))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [contractNo]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleResponse(noticeNo) {
    if (!responseVal) return;
    setResponseLoading(true);
    setResponseError(null);
    recordNoticeResponse(noticeNo, { customerResponse: responseVal })
      .then(() => { setRespondingNo(null); setResponseVal(''); load(); })
      .catch((e) => setResponseError(e.message))
      .finally(() => setResponseLoading(false));
  }

  return (
    <div className={styles.tabContent}>
      {loading && <p className={styles.centerMsg}>불러오는 중…</p>}
      {error && <div className={styles.errorMsg}>{error}</div>}
      {!loading && notices.length === 0 && (
        <p className={styles.centerMsg}>처리 이력이 없습니다.</p>
      )}
      {!loading && notices.map((n) => (
        <div key={n.noticeNo} className={styles.historyItem}>
          <div className={styles.historyHeader}>
            <span className={styles.mono}>{n.noticeNo}</span>
            <span className={styles.historyDate}>{n.sentAt ?? n.createdAt ?? '-'}</span>
          </div>
          {n.memo && <p className={styles.historyMemo}>{n.memo}</p>}
          <div className={styles.historyFooter}>
            {n.customerResponse ? (
              <span className={`${styles.badge} ${RESPONSE_CLS[n.customerResponse] ?? styles.badgeGray}`}>
                {RESPONSE_LABEL[n.customerResponse] ?? n.customerResponse}
              </span>
            ) : (
              respondingNo === n.noticeNo ? (
                <div className={styles.responseForm}>
                  <select
                    className={styles.select}
                    value={responseVal}
                    onChange={(e) => setResponseVal(e.target.value)}
                  >
                    <option value="">응답 선택</option>
                    {RESPONSE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  {responseError && <p className={styles.fieldError}>{responseError}</p>}
                  <div className={styles.btnGroup}>
                    <button
                      className={styles.primaryBtnSm}
                      onClick={() => handleResponse(n.noticeNo)}
                      disabled={responseLoading || !responseVal}
                    >
                      {responseLoading ? '저장 중…' : '저장'}
                    </button>
                    <button
                      className={styles.secondaryBtnSm}
                      onClick={() => { setRespondingNo(null); setResponseVal(''); setResponseError(null); }}
                      disabled={responseLoading}
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className={styles.responseBtn}
                  onClick={() => { setRespondingNo(n.noticeNo); setResponseVal(''); }}
                >
                  고객 응답 기록
                </button>
              )
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── 상세 패널 ── */
function DetailPanel({ contract, onClose, onReload }) {
  const [activeTab, setActiveTab] = useState(0);
  const [cancelModal, setCancelModal] = useState(false);
  const expired = isExpired(contract.expiryDate);

  useEffect(() => {
    setActiveTab(0);
    setCancelModal(false);
  }, [contract.contractNo]);

  return (
    <>
      <aside className={styles.panel}>
        <div className={styles.panelHeader}>
          <span className={styles.panelTitle}>만기 계약 관리</span>
          <button className={styles.closeBtn} onClick={onClose}>닫기</button>
        </div>

        {/* 대상 계약 정보 고정 */}
        <div className={styles.contractInfo}>
          <dl className={styles.infoDl}>
            <dt>계약번호</dt> <dd className={styles.mono}>{contract.contractNo}</dd>
            <dt>계약자명</dt> <dd>{contract.customerName ?? '-'}</dd>
            <dt>보험종류</dt> <dd>{contract.insuranceType ?? '-'}</dd>
            <dt>만료일</dt>   <dd>{contract.expiryDate ?? '-'}</dd>
            <dt>잔여일수</dt> <dd className={expired ? styles.expiredText : styles.dDayText}>{dDayLabel(contract.expiryDate)}</dd>
          </dl>
        </div>

        {/* 탭 */}
        <div className={styles.tabBar}>
          {TABS.map((tab, i) => {
            const disabled = i === 1 && expired;
            return (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === i ? styles.tabActive : ''} ${disabled ? styles.tabDisabled : ''}`}
                onClick={() => !disabled && setActiveTab(i)}
                disabled={disabled}
              >
                {tab}
              </button>
            );
          })}
        </div>

        <div className={styles.panelBody}>
          {activeTab === 0 && <NoticeTab contract={contract} onReload={onReload} />}
          {activeTab === 1 && <RenewalTab contract={contract} />}
          {activeTab === 2 && <HistoryTab contractNo={contract.contractNo} />}
        </div>

        <div className={styles.panelFooter}>
          <button className={styles.cancelContractBtn} onClick={() => setCancelModal(true)}>
            해지 처리로 전환
          </button>
        </div>
      </aside>

      {cancelModal && (
        <ConfirmModal
          message="해지 처리로 전환하시겠습니까?"
          onConfirm={() => { setCancelModal(false); alert('해지 처리 페이지는 준비 중입니다.'); }}
          onCancel={() => setCancelModal(false)}
        />
      )}
    </>
  );
}

/* ── 메인 페이지 ── */
export default function ExpiringContractListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNo, setSelectedNo] = useState(null);

  function load() {
    setLoading(true);
    setError(null);
    fetchExpiringContracts()
      .then((data) => setItems(Array.isArray(data) ? data : (data.items ?? [])))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const selectedItem = items.find((i) => i.contractNo === selectedNo) ?? null;

  return (
    <Layout title="만기 계약 관리">
      <div className={styles.root}>
        <div className={styles.tableArea}>
          <div className={styles.toolbar}>
            <span className={styles.toolbarNote}>만기 임박 계약 목록 (30일 이내)</span>
            <span className={styles.totalCount}>{items.length > 0 ? `${items.length}건` : ''}</span>
          </div>

          {error && <div className={styles.errorBox}><strong>오류:</strong> {error}</div>}

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>계약번호</th>
                  <th>계약자명</th>
                  <th>보험종류</th>
                  <th>만료일</th>
                  <th>잔여일수</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={5} className={styles.msgCell}>불러오는 중…</td></tr>
                )}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={5} className={styles.msgCell}>만기 임박 계약이 없습니다.</td></tr>
                )}
                {!loading && items.map((item) => {
                  const expired = isExpired(item.expiryDate);
                  return (
                    <tr
                      key={item.contractNo}
                      className={`${styles.row} ${selectedNo === item.contractNo ? styles.selectedRow : ''}`}
                      onClick={() => setSelectedNo((p) => p === item.contractNo ? null : item.contractNo)}
                    >
                      <td className={styles.mono}>{item.contractNo}</td>
                      <td>{item.customerName ?? '-'}</td>
                      <td>{item.insuranceType ?? '-'}</td>
                      <td>{item.expiryDate ?? '-'}</td>
                      <td className={expired ? styles.expiredText : styles.dDayText}>
                        {dDayLabel(item.expiryDate)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {selectedItem && (
          <DetailPanel
            contract={selectedItem}
            onClose={() => setSelectedNo(null)}
            onReload={load}
          />
        )}
      </div>
    </Layout>
  );
}