import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_MENUS = {
  CONTRACT_STAFF: [
    { icon: 'folder_open',  label: '계약 목록',     to: '/contracts',           desc: '전체 계약 조회·관리' },
    { icon: 'event',        label: '만기 계약',      to: '/expiring-contracts',  desc: '만기 임박 계약 관리' },
    { icon: 'bar_chart',    label: '계약 통계',      to: '/contract-statistics', desc: '계약 현황 스냅샷' },
  ],
  CLAIM_STAFF: [
    { icon: 'car_crash',    label: '사고·출동',      to: '/accidents',    desc: '사고 접수 및 출동 관리' },
    { icon: 'receipt_long', label: '청구 목록',       to: '/claims',       desc: '보험금 청구 처리' },
    { icon: 'paid',         label: '보험금 지급',     to: '/claim-payments', desc: '지급 실행' },
  ],
  DISPATCH_STAFF: [
    { icon: 'car_crash',    label: '사고·출동',      to: '/accidents',    desc: '출동 기록 등록' },
  ],
  FINANCE_STAFF: [
    { icon: 'receipt',      label: '납부 내역',       to: '/payment-records', desc: '수납 확정·반려' },
    { icon: 'currency_exchange', label: '해지·환급', to: '/refunds',         desc: '환급 산출·지급' },
  ],
  UNDERWRITING_STAFF: [
    { icon: 'fact_check',   label: '인수심사',        to: '/underwriting',      desc: '대기 건 심사' },
    { icon: 'calendar_month', label: '면담 일정',    to: '/interview-schedules', desc: '일정 등록·관리' },
    { icon: 'edit_note',    label: '면담 기록',       to: '/interview-records', desc: '기록 조회·등록' },
    { icon: 'chat',         label: '상담 목록',       to: '/consultations',     desc: '상담 수락' },
  ],
  SALES_STAFF: [
    { icon: 'trending_up',  label: '영업활동',        to: '/sales-activities',      desc: '채널별 성과 관리' },
    { icon: 'verified',     label: '채널 심사',        to: '/channel-screenings',    desc: '채용 심사 승인' },
    { icon: 'group_add',    label: '채널 모집',        to: '/channel-recruitments',  desc: '모집 공고 등록' },
    { icon: 'leaderboard',  label: '조직 평가',        to: '/sales-org-evaluations', desc: '평가·성과급 요청' },
    { icon: 'calendar_month', label: '면담 일정',    to: '/interview-schedules',   desc: '일정 등록·관리' },
    { icon: 'chat',         label: '상담 목록',        to: '/consultations',         desc: '상담 수락' },
  ],
  EDUCATION_STAFF: [
    { icon: 'school',       label: '교육 계획',       to: '/education-plans',        desc: '계획 작성·승인' },
    { icon: 'checklist',    label: '교육 제반',       to: '/education-preparations', desc: '제반 사항 등록' },
    { icon: 'play_circle',  label: '교육 실행',       to: '/education-executions',   desc: '출석 및 진행' },
  ],
  STAFF: [
    { icon: 'folder_open',  label: '계약 목록',     to: '/contracts',  desc: '계약 조회' },
    { icon: 'receipt_long', label: '청구 목록',     to: '/claims',     desc: '청구 조회' },
    { icon: 'inbox',        label: '문의 목록',     to: '/inquiries',  desc: '문의 답변' },
  ],
};

// ADMIN은 모든 메뉴
const ADMIN_MENUS = [
  { icon: 'folder_open',       label: '계약 목록',    to: '/contracts',              group: '계약' },
  { icon: 'event',             label: '만기 계약',     to: '/expiring-contracts',     group: '계약' },
  { icon: 'receipt',           label: '납부 내역',     to: '/payment-records',        group: '재무' },
  { icon: 'currency_exchange', label: '해지·환급',    to: '/refunds',                group: '재무' },
  { icon: 'car_crash',         label: '사고·출동',    to: '/accidents',              group: '보상' },
  { icon: 'receipt_long',      label: '청구 목록',     to: '/claims',                 group: '보상' },
  { icon: 'paid',              label: '보험금 지급',   to: '/claim-payments',         group: '보상' },
  { icon: 'fact_check',        label: '인수심사',      to: '/underwriting',           group: '영업' },
  { icon: 'trending_up',       label: '영업활동',      to: '/sales-activities',       group: '영업' },
  { icon: 'verified',          label: '채널 심사',     to: '/channel-screenings',     group: '영업' },
  { icon: 'group_add',         label: '채널 모집',     to: '/channel-recruitments',   group: '영업' },
  { icon: 'leaderboard',       label: '조직 평가',     to: '/sales-org-evaluations',  group: '영업' },
  { icon: 'school',            label: '교육 계획',     to: '/education-plans',        group: '교육' },
  { icon: 'inbox',             label: '문의 목록',     to: '/inquiries',              group: '지원' },
];

function MenuCard({ icon, label, desc, to }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="card p-5 flex flex-col gap-3 text-left hover:-translate-y-1 hover:shadow-md transition-all duration-200 active:scale-95"
    >
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-[22px]">{icon}</span>
      </div>
      <div>
        <p className="font-semibold text-on-surface text-sm">{label}</p>
        <p className="text-xs text-on-surface-variant mt-0.5">{desc}</p>
      </div>
    </button>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const menus = user?.role === 'ADMIN'
    ? ADMIN_MENUS
    : ROLE_MENUS[user?.role] ?? ROLE_MENUS['STAFF'];

  return (
    <div className="space-y-8">
      {/* 환영 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-on-surface">
            안녕하세요, {user?.displayName}님 👋
          </h1>
          <p className="text-sm text-on-surface-variant mt-0.5">
            오늘도 업무를 시작해볼까요?
          </p>
        </div>
        <div className="badge bg-primary/10 text-primary px-3 py-1.5 text-xs font-semibold">
          {user?.role}
        </div>
      </div>

      {/* 빠른 이동 */}
      {user?.role === 'ADMIN' ? (
        // 관리자는 그룹별로 나눔
        Object.entries(
          ADMIN_MENUS.reduce((acc, m) => {
            acc[m.group] = [...(acc[m.group] ?? []), m];
            return acc;
          }, {})
        ).map(([group, items]) => (
          <div key={group}>
            <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">{group}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map(m => <MenuCard key={m.to} {...m} />)}
            </div>
          </div>
        ))
      ) : (
        <div>
          <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">업무 바로가기</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {menus.map(m => <MenuCard key={m.to} {...m} />)}
          </div>
        </div>
      )}

      {/* 공통 링크 */}
      <div>
        <h2 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">공통</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <MenuCard icon="shield"        label="보험상품"   desc="상품 목록 조회" to="/insurance-products" />
          <MenuCard icon="support_agent" label="상담 신청"  desc="신규 상담 접수" to="/consultations/new" />
          <MenuCard icon="inbox"         label="문의 목록"  desc="고객 문의 확인" to="/inquiries" />
          <MenuCard icon="lock"          label="비밀번호 변경" desc="계정 보안" to="/change-password" />
        </div>
      </div>
    </div>
  );
}
