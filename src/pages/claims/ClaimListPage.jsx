import { useEffect, useRef, useState } from 'react';
import { fetchClaims, fetchClaim, submitClaimRequest } from '../../api/claims';
import Layout from '../../components/layout/Layout';
import styles from './ClaimListPage.module.css';

/* ── 상수 ── */
const STEPS = [
  { id: 'terms',     label: '약관 동의' },
  { id: 'recipient', label: '수령인 정보' },
  { id: 'claim',     label: '청구 내용' },
  { id: 'account',   label: '계좌 정보' },
  { id: 'docs',      label: '서류 첨부' },
  { id: 'confirm',   label: '최종 확인' },
];

const CLAIM_STATUS = {
  REGISTERED:    { label: '접수',    cls: styles.badgePending },
  INVESTIGATING: { label: '조사중',  cls: styles.badgePending },
  CALCULATING:   { label: '산출중',  cls: styles.badgePending },
  APPROVED:      { label: '승인',    cls: styles.badgeApproved },
  PAID:          { label: '지급완료', cls: styles.badgeApproved },
  REJECTED:      { label: '거절',    cls: styles.badgeRejected },
};

const CLAIM_REASONS = [
  { value: 'HOSPITALIZATION',        label: '입원' },
  { value: 'SURGERY',                label: '수술' },
  { value: 'OUTPATIENT',             label: '통원' },
  { value: 'ACTUAL_HOSPITALIZATION', label: '실손 입원' },
  { value: 'ACTUAL_OUTPATIENT',      label: '실손 통원' },
  { value: 'OTHER',                  label: '기타' },
];

const BANKS = ['KB국민', '신한', '우리', '하나', 'IBK기업', 'NH농협', '카카오뱅크', '케이뱅크', '토스뱅크'];

const NOTIFICATION_METHODS = [
  { value: 'KAKAO',     label: '안내톡/문자메시지' },
  { value: 'EMAIL',     label: '이메일' },
  { value: 'MAIL_HOME', label: '우편물(집)' },
  { value: 'MAIL_WORK', label: '우편물(직장)' },
  { value: 'NONE',      label: '신청안함' },
];

const INSURED_OPTIONS = [
  { value: 'self',   label: '본인' },
  { value: 'spouse', label: '배우자' },
  { value: 'child',  label: '자녀' },
  { value: 'other',  label: '기타' },
];

/* ── 청구 상태 배지 ── */
function ClaimBadge({ status }) {
  const cfg = CLAIM_STATUS[status] ?? { label: status, cls: styles.badgePending };
  return <span className={`${styles.badge} ${cfg.cls}`}>{cfg.label}</span>;
}

/* ── 청구 상세 슬라이드 패널 ── */
function DetailPanel({ claimNo, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!claimNo) return;
    setLoading(true);
    setError(null);
    fetchClaim(claimNo)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [claimNo]);

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <aside className={styles.slidePanel}>
        <div className={styles.panelInner}>
          <div className={styles.panelHeader}>
            <div>
              <span className={styles.panelLabel}>Claim Detail</span>
              <h2 className={styles.panelName}>{claimNo}</h2>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>✕</button>
          </div>

          {loading && <p className={styles.msg}>불러오는 중…</p>}
          {error && <p className={`${styles.msg} ${styles.msgError}`}>{error}</p>}
          {data && (
            <div className={styles.panelBody}>
              <div className={styles.infoGrid2}>
                <div className={styles.infoCard}>
                  <p className={styles.infoLabel}>청구유형</p>
                  <p className={styles.infoValue}>{data.claimType ?? '-'}</p>
                </div>
                <div className={styles.infoCard}>
                  <p className={styles.infoLabel}>상태</p>
                  <ClaimBadge status={data.status} />
                </div>
                <div className={styles.infoCard}>
                  <p className={styles.infoLabel}>청구금액</p>
                  <p className={styles.infoValuePrimary}>{data.claimAmount != null ? `${data.claimAmount.toLocaleString()}원` : '-'}</p>
                </div>
                <div className={styles.infoCard}>
                  <p className={styles.infoLabel}>등록일</p>
                  <p className={styles.infoValue}>{data.createdAt ?? '-'}</p>
                </div>
              </div>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>📋 계약 정보</h3>
                <dl className={styles.dl}>
                  <dt>계약번호</dt><dd className={styles.mono}>{data.contractNo ?? '-'}</dd>
                  <dt>은행</dt><dd>{data.bankName ?? '-'}</dd>
                  <dt>계좌번호</dt><dd>{data.accountNo ?? '-'}</dd>
                </dl>
              </section>

              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>🔄 진행 단계</h3>
                <p className={styles.stepNote}>조사·산출·지급 단계 정보는 Phase 2에서 연결됩니다.</p>
              </section>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

/* ══════════════════════════════════
   WIZARD STEPS
══════════════════════════════════ */

/* Step 1: 약관 동의 */
function TermsStep({ agreed, setAgreed }) {
  function toggleAll(e) {
    setAgreed({ required: e.target.checked, optional: e.target.checked });
  }
  return (
    <div className={styles.stepContent}>
      <p className={styles.stepDesc}>보험금 청구를 위해 아래 약관에 동의해 주세요.</p>
      <div className={styles.termsBox}>
        <p className={styles.termsTitle}>개인정보 수집 및 이용 동의 (필수)</p>
        <p className={styles.termsText}>
          귀하의 개인정보는 보험금 청구 심사 및 지급을 위해 수집·이용됩니다.
          수집 항목: 성명, 주민등록번호, 연락처, 계좌정보, 진단명, 첨부서류.
          보유 기간: 보험금 지급 완료 후 5년.
        </p>
      </div>
      <label className={styles.checkLabel}>
        <input type="checkbox" className={styles.check} checked={agreed.required}
          onChange={(e) => setAgreed((p) => ({ ...p, required: e.target.checked }))} />
        <span>필수 약관에 동의합니다 <span className={styles.reqStar}>*</span></span>
      </label>

      <div className={styles.termsBox}>
        <p className={styles.termsTitle}>마케팅 정보 수신 동의 (선택)</p>
        <p className={styles.termsText}>신상품 안내, 이벤트 정보 등 마케팅 목적의 정보를 수신합니다.</p>
      </div>
      <label className={styles.checkLabel}>
        <input type="checkbox" className={styles.check} checked={agreed.optional}
          onChange={(e) => setAgreed((p) => ({ ...p, optional: e.target.checked }))} />
        <span>마케팅 정보 수신에 동의합니다 (선택)</span>
      </label>

      <label className={`${styles.checkLabel} ${styles.checkAll}`}>
        <input type="checkbox" className={styles.check}
          checked={agreed.required && agreed.optional}
          onChange={toggleAll} />
        <span className={styles.checkAllText}>전체 동의</span>
      </label>
    </div>
  );
}

/* Step 2: 수령인 정보 (RecipientInfo) */
function RecipientStep({ data, onChange }) {
  return (
    <div className={styles.stepContent}>
      <p className={styles.stepDesc}>보험금을 수령할 분의 정보를 입력하세요.</p>
      <div className={styles.formGrid}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>수령인 이름 <span className={styles.reqStar}>*</span></label>
          <input className={styles.input} type="text" placeholder="홍길동"
            value={data.name} onChange={(e) => onChange('name', e.target.value)} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>주민등록번호 <span className={styles.reqStar}>*</span></label>
          <input className={styles.input} type="text" placeholder="000000-0000000"
            value={data.ssn} onChange={(e) => onChange('ssn', e.target.value)} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>휴대전화번호 <span className={styles.reqStar}>*</span></label>
          <input className={styles.input} type="text" placeholder="010-0000-0000"
            value={data.phone} onChange={(e) => onChange('phone', e.target.value)} />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>피보험자</label>
          <select className={styles.select} value={data.insuredPerson}
            onChange={(e) => onChange('insuredPerson', e.target.value)}>
            {INSURED_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}

/* Step 3: 청구 내용 (ClaimRequest + AccidentDetail) */
function ClaimStep({ claimData, accidentData, onChangeClaim, onChangeAccident }) {
  const isAccident = claimData.claimType === 'ACCIDENT';

  function toggleReason(value) {
    onChangeClaim('claimReasons',
      claimData.claimReasons.includes(value)
        ? claimData.claimReasons.filter((r) => r !== value)
        : [...claimData.claimReasons, value]
    );
  }

  return (
    <div className={styles.stepContent}>
      <p className={styles.stepDesc}>청구 유형과 사유를 선택하고 진단명을 입력하세요.</p>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>청구 유형 <span className={styles.reqStar}>*</span></label>
        <div className={styles.toggleGroup}>
          {[{ value: 'DISEASE', label: '🏥 질병' }, { value: 'ACCIDENT', label: '⚠️ 재해' }].map((t) => (
            <button key={t.value} type="button"
              className={`${styles.toggleBtn} ${claimData.claimType === t.value ? styles.toggleBtnActive : ''}`}
              onClick={() => onChangeClaim('claimType', t.value)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>청구 사유 <span className={styles.reqStar}>*</span></label>
        <div className={styles.checkGrid}>
          {CLAIM_REASONS.map((r) => (
            <label key={r.value} className={styles.checkLabel}>
              <input type="checkbox" className={styles.check}
                checked={claimData.claimReasons.includes(r.value)}
                onChange={() => toggleReason(r.value)} />
              <span>{r.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>병명/진단명 <span className={styles.reqStar}>*</span></label>
        <input className={styles.input} type="text" placeholder="예: 급성 충수염"
          value={claimData.diagnosis} onChange={(e) => onChangeClaim('diagnosis', e.target.value)} />
      </div>

      {isAccident && (
        <div className={styles.accidentBox}>
          <p className={styles.accidentBoxTitle}>⚠️ 재해 상세 정보 (AccidentDetail)</p>
          <div className={styles.formGrid}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>사고 유형</label>
              <select className={styles.select} value={accidentData.accidentType}
                onChange={(e) => onChangeAccident('accidentType', e.target.value)}>
                <option value="GENERAL">일반재해</option>
                <option value="TRAFFIC">교통재해</option>
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>사고 날짜</label>
              <input className={styles.input} type="date" value={accidentData.date}
                onChange={(e) => onChangeAccident('date', e.target.value)} />
            </div>
            <div className={`${styles.fieldGroup} ${styles.colSpan2}`}>
              <label className={styles.fieldLabel}>사고 장소</label>
              <input className={styles.input} type="text" placeholder="사고가 발생한 장소를 입력하세요"
                value={accidentData.place} onChange={(e) => onChangeAccident('place', e.target.value)} />
            </div>
            <div className={`${styles.fieldGroup} ${styles.colSpan2}`}>
              <label className={styles.fieldLabel}>사고 내용</label>
              <textarea className={styles.textarea} rows={3} placeholder="사고 경위를 상세히 입력하세요"
                value={accidentData.content} onChange={(e) => onChangeAccident('content', e.target.value)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Step 4: 계좌 정보 (BankAccount) */
function AccountStep({ data, onChange, verified, setVerified }) {
  return (
    <div className={styles.stepContent}>
      <p className={styles.stepDesc}>보험금을 지급받을 계좌 정보를 입력하세요.</p>
      <div className={styles.formGrid}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>은행/증권 <span className={styles.reqStar}>*</span></label>
          <select className={styles.select} value={data.bank}
            onChange={(e) => { onChange('bank', e.target.value); setVerified(false); }}>
            <option value="">선택하세요</option>
            {BANKS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>계좌번호 <span className={styles.reqStar}>*</span></label>
          <input className={styles.input} type="text" placeholder="- 없이 입력"
            value={data.accountNo}
            onChange={(e) => { onChange('accountNo', e.target.value); setVerified(false); }} />
        </div>
      </div>
      <button className={styles.verifyBtn} type="button"
        disabled={!data.bank || !data.accountNo}
        onClick={() => setVerified(true)}>
        계좌 인증
      </button>
      {verified && (
        <div className={styles.verifySuccess}>✓ 계좌 인증이 완료되었습니다.</div>
      )}
    </div>
  );
}

/* Step 5: 서류 첨부 */
function DocsStep({ claimReasons, files, setFiles }) {
  const inputRef = useRef(null);

  const requiredDocs = {
    HOSPITALIZATION:        '진단서 또는 입퇴원확인서',
    SURGERY:                '진단서, 수술확인서, 입퇴원확인서 중 1부',
    OUTPATIENT:             '진단서, 통원확인서, 소견서 중 1부',
    ACTUAL_HOSPITALIZATION: '진료영수증 및 진료비 세부내역서',
    ACTUAL_OUTPATIENT:      '진료영수증 및 진료비 세부내역서',
    OTHER:                  '관련 의무기록 서류',
  };

  function handleFiles(e) {
    const added = Array.from(e.target.files).map((f) => f.name);
    setFiles((p) => [...p, ...added]);
  }

  return (
    <div className={styles.stepContent}>
      <p className={styles.stepDesc}>필요 서류를 첨부하세요.</p>

      {claimReasons.length > 0 && (
        <div className={styles.docsGuide}>
          <p className={styles.docsGuideTitle}>📋 필요 서류 안내</p>
          <ul className={styles.docsList}>
            {claimReasons.map((r) => {
              const reason = CLAIM_REASONS.find((cr) => cr.value === r);
              return (
                <li key={r}><strong>{reason?.label}</strong>: {requiredDocs[r] ?? '-'}</li>
              );
            })}
          </ul>
        </div>
      )}

      <div className={styles.uploadArea} onClick={() => inputRef.current?.click()}>
        <span className={styles.uploadIcon}>📎</span>
        <p className={styles.uploadText}>파일을 드래그하거나 클릭하여 업로드</p>
        <p className={styles.uploadSub}>JPG, PNG, PDF 지원 (최대 10MB)</p>
        <input ref={inputRef} type="file" multiple accept=".jpg,.jpeg,.png,.pdf"
          className={styles.fileInput} onChange={handleFiles} />
      </div>

      {files.length > 0 && (
        <div className={styles.fileList}>
          {files.map((f, i) => (
            <div key={i} className={styles.fileItem}>
              <span>📄 {f}</span>
              <button className={styles.removeFile} type="button"
                onClick={() => setFiles((p) => p.filter((_, j) => j !== i))}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* Step 6: 최종 확인 */
function ConfirmStep({ recipient, claim, accident, account, notification, setNotification }) {
  const reasonLabels = claim.claimReasons
    .map((r) => CLAIM_REASONS.find((cr) => cr.value === r)?.label)
    .filter(Boolean).join(', ');

  return (
    <div className={styles.stepContent}>
      <p className={styles.stepDesc}>입력한 내용을 최종 확인하고 신청하세요.</p>

      <div className={styles.confirmSection}>
        <h4 className={styles.confirmSectionTitle}>수령인 정보</h4>
        <dl className={styles.confirmDl}>
          <dt>이름</dt><dd>{recipient.name || '-'}</dd>
          <dt>피보험자</dt><dd>{INSURED_OPTIONS.find((o) => o.value === recipient.insuredPerson)?.label}</dd>
          <dt>연락처</dt><dd>{recipient.phone || '-'}</dd>
        </dl>
      </div>

      <div className={styles.confirmSection}>
        <h4 className={styles.confirmSectionTitle}>청구 내용</h4>
        <dl className={styles.confirmDl}>
          <dt>청구 유형</dt><dd>{claim.claimType === 'DISEASE' ? '질병' : '재해'}</dd>
          <dt>청구 사유</dt><dd>{reasonLabels || '-'}</dd>
          <dt>진단명</dt><dd>{claim.diagnosis || '-'}</dd>
          {claim.claimType === 'ACCIDENT' && (
            <>
              <dt>사고 유형</dt><dd>{accident.accidentType === 'GENERAL' ? '일반재해' : '교통재해'}</dd>
              <dt>사고 날짜</dt><dd>{accident.date || '-'}</dd>
              <dt>사고 장소</dt><dd>{accident.place || '-'}</dd>
            </>
          )}
        </dl>
      </div>

      <div className={styles.confirmSection}>
        <h4 className={styles.confirmSectionTitle}>지급 계좌</h4>
        <dl className={styles.confirmDl}>
          <dt>은행</dt><dd>{account.bank || '-'}</dd>
          <dt>계좌번호</dt><dd>{account.accountNo || '-'}</dd>
        </dl>
      </div>

      <div className={styles.confirmSection}>
        <h4 className={styles.confirmSectionTitle}>지급내역 안내 방법</h4>
        <div className={styles.notifList}>
          {NOTIFICATION_METHODS.map((m) => (
            <label key={m.value} className={`${styles.notifOption} ${notification === m.value ? styles.notifOptionActive : ''}`}>
              <input type="radio" name="notification" className={styles.hiddenRadio}
                value={m.value} checked={notification === m.value}
                onChange={() => setNotification(m.value)} />
              {m.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════
   WIZARD 메인
══════════════════════════════════ */
function ClaimWizard({ onClose, onSuccess }) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Step 1
  const [agreed, setAgreed] = useState({ required: false, optional: false });
  // Step 2 - RecipientInfo
  const [recipient, setRecipient] = useState({ name: '', ssn: '', phone: '', insuredPerson: 'self' });
  // Step 3 - ClaimRequest + AccidentDetail
  const [claimData, setClaimData] = useState({ claimType: 'DISEASE', claimReasons: [], diagnosis: '' });
  const [accidentData, setAccidentData] = useState({ accidentType: 'GENERAL', content: '', date: '', place: '' });
  // Step 4 - BankAccount
  const [account, setAccount] = useState({ bank: '', accountNo: '' });
  const [accountVerified, setAccountVerified] = useState(false);
  // Step 5
  const [files, setFiles] = useState([]);
  // Step 6
  const [notification, setNotification] = useState('KAKAO');

  function changeRecipient(field, value) { setRecipient((p) => ({ ...p, [field]: value })); }
  function changeClaim(field, value) { setClaimData((p) => ({ ...p, [field]: value })); }
  function changeAccident(field, value) { setAccidentData((p) => ({ ...p, [field]: value })); }
  function changeAccount(field, value) { setAccount((p) => ({ ...p, [field]: value })); }

  function canNext() {
    if (step === 0) return agreed.required;
    if (step === 1) return recipient.name && recipient.phone;
    if (step === 2) return claimData.claimReasons.length > 0 && claimData.diagnosis;
    if (step === 3) return account.bank && account.accountNo;
    if (step === 4) return files.length > 0;
    return true;
  }

  async function handleNext() {
    if (step < STEPS.length - 1) { setStep((s) => s + 1); return; }
    setSubmitting(true);
    setError(null);
    try {
      await submitClaimRequest({
        recipientInfo: recipient,
        claimRequest: claimData,
        accidentDetail: claimData.claimType === 'ACCIDENT' ? accidentData : null,
        bankAccount: account,
        notificationMethod: notification,
      });
      onSuccess();
    } catch (e) {
      setError(e.message ?? '신청 처리에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setSubmitting(false);
    }
  }

  const stepComponents = [
    <TermsStep agreed={agreed} setAgreed={setAgreed} />,
    <RecipientStep data={recipient} onChange={changeRecipient} />,
    <ClaimStep claimData={claimData} accidentData={accidentData} onChangeClaim={changeClaim} onChangeAccident={changeAccident} />,
    <AccountStep data={account} onChange={changeAccount} verified={accountVerified} setVerified={setAccountVerified} />,
    <DocsStep claimReasons={claimData.claimReasons} files={files} setFiles={setFiles} />,
    <ConfirmStep recipient={recipient} claim={claimData} accident={accidentData} account={account} notification={notification} setNotification={setNotification} />,
  ];

  return (
    <>
      <div className={styles.wizardOverlay} onClick={onClose} />
      <div className={styles.wizard}>
        {/* Header */}
        <div className={styles.wizardHeader}>
          <div>
            <span className={styles.wizardLabel}>보험금 청구</span>
            <h2 className={styles.wizardTitle}>{STEPS[step].label}</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Stepper */}
        <div className={styles.stepper}>
          {STEPS.map((s, i) => (
            <div key={s.id} className={styles.stepItem}>
              <div className={`${styles.stepDot} ${i < step ? styles.stepDone : i === step ? styles.stepActive : styles.stepFuture}`}>
                {i < step ? '✓' : i + 1}
              </div>
              <span className={`${styles.stepLabel} ${i === step ? styles.stepLabelActive : ''}`}>{s.label}</span>
              {i < STEPS.length - 1 && <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ''}`} />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className={styles.wizardBody}>
          {stepComponents[step]}
          {error && <p className={styles.wizardError}>{error}</p>}
        </div>

        {/* Navigation */}
        <div className={styles.wizardFooter}>
          <button className={styles.btnOutline} onClick={step === 0 ? onClose : () => setStep((s) => s - 1)}>
            {step === 0 ? '취소' : '이전'}
          </button>
          <button className={styles.btnPrimary} onClick={handleNext}
            disabled={!canNext() || submitting}>
            {submitting ? '처리 중…' : step === STEPS.length - 1 ? '신청하기' : '다음'}
          </button>
        </div>
      </div>
    </>
  );
}

/* ══════════════════════════════════
   메인 페이지
══════════════════════════════════ */
export default function ClaimListPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNo, setSelectedNo] = useState(null);
  const [showWizard, setShowWizard] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchClaims()
      .then((data) => setItems(Array.isArray(data) ? data : (data.items ?? data.content ?? [])))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function handleSuccess() {
    setShowWizard(false);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 4000);
    setLoading(true);
    fetchClaims()
      .then((data) => setItems(Array.isArray(data) ? data : (data.items ?? data.content ?? [])))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  return (
    <Layout title="청구 목록">
      <div className={styles.page}>
        {/* Hero */}
        <div className={styles.hero}>
          <div>
            <h1 className={styles.title}>청구 목록</h1>
            <p className={styles.subtitle}>접수된 보험금 청구 현황을 조회하고 새 청구를 신청합니다.</p>
          </div>
          <button className={styles.btnPrimaryHero} onClick={() => setShowWizard(true)}>
            💊 보험금 청구하기
          </button>
        </div>

        {successMsg && (
          <div className={styles.toast}>
            <span className={styles.toastIcon}>✓</span>
            <p>보험금 청구 신청이 완료되었습니다.</p>
          </div>
        )}

        {/* Table */}
        <div className={styles.tablePanel}>
          {error && <div className={styles.errorBox}>{error}</div>}
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>청구번호</th>
                  <th>계약번호</th>
                  <th>청구유형</th>
                  <th className={styles.thCenter}>상태</th>
                  <th className={styles.thRight}>청구금액</th>
                  <th>등록일</th>
                </tr>
              </thead>
              <tbody>
                {loading && <tr><td colSpan={6} className={styles.msg}>불러오는 중…</td></tr>}
                {!loading && items.length === 0 && (
                  <tr><td colSpan={6} className={styles.msg}>조회된 청구가 없습니다.</td></tr>
                )}
                {!loading && items.map((item) => (
                  <tr key={item.claimNo}
                    className={`${styles.tableRow} ${selectedNo === item.claimNo ? styles.tableRowActive : ''}`}
                    onClick={() => setSelectedNo((p) => p === item.claimNo ? null : item.claimNo)}>
                    <td className={styles.monoCell}>{item.claimNo}</td>
                    <td className={styles.monoCell}>{item.contractNo ?? '-'}</td>
                    <td className={styles.cell}>{item.claimType ?? '-'}</td>
                    <td className={styles.statusCell}><ClaimBadge status={item.status} /></td>
                    <td className={styles.amountCell}>
                      {item.claimAmount != null ? `${item.claimAmount.toLocaleString()}원` : '-'}
                    </td>
                    <td className={styles.cell}>{item.createdAt ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={styles.tableFooter}>
            <span className={styles.totalCount}>총 {items.length}건</span>
          </div>
        </div>

        {selectedNo && (
          <DetailPanel claimNo={selectedNo} onClose={() => setSelectedNo(null)} />
        )}

        {showWizard && (
          <ClaimWizard onClose={() => setShowWizard(false)} onSuccess={handleSuccess} />
        )}
      </div>
    </Layout>
  );
}
