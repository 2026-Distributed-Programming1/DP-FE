import { useEffect, useRef, useState } from 'react';
import { fetchEducationPlans } from '../../api/educationPlans';
import Layout from '../../components/layout/Layout';
import styles from './EducationPreparationPage.module.css';

const MATERIAL_OPTIONS = [
  '교재 제작 완료 및 배부 대기',
  '제작 진행 중',
  '전자 교재(PDF) 배포 완료',
];

export default function EducationPreparationPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [searchPeriod, setSearchPeriod] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [venue, setVenue] = useState('');
  const [instructor, setInstructor] = useState('');
  const [materialStatus, setMaterialStatus] = useState(MATERIAL_OPTIONS[0]);
  const [notes, setNotes] = useState('');
  const [toast, setToast] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetchEducationPlans({ status: '승인' })
      .then((data) => setPlans(Array.isArray(data) ? data : (data?.items ?? data?.content ?? [])))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    setLoading(true);
    fetchEducationPlans({ status: '승인' })
      .then((data) => {
        let items = Array.isArray(data) ? data : (data?.items ?? data?.content ?? []);
        if (searchName) items = items.filter((p) => (p.educationName ?? p.title ?? '').includes(searchName));
        setPlans(items);
      })
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }

  function handleSelectPlan(plan) {
    setSelectedPlan(plan);
    setVenue('');
    setInstructor('');
    setMaterialStatus(MATERIAL_OPTIONS[0]);
    setNotes('');
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }

  function handleSave() {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  }

  function handleReset() {
    setVenue('');
    setInstructor('');
    setMaterialStatus(MATERIAL_OPTIONS[0]);
    setNotes('');
  }

  return (
    <Layout title="교육 제반 등록">
      <div className={styles.page}>
        {/* Hero */}
        <div className={styles.hero}>
          <div>
            <div className={styles.heroTitle}>
              <span className={styles.heroIcon}>🎓</span>
              <h2 className={styles.title}>교육 제반 등록</h2>
            </div>
            <p className={styles.subtitle}>승인된 교육 계획안의 상세 운영 제반 사항을 등록합니다.</p>
          </div>
          <div className={styles.actions}>
            <button className={styles.btnOutline} onClick={() => setSelectedPlan(null)}>✕ 취소</button>
            <button className={styles.btnPrimary} onClick={handleSave}>💾 저장</button>
            <button className={styles.btnSecondary}>▶ 교육 진행</button>
          </div>
        </div>

        {/* Search */}
        <section className={styles.glassPanel}>
          <h3 className={styles.sectionTitle}>🔍 교육 계획안 조회</h3>
          <form className={styles.searchFields} onSubmit={handleSearch}>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>교육명</label>
              <input
                className={styles.inputRound}
                type="text"
                placeholder="조회할 교육명을 입력하세요"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.label}>교육 기간</label>
              <input
                className={styles.inputRound}
                type="text"
                placeholder="2024-05-01 ~ 2024-05-31"
                value={searchPeriod}
                onChange={(e) => setSearchPeriod(e.target.value)}
              />
            </div>
            <button className={styles.btnSearch} type="submit">조회</button>
          </form>
        </section>

        {/* Table */}
        <section className={styles.tablePanel}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>승인된 교육 계획안 목록</h3>
            <span className={styles.countBadge}>총 {plans.length}건</span>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>계획번호</th>
                  <th>교육명</th>
                  <th>교육기간</th>
                  <th>채널유형</th>
                  <th>대상자수</th>
                  <th>승인일시</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={6} className={styles.msg}>불러오는 중…</td></tr>
                )}
                {!loading && plans.length === 0 && (
                  <tr><td colSpan={6} className={styles.msg}>승인된 교육 계획이 없습니다.</td></tr>
                )}
                {!loading && plans.map((plan) => (
                  <tr
                    key={plan.planNo}
                    className={`${styles.tableRow} ${selectedPlan?.planNo === plan.planNo ? styles.tableRowActive : ''}`}
                    onClick={() => handleSelectPlan(plan)}
                  >
                    <td className={styles.planNo}>{plan.planNo ?? '-'}</td>
                    <td className={styles.planName}>{plan.educationName ?? plan.title ?? '-'}</td>
                    <td>{plan.startDate ?? '-'} - {plan.endDate ?? '-'}</td>
                    <td>{plan.channelType ?? '-'}</td>
                    <td>{plan.targetCount != null ? `${plan.targetCount}명` : '-'}</td>
                    <td>{plan.approvedAt ?? plan.approvalDate ?? '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Registration Form */}
        {selectedPlan && (
          <section className={styles.formPanel} ref={formRef}>
            <div className={styles.formHeader}>
              <div className={styles.formTitleGroup}>
                <div className={styles.formIconWrap}>✏️</div>
                <h3 className={styles.formTitle}>교육 제반 등록 상세</h3>
              </div>
              <span className={styles.requiredNote}>* 필수 입력 항목</span>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.leftCol}>
                <div className={styles.infoBox}>
                  <p className={styles.infoBoxTitle}>기본 교육 정보</p>
                  <div className={styles.infoGrid}>
                    <div>
                      <p className={styles.infoLabel}>교육명</p>
                      <p className={styles.infoValue}>{selectedPlan.educationName ?? selectedPlan.title ?? '-'}</p>
                    </div>
                    <div>
                      <p className={styles.infoLabel}>교육 기간</p>
                      <p className={styles.infoValue}>{selectedPlan.startDate ?? '-'} - {selectedPlan.endDate ?? '-'}</p>
                    </div>
                    <div>
                      <p className={styles.infoLabel}>채널 유형</p>
                      <p className={styles.infoValue}>{selectedPlan.channelType ?? '-'}</p>
                    </div>
                    <div>
                      <p className={styles.infoLabel}>대상자 수</p>
                      <p className={styles.infoValue}>{selectedPlan.targetCount != null ? `${selectedPlan.targetCount}명` : '-'}</p>
                    </div>
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.labelReq}>교육 장소 <span className={styles.reqStar}>*</span></label>
                  <input
                    className={styles.inputBox}
                    type="text"
                    placeholder="교육 장소를 입력하세요"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.labelReq}>강사명 <span className={styles.reqStar}>*</span></label>
                  <div className={styles.inputRow}>
                    <input
                      className={styles.inputBox}
                      type="text"
                      placeholder="강사명을 입력하세요"
                      value={instructor}
                      onChange={(e) => setInstructor(e.target.value)}
                    />
                    <button className={styles.btnInlineSearch} type="button">검색</button>
                  </div>
                </div>
              </div>

              <div className={styles.rightCol}>
                <div className={styles.fieldGroup}>
                  <label className={styles.labelReq}>교재 준비 현황 <span className={styles.reqStar}>*</span></label>
                  <select
                    className={styles.selectBox}
                    value={materialStatus}
                    onChange={(e) => setMaterialStatus(e.target.value)}
                  >
                    {MATERIAL_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.labelReq}>교육 대상자 명단 첨부 <span className={styles.reqStar}>*</span></label>
                  <div className={styles.uploadArea}>
                    <span className={styles.uploadIcon}>📤</span>
                    <div className={styles.uploadTextWrap}>
                      <p className={styles.uploadText}>파일을 드래그하거나 클릭하여 업로드</p>
                      <p className={styles.uploadSub}>Excel, CSV 형식만 가능 (최대 10MB)</p>
                    </div>
                    <button className={styles.uploadBtn} type="button">파일 선택</button>
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <label className={styles.label}>기타 준비 사항 (선택)</label>
                  <textarea
                    className={styles.textarea}
                    placeholder="다과 준비, 기념품 세트 구성 등 상세 요청 사항"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className={styles.formFooter}>
              <button className={styles.btnReset} type="button" onClick={handleReset}>초기화</button>
              <button className={styles.btnComplete} type="button" onClick={handleSave}>등록 완료</button>
            </div>
          </section>
        )}

        {toast && (
          <div className={styles.toast}>
            <div className={styles.toastIcon}>✓</div>
            <p>교육 제반 등록이 완료되었습니다.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
