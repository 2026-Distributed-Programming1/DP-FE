// 각 그룹의 allowedRoles: '*' = 로그인 사용자 전체, 배열 = 해당 role만
export const MENU_GROUPS = [
  // ── 고객 전용 ──────────────────────────────────────────────
  {
    key: 'customer',
    allowedRoles: ['CUSTOMER'],
    items: [
      { label: '내 계약',    to: '/my/contracts',                   icon: 'description' },
      { label: '납입',       to: '/my/payments',                    icon: 'payment' },
      { label: '사고 접수',  to: '/my/accidents/new',               icon: 'car_crash' },
      { label: '청구',       to: '/my/claims',                      icon: 'receipt_long' },
      { label: '보험 신청',  to: '/my/insurance-applications/new',  icon: 'add_circle' },
      { label: '부활 요청',  to: '/my/revivals/new',                icon: 'restore' },
      { label: '문의',       to: '/my/inquiries',                   icon: 'help' },
    ],
  },

  // ── 공용 (로그인 사용자 전체) ───────────────────────────────
  {
    key: 'common',
    allowedRoles: '*',
    items: [
      { label: '보험상품',   to: '/insurance-products',  icon: 'shield' },
      { label: '상담 신청',  to: '/consultations/new',   icon: 'support_agent' },
    ],
  },

  // ── 계약 담당 ──────────────────────────────────────────────
  {
    key: 'contract',
    allowedRoles: ['CONTRACT_STAFF', 'ADMIN'],
    items: [
      { label: '계약 목록',    to: '/contracts',           icon: 'folder_open' },
      { label: '만기 계약',    to: '/expiring-contracts',  icon: 'event' },
      { label: '계약 통계',    to: '/contract-statistics', icon: 'bar_chart' },
      { label: '해지 관리',    to: '/cancellations',       icon: 'cancel' },
    ],
  },

  // ── 재무 담당 ──────────────────────────────────────────────
  {
    key: 'finance',
    allowedRoles: ['FINANCE_STAFF', 'ADMIN'],
    items: [
      { label: '납부 내역',   to: '/payment-records', icon: 'receipt' },
      { label: '해지·환급',   to: '/refunds',         icon: 'currency_exchange' },
    ],
  },

  // ── 보상·출동 담당 ─────────────────────────────────────────
  {
    key: 'claim',
    allowedRoles: ['CLAIM_STAFF', 'DISPATCH_STAFF', 'FINANCE_STAFF', 'ADMIN'],
    items: [
      { label: '사고·출동',   to: '/accidents',     icon: 'car_crash' },
      { label: '청구 목록',   to: '/claims',        icon: 'receipt_long' },
      { label: '보험금 지급', to: '/claim-payments',icon: 'paid' },
    ],
  },

  // ── 영업 담당 ──────────────────────────────────────────────
  {
    key: 'sales',
    allowedRoles: ['SALES_STAFF', 'UNDERWRITING_STAFF', 'ADMIN'],
    items: [
      { label: '상담 목록',   to: '/consultations',         icon: 'chat' },
      { label: '면담 일정',   to: '/interview-schedules',   icon: 'calendar_month' },
      { label: '면담 기록',   to: '/interview-records',     icon: 'edit_note' },
      { label: '인수심사',    to: '/underwriting',          icon: 'fact_check' },
      { label: '청약 목록',   to: '/policy-applications',   icon: 'article' },
    ],
  },
  {
    key: 'salesOps',
    allowedRoles: ['SALES_STAFF', 'ADMIN'],
    items: [
      { label: '영업활동',    to: '/sales-activities',      icon: 'trending_up' },
      { label: '채널 심사',   to: '/channel-screenings',    icon: 'verified' },
      { label: '채널 모집',   to: '/channel-recruitments',  icon: 'group_add' },
      { label: '조직 평가',   to: '/sales-org-evaluations', icon: 'leaderboard' },
      { label: '활동 계획',   to: '/activity-plans',        icon: 'event_note' },
      { label: '고객 등록',   to: '/customer-registrations',icon: 'person_add' },
      { label: '청약 목록',   to: '/policy-applications',   icon: 'article' },
    ],
  },

  // ── 교육 담당 ──────────────────────────────────────────────
  {
    key: 'education',
    allowedRoles: ['EDUCATION_STAFF', 'ADMIN'],
    items: [
      { label: '교육 계획',   to: '/education-plans',        icon: 'school' },
      { label: '교육 제반',   to: '/education-preparations', icon: 'checklist' },
      { label: '교육 실행',   to: '/education-executions',   icon: 'play_circle' },
    ],
  },

  // ── 고객센터 (직원/관리자) ──────────────────────────────────
  {
    key: 'support',
    allowedRoles: ['STAFF', 'CONTRACT_STAFF', 'CLAIM_STAFF', 'UNDERWRITING_STAFF',
                   'SALES_STAFF', 'EDUCATION_STAFF', 'FINANCE_STAFF', 'DISPATCH_STAFF', 'ADMIN'],
    items: [
      { label: '문의 목록',   to: '/inquiries', icon: 'inbox' },
    ],
  },
];

// 현재 role에서 볼 수 있는 모든 메뉴 아이템 반환
export function getMenuItems(role) {
  return MENU_GROUPS.flatMap((group) => {
    if (group.allowedRoles === '*') return group.items;
    if (group.allowedRoles.includes(role)) return group.items;
    return [];
  });
}
