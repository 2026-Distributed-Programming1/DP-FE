import styles from './SalesOrgEvaluationDetailPanel.module.css';

// FE-SALES-11: ChannelType enum 하드코딩
const CHANNEL_TYPE_LABELS = {
  DIRECT: '직접',
  AGENCY: '대리점',
  BROKER: '브로커',
  ONLINE: '온라인',
  BANCASSURANCE: '방카슈랑스',
};

export default function SalesOrgEvaluationDetailPanel({ item, onClose }) {
  return (
    <aside className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>평가 상세</span>
        <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">✕</button>
      </div>

      <div className={styles.panelBody}>
        <section className={styles.section}>
          <div className={styles.evalNo}>{item.evaluationNo ?? '-'}</div>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>평가 정보</h3>
          <dl className={styles.dl}>
            <dt>채널유형</dt><dd>{CHANNEL_TYPE_LABELS[item.channelType] ?? item.channelType ?? '-'}</dd>
            <dt>채널명</dt>  <dd>{item.channelName ?? '-'}</dd>
            <dt>평가등급</dt><dd>{item.evaluationGrade ?? '-'}</dd>
            <dt>시작일</dt>  <dd>{item.startDate ?? '-'}</dd>
            <dt>종료일</dt>  <dd>{item.endDate ?? '-'}</dd>
            <dt>등록일</dt>  <dd>{item.createdAt ?? '-'}</dd>
          </dl>
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>액션</h3>
          <div className={styles.actions}>
            <button className={styles.actionBtn} disabled title="Phase 2에서 구현 예정">
              성과급 요청
            </button>
          </div>
          <p className={styles.actionNote}>업무 액션은 Phase 2에서 연결됩니다.</p>
        </section>
      </div>
    </aside>
  );
}