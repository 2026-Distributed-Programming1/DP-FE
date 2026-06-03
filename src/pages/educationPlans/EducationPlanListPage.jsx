import { useEffect, useState } from 'react';
import { fetchEducationPlans } from '../../api/educationPlans';
import Layout from '../../components/layout/Layout';
import styles from './EducationPlanListPage.module.css';

const EDU_STATUSES = [
  { value: '', label: '전체' },
  { value: '임시저장', label: '임시저장' },
  { value: '승인요청', label: '승인요청' },
  { value: '승인', label: '승인' },
  { value: '반려', label: '반려' },
];

const ATTENDANCE_STATUS = {
  attending: { label: '참여 중', color: '#10b981' },
  late: { label: '지각', color: '#f59e0b' },
  absent: { label: '미참석', color: '#94a3b8' },
};

const STATUS_CLASS = {
  '임시저장': 'statusDraft',
  '승인요청': 'statusPending',
  '승인': 'statusApproved',
  '반려': 'statusRejected',
};

const MOCK_UPCOMING = [
  { month: '10월', day: '12', title: '신입 사원 온보딩 기술 교육', time: '오전 10:00 - 오후 04:00 • 대회의실 A', active: true },
  { month: '10월', day: '15', title: '보험 심사 리스크 관리 심화 과정', time: '오후 02:00 - 오후 05:00 • 온라인 교육', active: false },
];

const MOCK_ATTENDEES = [
  { name: '김민준', dept: '영업 지원팀', status: 'attending' },
  { name: '이서연', dept: '리스크 심사팀', status: 'late' },
  { name: '박지훈', dept: '고객 만족센터', status: 'absent' },
];

export default function EducationPlanListPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', startDate: '', budget: '' });

  useEffect(() => {
    setLoading(true);
    fetchEducationPlans({ status: statusFilter })
      .then((data) => setItems(Array.isArray(data) ? data : (data?.items ?? data?.content ?? [])))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  const approvedCount = items.filter((i) => i.status === '승인').length;
  const pendingCount = items.filter((i) => i.status === '승인요청').length;

  return (
    <Layout title="교육 계획">
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.pageTitle}>교육 계획 및 진행 관리</h1>
            <p className={styles.pageSub}>체계적인 교육 운영으로 조직 역량을 강화하세요.</p>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.statPill}><span className={styles.statPillLabel}>총 계획</span><span className={styles.statPillValue}>{items.length}건</span></div>
            <div className={styles.statPill}><span className={styles.statPillLabel}>승인</span><span className={`${styles.statPillValue} ${styles.statGreen}`}>{approvedCount}건</span></div>
            <div className={styles.statPill}><span className={styles.statPillLabel}>심사중</span><span className={`${styles.statPillValue} ${styles.statYellow}`}>{pendingCount}건</span></div>
          </div>
        </div>

        <div className={styles.mainGrid}>
          {/* Left: Registration Form */}
          <aside className={styles.leftCol}>
            <div className={styles.formCard}>
              <h2 className={styles.cardTitle}>📝 교육 계획 등록</h2>
              <form className={styles.regForm} onSubmit={(e) => { e.preventDefault(); setShowModal(false); }}>
                <div className={styles.field}>
                  <label className={styles.label}>교육 제목</label>
                  <input className={styles.input} type="text" placeholder="예: 2024 상반기 보안 직무 교육" value={form.title} onChange={handleChange('title')} />
                </div>
                <div className={styles.row2}>
                  <div className={styles.field}>
                    <label className={styles.label}>교육 기간</label>
                    <input className={styles.input} type="date" value={form.startDate} onChange={handleChange('startDate')} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>예산 (KRW)</label>
                    <input className={`${styles.input} ${styles.inputRight}`} type="number" placeholder="0" value={form.budget} onChange={handleChange('budget')} />
                  </div>
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>교육 자료</label>
                  <div className={styles.uploadArea}>
                    <span className={styles.uploadIcon}>📤</span>
                    <p className={styles.uploadText}>파일을 끌어오거나 클릭하여 업로드</p>
                  </div>
                </div>
                <button className={styles.regBtn} type="submit">등록 완료</button>
              </form>
            </div>

            {/* Filter */}
            <div className={styles.filterCard}>
              <label className={styles.label}>상태 필터</label>
              <select className={styles.filterSelect} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                {EDU_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Plan List */}
            <div className={styles.planListCard}>
              <h3 className={styles.cardTitle}>📋 교육 계획 목록</h3>
              {loading && <p className={styles.msg}>불러오는 중…</p>}
              {!loading && items.length === 0 && <p className={styles.msg}>등록된 교육 계획이 없습니다.</p>}
              <div className={styles.planList}>
                {items.map((item, i) => (
                  <div key={item.planNo ?? i} className={styles.planItem}>
                    <div className={styles.planItemTop}>
                      <span className={`${styles.statusBadge} ${styles[STATUS_CLASS[item.status] ?? 'statusDraft']}`}>{item.status ?? '-'}</span>
                    </div>
                    <p className={styles.planItemTitle}>{item.educationName ?? item.title ?? '-'}</p>
                    <p className={styles.planItemMeta}>{item.startDate ?? '-'} ~ {item.endDate ?? '-'}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Right: Calendar + Attendance */}
          <div className={styles.rightCol}>
            {/* Upcoming Schedule */}
            <div className={styles.scheduleCard}>
              <div className={styles.scheduleHeader}>
                <h3 className={styles.cardTitle}>🗓️ 예정된 교육 일정</h3>
              </div>
              <div className={styles.scheduleList}>
                {MOCK_UPCOMING.map((ev) => (
                  <div key={ev.title} className={`${styles.scheduleItem} ${ev.active ? styles.scheduleItemActive : ''}`}>
                    <div className={`${styles.dateBadge} ${ev.active ? styles.dateBadgeActive : ''}`}>
                      <span className={styles.dateMon}>{ev.month}</span>
                      <span className={`${styles.dateDay} ${ev.active ? styles.dateDayActive : ''}`}>{ev.day}</span>
                    </div>
                    <div className={styles.scheduleContent}>
                      <h4 className={styles.scheduleTitle}>{ev.title}</h4>
                      <p className={styles.scheduleMeta}>{ev.time}</p>
                    </div>
                    {!ev.active && (
                      <span className={styles.scheduleBadge}>진행 예정</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance Table */}
            <div className={styles.attendanceCard}>
              <div className={styles.attendanceHeader}>
                <h3 className={styles.cardTitle}>👥 실시간 출석 관리</h3>
              </div>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>대상자</th>
                    <th>부서</th>
                    <th>교육 상태</th>
                    <th className={styles.thRight}>출결 체크</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_ATTENDEES.map((a) => (
                    <tr key={a.name} className={styles.tableRow}>
                      <td>
                        <div className={styles.attendeeCell}>
                          <div className={styles.attendeeAvatar}>{a.name[0]}</div>
                          <div>
                            <div className={styles.attendeeName}>{a.name}</div>
                            <div className={styles.attendeeEmail}>{a.name.toLowerCase()}@kindred.com</div>
                          </div>
                        </div>
                      </td>
                      <td className={styles.tdDept}>{a.dept}</td>
                      <td>
                        <div className={styles.attendanceStatus}>
                          <span className={styles.statusDot} style={{ backgroundColor: ATTENDANCE_STATUS[a.status].color }} />
                          <span>{ATTENDANCE_STATUS[a.status].label}</span>
                        </div>
                      </td>
                      <td className={styles.tdRight}>
                        <div className={styles.checkBtns}>
                          <button className={`${styles.checkBtn} ${a.status !== 'absent' ? styles.checkBtnActive : ''}`}>출석</button>
                          <button className={`${styles.checkBtn} ${a.status === 'absent' ? styles.checkBtnAbsent : ''}`}>결석</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className={styles.attendanceFooter}>
                <button className={styles.viewAllBtn}>전체 명단 보기 (42명)</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
