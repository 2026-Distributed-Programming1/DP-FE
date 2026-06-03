import { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { createConsultation } from '../../api/consultations';
import styles from './ConsultationPage.module.css';

const CONSULTATION_TYPES = [
  { value: '', label: '상담 항목을 선택하세요' },
  { value: 'LIFE', label: '종신/생명 보험' },
  { value: 'HEALTH', label: '건강/의료 보험' },
  { value: 'AUTO', label: '자동차/화재 보험' },
  { value: 'PENSION', label: '연금/저축 상담' },
];

const TIME_SLOTS = [
  '오전 10:00 - 12:00',
  '오후 13:00 - 15:00',
  '오후 15:00 - 17:00',
  '오후 17:00 이후',
];

export default function ConsultationPage() {
  const [form, setForm] = useState({
    consultationType: '',
    phone: '',
    date: '',
    timeSlot: TIME_SLOTS[0],
    address: '',
    addressDetail: '',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createConsultation(form);
      setDone(true);
    } catch {
      alert('신청 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout title="상담 요청">
      <div className={styles.page}>
        <div className={styles.contentGrid}>
          <div className={styles.formSection}>
            <div className={styles.formCard}>
              <header className={styles.formHeader}>
                <h2 className={styles.formTitle}>상담 예약 신청</h2>
                <p className={styles.formSubtitle}>전문 상담사와 함께 귀하의 미래를 설계하세요.</p>
              </header>

              <div className={styles.steps}>
                <div className={styles.step}>
                  <div className={`${styles.stepNum} ${styles.stepActive}`}>1</div>
                  <span className={styles.stepLabel}>기본 정보</span>
                </div>
                <div className={styles.stepLine} />
                <div className={styles.step}>
                  <div className={styles.stepNum}>2</div>
                  <span className={`${styles.stepLabelMuted}`}>일정 선택</span>
                </div>
                <div className={styles.stepLine} />
                <div className={styles.step}>
                  <div className={styles.stepNum}>3</div>
                  <span className={`${styles.stepLabelMuted}`}>신청 완료</span>
                </div>
              </div>

              {done ? (
                <div className={styles.successBox}>
                  <div className={styles.successIcon}>✅</div>
                  <h3 className={styles.successTitle}>상담 신청이 완료되었습니다!</h3>
                  <p className={styles.successMsg}>담당 상담사가 확인 후 연락드리겠습니다.</p>
                  <button className={styles.resetBtn} onClick={() => { setDone(false); setForm({ consultationType: '', phone: '', date: '', timeSlot: TIME_SLOTS[0], address: '', addressDetail: '', notes: '' }); }}>
                    새 신청하기
                  </button>
                </div>
              ) : (
                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <label className={styles.label}>상담 유형</label>
                      <select className={styles.select} value={form.consultationType} onChange={handleChange('consultationType')}>
                        {CONSULTATION_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>연락처</label>
                      <input className={styles.input} type="tel" placeholder="010-0000-0000" value={form.phone} onChange={handleChange('phone')} />
                    </div>
                  </div>

                  <div className={styles.row2}>
                    <div className={styles.field}>
                      <label className={styles.label}>상담 희망 일자</label>
                      <input className={styles.input} type="date" value={form.date} onChange={handleChange('date')} />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>상담 희망 시간</label>
                      <select className={styles.select} value={form.timeSlot} onChange={handleChange('timeSlot')}>
                        {TIME_SLOTS.map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>방문/거주 주소</label>
                    <div className={styles.addressRow}>
                      <input className={`${styles.input} ${styles.inputFlex}`} type="text" placeholder="우편번호 찾기" readOnly value={form.address} />
                      <button type="button" className={styles.addrBtn}>주소 검색</button>
                    </div>
                    <input className={`${styles.input} ${styles.mt8}`} type="text" placeholder="상세 주소를 입력하세요" value={form.addressDetail} onChange={handleChange('addressDetail')} />
                  </div>

                  <div className={styles.field}>
                    <label className={styles.label}>추가 요청 사항</label>
                    <textarea className={styles.textarea} rows={4} placeholder="상담 전 미리 전달하실 내용을 적어주세요." value={form.notes} onChange={handleChange('notes')} />
                  </div>

                  <button className={styles.submitBtn} type="submit" disabled={submitting}>
                    {submitting ? '신청 중…' : '다음 단계로 이동 →'}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className={styles.sideSection}>
            <div className={styles.infoCard}>
              <div className={styles.infoIcon}>🛡️</div>
              <h3 className={styles.infoTitle}>안심 상담 서비스</h3>
              <p className={styles.infoText}>
                Kindred Assurance의 모든 상담은 엄격한 보안 프로토콜을 준수하며, 귀하의 정보는 암호화되어 보호됩니다.
              </p>
            </div>

            <div className={styles.hoursCard}>
              <h4 className={styles.hoursTitle}>상담 센터 운영</h4>
              <div className={styles.hoursItem}>
                <span className={styles.hoursIcon}>🕐</span>
                <div>
                  <p className={styles.hoursMain}>평일 09:00 - 18:00</p>
                  <p className={styles.hoursSub}>주말 및 공휴일 휴무</p>
                </div>
              </div>
              <div className={styles.hoursItem}>
                <span className={styles.hoursIcon}>📞</span>
                <div>
                  <p className={styles.hoursMain}>1588-0000</p>
                  <p className={styles.hoursSub}>빠른 유선 상담 신청</p>
                </div>
              </div>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustOverlay}>
                <p className={styles.trustText}>10만 명 이상의 고객이 선택한 프리미엄 케어</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}