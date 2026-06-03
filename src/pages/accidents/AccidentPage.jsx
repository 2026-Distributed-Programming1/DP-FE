import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { fetchAccidents } from '../../api/accidents';
import styles from './AccidentPage.module.css';

const STATUS_MAP = {
  RECEIVED: { label: '접수완료', cls: 'orange' },
  DISPATCHED: { label: '출동중', cls: 'green' },
  ARRIVED: { label: '현장도착', cls: 'gray' },
  CLOSED: { label: '처리완료', cls: 'gray' },
};

export default function AccidentPage() {
  const [accidents, setAccidents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchAccidents()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.items ?? data?.content ?? [];
        setAccidents(list);
        if (list.length > 0) setSelected(list[0]);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const waiting = accidents.filter((a) => a.status === 'RECEIVED').length;
  const dispatched = accidents.filter((a) => a.status === 'DISPATCHED').length;

  return (
    <Layout title="사고 접수 및 출동">
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <div>
            <nav className={styles.breadcrumb}>
              <span>보상 관리</span>
              <span>/</span>
              <span className={styles.breadcrumbActive}>현장 관리</span>
            </nav>
            <h2 className={styles.pageTitle}>사고 접수 및 현장 출동 관리</h2>
          </div>
          <div className={styles.statusBadges}>
            <div className={styles.statusBadge}>
              <div className={`${styles.dot} ${styles.dotYellow}`} />
              <span>대기 중: {waiting}건</span>
            </div>
            <div className={styles.statusBadge}>
              <div className={`${styles.dot} ${styles.dotGreen}`} />
              <span>출동 중: {dispatched}건</span>
            </div>
          </div>
        </div>

        <div className={styles.mainGrid}>
          {/* Accident List */}
          <section className={styles.listSection}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>🗂 실시간 사고 목록</h3>
                <button className={styles.linkBtn}>전체보기</button>
              </div>
              <div className={styles.accidentList}>
                {loading && <div className={styles.msgCell}>불러오는 중…</div>}
                {!loading && accidents.length === 0 && (
                  <div className={styles.msgCell}>접수된 사고가 없습니다.</div>
                )}
                {!loading && accidents.map((acc) => {
                  const st = STATUS_MAP[acc.status] ?? { label: acc.status, cls: 'gray' };
                  return (
                    <div
                      key={acc.accidentNo}
                      className={`${styles.accidentItem} ${selected?.accidentNo === acc.accidentNo ? styles.accidentItemActive : ''}`}
                      onClick={() => setSelected(acc)}
                    >
                      <div className={styles.accidentItemTop}>
                        <span className={styles.caseNo}>CASE #{acc.accidentNo}</span>
                        <span className={`${styles.statusTag} ${styles[`status_${st.cls}`]}`}>{st.label}</span>
                      </div>
                      <h4 className={styles.accidentCustomer}>{acc.customerName ?? acc.insuredName ?? '고객님'}</h4>
                      <div className={styles.accidentMeta}>
                        <span>🚗 {acc.vehicleNo ?? '-'}</span>
                        <span>📍 {acc.accidentLocation ?? '-'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Map + Details */}
          <section className={styles.detailSection}>
            <div className={styles.mapCard}>
              <div className={styles.mapPlaceholder}>
                <div className={styles.mapText}>
                  📍 {selected?.accidentLocation ?? '사고 위치를 선택하세요'}
                </div>
                <div className={styles.dispatchControl}>
                  <div className={styles.dispatchHeader}>
                    <span className={styles.dispatchLabel}>배정 관리</span>
                    <h4 className={styles.dispatchTitle}>현장 출동 인원 배정</h4>
                  </div>
                  <div className={styles.dispatchInfo}>
                    <span className={styles.dispatchInfoLabel}>가장 가까운 요원:</span>
                    <span className={styles.dispatchInfoValue}>이정재 (1.2km)</span>
                  </div>
                  <div className={styles.dispatchInfo}>
                    <span className={styles.dispatchInfoLabel}>예상 도착 시간:</span>
                    <span className={`${styles.dispatchInfoValue} ${styles.valueGreen}`}>7분 이내</span>
                  </div>
                  <button className={styles.dispatchBtn}>📤 출동 명령 하달하기</button>
                </div>
              </div>
            </div>

            <div className={styles.bottomGrid}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>📷 사고 현장 사진</h3>
                  <button className={styles.uploadBtn}>☁ 업로드</button>
                </div>
                <div className={styles.photoGrid}>
                  <div className={styles.photoPlaceholder}>사진 1</div>
                  <div className={styles.photoPlaceholder}>사진 2</div>
                  <div className={styles.photoAdd}>+</div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.cardTitle}>📝 현장 특이사항</h3>
                  <span className={styles.updateTime}>마지막 업데이트: 방금</span>
                </div>
                <textarea
                  className={styles.noteArea}
                  rows={4}
                  value={note || (selected?.notes ?? '')}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="현장 특이사항을 입력하세요..."
                />
                <div className={styles.noteActions}>
                  <button className={styles.btnSecondary}>전문화면 입력</button>
                  <button className={styles.btnPrimary}>메모 저장</button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
