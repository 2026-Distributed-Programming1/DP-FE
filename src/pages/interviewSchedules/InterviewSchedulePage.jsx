import { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { fetchInterviewSchedules, createInterviewSchedule } from '../../api/interviewSchedules';
import styles from './InterviewSchedulePage.module.css';

const STATUS_LABEL = {
  SCHEDULED: '예정',
  COMPLETED: '완료',
  CANCELLED: '취소',
};

const STATUS_CLASS = {
  SCHEDULED: 'statusScheduled',
  COMPLETED: 'statusCompleted',
  CANCELLED: 'statusCancelled',
};

const DOW = ['일', '월', '화', '수', '목', '금', '토'];

function buildCalendar(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  const lastDate = new Date(year, month + 1, 0).getDate();
  const prevLastDate = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    cells.push({ date: prevLastDate - i, current: false });
  }
  for (let d = 1; d <= lastDate; d++) {
    cells.push({ date: d, current: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ date: cells.length - firstDay - lastDate + 1, current: false });
  }
  return cells;
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  const isToday =
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const isYesterday =
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate();

  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (isToday) return `오늘 ${timeStr}`;
  if (isYesterday) return `어제 ${timeStr}`;
  return `${d.getMonth() + 1}/${d.getDate()} ${timeStr}`;
}

export default function InterviewSchedulePage() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date();
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth());

  const [form, setForm] = useState({
    customerName: '',
    topic: '',
    scheduledAt: '',
    notes: '',
  });

  useEffect(() => {
    fetchInterviewSchedules()
      .then((data) => setSchedules(Array.isArray(data) ? data : (data?.items ?? data?.content ?? [])))
      .catch(() => setSchedules([]))
      .finally(() => setLoading(false));
  }, []);

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await createInterviewSchedule(form);
      setSchedules((prev) => [created, ...prev]);
      setShowModal(false);
      setForm({ customerName: '', topic: '', scheduledAt: '', notes: '' });
    } catch {
      alert('일정 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  const todayCount = schedules.filter((s) => {
    if (!s.scheduledAt) return false;
    const d = new Date(s.scheduledAt);
    return (
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate()
    );
  }).length;

  const completedCount = schedules.filter((s) => s.status === 'COMPLETED').length;
  const achievementRate =
    schedules.length > 0 ? Math.round((completedCount / schedules.length) * 100) : 0;

  const calCells = buildCalendar(calYear, calMonth);

  const eventsByDate = {};
  schedules.forEach((s) => {
    if (!s.scheduledAt) return;
    const d = new Date(s.scheduledAt);
    if (d.getFullYear() === calYear && d.getMonth() === calMonth) {
      const key = d.getDate();
      if (!eventsByDate[key]) eventsByDate[key] = [];
      eventsByDate[key].push(s);
    }
  });

  function prevMonth() {
    if (calMonth === 0) { setCalYear((y) => y - 1); setCalMonth(11); }
    else setCalMonth((m) => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear((y) => y + 1); setCalMonth(0); }
    else setCalMonth((m) => m + 1);
  }

  return (
    <Layout title="면담 일정">
      <div className={styles.page}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.heroLeft}>
            <div className={styles.heroTitleRow}>
              <span className={styles.heroIcon}>📅</span>
              <div>
                <h1 className={styles.heroTitle}>영업 활동 허브</h1>
                <p className={styles.heroSub}>오늘의 일정과 성과를 한눈에 확인하세요.</p>
              </div>
            </div>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>오늘의 미팅</span>
              <span className={styles.statValue}>{todayCount} 건</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>달성률</span>
              <span className={`${styles.statValue} ${styles.statSecondary}`}>{achievementRate}%</span>
            </div>
          </div>
        </section>

        {/* Bento Grid */}
        <div className={styles.bento}>
          {/* Calendar */}
          <div className={styles.calCard}>
            <div className={styles.calHeader}>
              <h3 className={styles.cardTitle}>
                <span className={styles.cardIcon}>🗓️</span> 개인 일정
              </h3>
              <div className={styles.calNav}>
                <button className={styles.navBtn} onClick={prevMonth}>‹</button>
                <span className={styles.calMonth}>{calYear}년 {calMonth + 1}월</span>
                <button className={styles.navBtn} onClick={nextMonth}>›</button>
              </div>
            </div>

            <div className={styles.calGrid7}>
              {DOW.map((d) => (
                <div key={d} className={styles.calDow}>{d}</div>
              ))}
            </div>
            <div className={styles.calGrid7}>
              {calCells.map((cell, idx) => {
                const isToday =
                  cell.current &&
                  cell.date === today.getDate() &&
                  calYear === today.getFullYear() &&
                  calMonth === today.getMonth();
                const events = cell.current ? (eventsByDate[cell.date] || []) : [];
                return (
                  <div
                    key={idx}
                    className={`${styles.calCell} ${!cell.current ? styles.calCellOther : ''} ${isToday ? styles.calCellToday : ''}`}
                  >
                    <span className={`${styles.calDate} ${isToday ? styles.calDateToday : ''} ${cell.date % 7 === 0 ? styles.calDateSun : ''}`}>
                      {cell.date}
                    </span>
                    <div className={styles.calEvents}>
                      {events.slice(0, 2).map((ev, i) => (
                        <div key={i} className={styles.calEvent}>
                          {new Date(ev.scheduledAt).getHours().toString().padStart(2,'0')}:{new Date(ev.scheduledAt).getMinutes().toString().padStart(2,'0')} {ev.customerName || ev.topic || ''}
                        </div>
                      ))}
                      {events.length > 2 && (
                        <div className={styles.calEventMore}>+{events.length - 2}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column */}
          <div className={styles.rightCol}>
            {/* Quick Tools */}
            <div className={styles.glassCard}>
              <h3 className={styles.cardTitle}>
                <span className={styles.cardIcon}>⚡</span> 빠른 도구
              </h3>
              <div className={styles.toolList}>
                {[
                  { icon: '📄', label: '신규 상품 제안서', color: styles.toolIconGreen },
                  { icon: '🧮', label: '보험료 간편 계산', color: styles.toolIconBlue },
                  { icon: '🔍', label: '고객 분석 리포트', color: styles.toolIconTeal },
                ].map((tool) => (
                  <button key={tool.label} className={styles.toolBtn}>
                    <div className={styles.toolBtnLeft}>
                      <div className={`${styles.toolIconWrap} ${tool.color}`}>
                        <span>{tool.icon}</span>
                      </div>
                      <span className={styles.toolLabel}>{tool.label}</span>
                    </div>
                    <span className={styles.toolArrow}>›</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Performance */}
            <div className={styles.perfCard}>
              <h3 className={styles.cardTitle}>
                <span className={styles.cardIcon}>📊</span> 실적 현황
              </h3>
              <div className={styles.perfList}>
                <div className={styles.perfItem}>
                  <div className={styles.perfRow}>
                    <span className={styles.perfLabel}>월간 매출 목표</span>
                    <span className={styles.perfVal}>₩42,000,000 / ₩50,000,000</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: '84%' }} />
                  </div>
                </div>
                <div className={styles.perfItem}>
                  <div className={styles.perfRow}>
                    <span className={styles.perfLabel}>신규 계약 건수</span>
                    <span className={styles.perfVal}>12 / 15</span>
                  </div>
                  <div className={styles.progressBar}>
                    <div className={`${styles.progressFill} ${styles.progressSecondary}`} style={{ width: '80%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Meeting Log Table */}
          <div className={`${styles.glassCard} ${styles.fullWidth}`}>
            <div className={styles.tableHeader}>
              <h3 className={styles.cardTitle}>
                <span className={styles.cardIcon}>📋</span> 최근 고객 미팅 기록
              </h3>
              <button className={styles.addBtn} onClick={() => setShowModal(true)}>
                기록 추가
              </button>
            </div>

            {loading ? (
              <div className={styles.empty}>불러오는 중…</div>
            ) : schedules.length === 0 ? (
              <div className={styles.empty}>등록된 면담 일정이 없습니다.</div>
            ) : (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>날짜/시간</th>
                      <th>고객명</th>
                      <th>상담 주제</th>
                      <th>상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {schedules.map((s, i) => (
                      <tr key={s.scheduleNo ?? i}>
                        <td className={styles.tdBold}>{formatDate(s.scheduledAt)}</td>
                        <td>{s.customerName ?? '-'}</td>
                        <td>{s.topic ?? s.consultationType ?? '-'}</td>
                        <td>
                          <span className={`${styles.badge} ${styles[STATUS_CLASS[s.status] ?? 'statusScheduled']}`}>
                            {STATUS_LABEL[s.status] ?? s.status ?? '예정'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>면담 일정 등록</h2>
              <button className={styles.closeBtn} onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form className={styles.modalForm} onSubmit={handleSubmit}>
              <div className={styles.field}>
                <label className={styles.label}>고객명</label>
                <input className={styles.input} type="text" placeholder="고객 이름" value={form.customerName} onChange={handleChange('customerName')} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>상담 주제</label>
                <input className={styles.input} type="text" placeholder="상담 주제를 입력하세요" value={form.topic} onChange={handleChange('topic')} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>일정 일시</label>
                <input className={styles.input} type="datetime-local" value={form.scheduledAt} onChange={handleChange('scheduledAt')} required />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>메모</label>
                <textarea className={styles.textarea} rows={3} placeholder="추가 메모" value={form.notes} onChange={handleChange('notes')} />
              </div>
              <button className={styles.submitBtn} type="submit" disabled={submitting}>
                {submitting ? '등록 중…' : '일정 등록'}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}
