import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { fetchChannelRecruitments, createChannelRecruitment } from '../../api/channelRecruitments';
import styles from './ChannelRecruitmentPage.module.css';

const STAGE_LABEL = {
  DOCUMENT_REVIEW: '서류 검토',
  FIRST_INTERVIEW: '1차 면접 완료',
  SECOND_INTERVIEW: '2차 인터뷰',
  REFERENCE_CHECK: '레퍼런스 체크',
  FINAL: '채용 확정',
};

const STAGE_CLASS = {
  DOCUMENT_REVIEW: 'stageDoc',
  FIRST_INTERVIEW: 'stageFirst',
  SECOND_INTERVIEW: 'stageSecond',
  REFERENCE_CHECK: 'stageRef',
  FINAL: 'stageFinal',
};

const CHANNEL_OPTIONS = [
  { value: '', label: '채널 유형 선택' },
  { value: 'DIRECT', label: '개인 영업' },
  { value: 'CORPORATE', label: '법인 컨설팅' },
  { value: 'MANAGER', label: '영업 관리자' },
  { value: 'PARTNER', label: '파트너사' },
];

export default function ChannelRecruitmentPage() {
  const [recruitments, setRecruitments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    applicantName: '',
    channelType: '',
    experience: '',
    region: '',
    notes: '',
  });

  useEffect(() => {
    fetchChannelRecruitments()
      .then((data) => setRecruitments(Array.isArray(data) ? data : (data?.items ?? data?.content ?? [])))
      .catch(() => setRecruitments([]))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await createChannelRecruitment(form);
      setRecruitments((prev) => [created, ...prev]);
      setShowModal(false);
      setForm({ applicantName: '', channelType: '', experience: '', region: '', notes: '' });
    } catch {
      alert('등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  const totalCount = recruitments.length;
  const documentCount = recruitments.filter((r) => r.stage === 'DOCUMENT_REVIEW').length;
  const interviewCount = recruitments.filter((r) => r.stage === 'SECOND_INTERVIEW' || r.stage === 'FIRST_INTERVIEW').length;
  const finalCount = recruitments.filter((r) => r.stage === 'FINAL').length;

  function getInitial(name) {
    return name ? name[0] : '?';
  }

  return (
    <Layout title="채널 모집">
      <div className={styles.page}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIconWrap}>
              <span className={styles.headerIcon}>🤝</span>
            </div>
            <div>
              <h1 className={styles.pageTitle}>리크루팅 관리 센터</h1>
              <p className={styles.pageSub}>새로운 보험 영업 채널 및 에이전트 모집 현황입니다.</p>
            </div>
          </div>
          <button className={styles.registerBtn} onClick={() => setShowModal(true)}>
            + 공고 등록하기
          </button>
        </header>

        {/* Stats Bento */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statTop}>
              <div className={`${styles.statIconWrap} ${styles.statGreen}`}>👥</div>
              <span className={styles.statTrend}>+12%</span>
            </div>
            <div className={styles.statNum}>{totalCount}</div>
            <div className={styles.statLabel}>전체 지원자</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statTop}>
              <div className={`${styles.statIconWrap} ${styles.statLight}`}>📋</div>
              <span className={styles.statBadge}>진행중</span>
            </div>
            <div className={styles.statNum}>{documentCount}</div>
            <div className={styles.statLabel}>서류 심사중</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statTop}>
              <div className={`${styles.statIconWrap} ${styles.statTeal}`}>🎤</div>
              <span className={`${styles.statBadge} ${styles.statBadgeHot}`}>HOT</span>
            </div>
            <div className={styles.statNum}>{interviewCount}</div>
            <div className={styles.statLabel}>인터뷰 예정</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statTop}>
              <div className={`${styles.statIconWrap} ${styles.statSecondary}`}>✅</div>
              <span className={styles.statFinalBadge}>최종</span>
            </div>
            <div className={styles.statNum}>{String(finalCount).padStart(2, '0')}</div>
            <div className={styles.statLabel}>채용 확정</div>
          </div>
        </div>

        {/* Main Grid */}
        <div className={styles.mainGrid}>
          {/* Left: Active Job Postings */}
          <section className={styles.leftCol}>
            <h2 className={styles.sectionTitle}>활성 공고</h2>
            {[
              { type: '신입/경력', title: '수도권 거점 보험 설계사 모집', deadline: 'D-12', count: 86, progress: 65, typeClass: 'tagGreen' },
              { type: '전략 영업', title: '기업 보험 전문 컨설턴트', deadline: 'D-05', count: 42, progress: 88, typeClass: 'tagSecondary' },
              { type: '파트너사', title: '영업 대리점 지점장 리쿠루팅', deadline: 'D-21', count: 12, progress: 15, typeClass: 'tagGray' },
            ].map((posting) => (
              <div key={posting.title} className={styles.postingCard}>
                <div className={styles.postingTop}>
                  <span className={`${styles.postingTag} ${styles[posting.typeClass]}`}>{posting.type}</span>
                </div>
                <h3 className={styles.postingTitle}>{posting.title}</h3>
                <p className={styles.postingMeta}>마감: {posting.deadline} | 지원자: {posting.count}명</p>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${posting.progress}%` }} />
                </div>
              </div>
            ))}
          </section>

          {/* Right: Applicant List */}
          <section className={styles.rightCol}>
            <div className={styles.listHeader}>
              <h2 className={styles.sectionTitle}>최근 지원자 목록</h2>
              <div className={styles.listActions}>
                <button className={styles.actionBtn}>필터</button>
                <button className={styles.actionBtn}>내보내기</button>
              </div>
            </div>

            <div className={styles.tableCard}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>지원자 정보</th>
                    <th>희망 채널</th>
                    <th>평가 단계</th>
                    <th>점수</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan={5} className={styles.msgCell}>불러오는 중…</td></tr>
                  )}
                  {!loading && recruitments.length === 0 && (
                    <tr><td colSpan={5} className={styles.msgCell}>등록된 지원자가 없습니다.</td></tr>
                  )}
                  {!loading && recruitments.map((r, i) => (
                    <tr key={r.recruitmentNo ?? i} className={styles.tableRow}>
                      <td>
                        <div className={styles.applicantCell}>
                          <div className={styles.avatar}>{getInitial(r.applicantName)}</div>
                          <div>
                            <div className={styles.applicantName}>{r.applicantName ?? '-'}</div>
                            <div className={styles.applicantSub}>
                              {r.experience ? `경력 ${r.experience}년` : '신입'}{r.region ? ` | ${r.region}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.channelCell}>{r.channelType ?? '-'}</td>
                      <td>
                        <span className={`${styles.stageBadge} ${styles[STAGE_CLASS[r.stage] ?? 'stageDoc']}`}>
                          {STAGE_LABEL[r.stage] ?? r.stage ?? '서류 검토'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.scoreCell}>
                          <span className={styles.starIcon}>⭐</span>
                          <span className={styles.scoreVal}>{r.score ?? '-'}</span>
                        </div>
                      </td>
                      <td>
                        <button className={styles.detailBtn}>상세보기</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={styles.loadMore}>
                <button className={styles.loadMoreBtn}>더 많은 지원자 보기 ↓</button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>공고 등록</h2>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form className={styles.modalForm} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label}>지원자 이름</label>
                <input className={styles.input} type="text" placeholder="이름 입력" value={form.applicantName} onChange={handleChange('applicantName')} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>희망 채널</label>
                <select className={styles.select} value={form.channelType} onChange={handleChange('channelType')}>
                  {CHANNEL_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className={styles.row2}>
                <div className={styles.field}>
                  <label className={styles.label}>경력 (년)</label>
                  <input className={styles.input} type="number" placeholder="0" min="0" value={form.experience} onChange={handleChange('experience')} />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>지역</label>
                  <input className={styles.input} type="text" placeholder="서울" value={form.region} onChange={handleChange('region')} />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label}>메모</label>
                <textarea className={styles.textarea} rows={3} placeholder="추가 메모" value={form.notes} onChange={handleChange('notes')} />
              </div>
              <button className={styles.submitBtn} type="submit" disabled={submitting}>
                {submitting ? '등록 중…' : '등록하기'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
