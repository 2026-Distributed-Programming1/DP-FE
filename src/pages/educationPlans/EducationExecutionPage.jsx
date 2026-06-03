import { useState } from 'react';
import Layout from '../../components/layout/Layout';
import styles from './EducationExecutionPage.module.css';

const MOCK_PLAN = {
  title: '신입 설계사 온보딩 기술 교육',
  date: '2024.10.12',
  channelType: '오프라인 집합',
  venue: '대회의실 A',
  instructor: '김민준 팀장',
};

const INITIAL_ATTENDEES = [
  { id: 1, name: '이서윤', dept: '서울 영업 1본부', attended: true },
  { id: 2, name: '강도현', dept: '경기 지원본부', attended: true },
  { id: 3, name: '박지아', dept: '상품개발 TFT', attended: false },
  { id: 4, name: '최준호', dept: '영남 관리팀', attended: true },
  { id: 5, name: '정유진', dept: '전략기획실', attended: true },
];

const TOTAL = 42;
const BASE_ATTENDED = 31; // 나머지 37명 중 31명 출석 (초기값 35/42 맞춤)

export default function EducationExecutionPage() {
  const [attendees, setAttendees] = useState(INITIAL_ATTENDEES);
  const [memo, setMemo] = useState('');
  const [toast, setToast] = useState(false);

  const attendedCount = BASE_ATTENDED + attendees.filter((a) => a.attended).length;
  const progressPct = Math.round((attendedCount / TOTAL) * 100);

  function toggleAttendance(id, attended) {
    setAttendees((prev) => prev.map((a) => (a.id === id ? { ...a, attended } : a)));
  }

  function handleComplete() {
    setToast(true);
    setTimeout(() => setToast(false), 3000);
  }

  return (
    <Layout title="교육 진행 관리">
      <div className={styles.page}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroLeft}>
            <div className={styles.iconWrap}>📖</div>
            <div>
              <h2 className={styles.title}>교육 진행 관리</h2>
              <p className={styles.subtitle}>Education Progress Management</p>
            </div>
          </div>
          <div className={styles.actions}>
            <button className={styles.btnOutline}>취소</button>
            <button className={styles.btnPrimary} onClick={handleComplete}>진행 완료</button>
          </div>
        </section>

        {/* Grid */}
        <div className={styles.grid}>
          {/* Left Column */}
          <div className={styles.leftCol}>
            <div className={styles.glassPanel}>
              <h3 className={styles.cardTitle}>
                <span className={styles.accentBar} />
                교육 정보
              </h3>
              <div className={styles.infoList}>
                <div>
                  <p className={styles.infoLabel}>교육 명칭</p>
                  <p className={styles.infoValuePrimary}>{MOCK_PLAN.title}</p>
                </div>
                <div className={styles.infoRow2}>
                  <div>
                    <p className={styles.infoLabel}>교육 일시</p>
                    <p className={styles.infoValue}>📅 {MOCK_PLAN.date}</p>
                  </div>
                  <div>
                    <p className={styles.infoLabel}>채널 유형</p>
                    <span className={styles.channelBadge}>{MOCK_PLAN.channelType}</span>
                  </div>
                </div>
                <div>
                  <p className={styles.infoLabel}>장소</p>
                  <p className={styles.infoValue}>📍 {MOCK_PLAN.venue}</p>
                </div>
                <div>
                  <p className={styles.infoLabel}>강사명</p>
                  <div className={styles.instructorRow}>
                    <div className={styles.instructorAvatar}>👤</div>
                    <span className={styles.infoValue}>{MOCK_PLAN.instructor}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.glassPanel}>
              <h3 className={styles.cardTitle}>
                <span className={styles.accentBar} />
                교육 진행 메모
              </h3>
              <textarea
                className={styles.memoTextarea}
                placeholder="특이사항이나 진행 중 메모를 입력하세요..."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={6}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.rightCol}>
            {/* Status Summary */}
            <div className={styles.statusSummary}>
              <div className={styles.statusLeft}>
                <div className={styles.statusIconWrap}>👥</div>
                <div>
                  <p className={styles.statusLabel}>실시간 출석 현황</p>
                  <p className={styles.statusCount}>
                    <span className={styles.statusCountNum}>{attendedCount}</span>
                    <span className={styles.statusCountTotal}> / {TOTAL}명</span>
                  </p>
                </div>
              </div>
              <div className={styles.progressTrack}>
                <div className={styles.progressBar} style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            {/* Attendance Table */}
            <div className={styles.tablePanel}>
              <div className={styles.tableHeader}>
                <h3 className={styles.tableTitle}>출석 관리 명단</h3>
                <div className={styles.tableActions}>
                  <button className={styles.iconBtn} title="필터">⚙️</button>
                  <button className={styles.iconBtn} title="다운로드">⬇️</button>
                </div>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>이름</th>
                      <th>부서</th>
                      <th className={styles.thCenter}>출석 여부</th>
                      <th className={styles.thRight}>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendees.map((a) => (
                      <tr key={a.id} className={styles.tableRow}>
                        <td>
                          <div className={styles.nameCell}>
                            <div className={styles.avatar}>{a.name[0]}</div>
                            <span className={styles.nameText}>{a.name}</span>
                          </div>
                        </td>
                        <td className={styles.deptCell}>{a.dept}</td>
                        <td className={styles.attendanceCell}>
                          <div className={styles.toggleBtns}>
                            <button
                              className={a.attended ? styles.btnAttendActive : styles.btnAttend}
                              onClick={() => toggleAttendance(a.id, true)}
                            >
                              {a.attended ? '✓ 출석' : '출석'}
                            </button>
                            <button
                              className={!a.attended ? styles.btnAbsentActive : styles.btnAbsent}
                              onClick={() => toggleAttendance(a.id, false)}
                            >
                              {!a.attended ? '✕ 결석' : '결석'}
                            </button>
                          </div>
                        </td>
                        <td className={styles.statusCell}>
                          {a.attended ? (
                            <span className={styles.badgeComplete}>
                              <span className={styles.dotGreen} /> 완료
                            </span>
                          ) : (
                            <span className={styles.badgeAbsent}>
                              <span className={styles.dotRed} /> 미입실
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.tablePagination}>
                <span className={styles.paginationInfo}>Showing 5 of {TOTAL} participants</span>
                <div className={styles.paginationBtns}>
                  <button className={styles.pageBtn}>‹</button>
                  <button className={`${styles.pageBtn} ${styles.pageBtnActive}`}>1</button>
                  <button className={styles.pageBtn}>2</button>
                  <button className={styles.pageBtn}>3</button>
                  <button className={styles.pageBtn}>›</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {toast && (
          <div className={styles.toast}>
            <div className={styles.toastIcon}>✓</div>
            <p>교육 진행이 완료 처리되었습니다.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
