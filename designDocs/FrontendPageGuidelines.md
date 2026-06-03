# 프론트 웹 페이지 구현 가이드라인

> 목적: `Usecase_scenario.md`를 실제 웹 화면으로 옮길 때 공통으로 따라야 할 화면 구성, 라우팅, 상태 관리, API 연동 기준을 정리한다.
> 기준 문서: `Usecase_scenario.md`, `FrontendIntegrationReview.md`, `ApiSpec.md`
> 최종 갱신: 2026-06-04

---

## 0. 현재 구현 상태 요약

### 기반 인프라

| 항목 | 상태 |
|---|---|
| Tailwind CSS v4 + 색상 테마 (`index.css`) | ✅ |
| AuthContext — 세션 복구, role 전파, login/logout | ✅ |
| role 기반 라우팅 가드 (RequireAuth / RequireCustomer / RequireStaff) | ✅ |
| 상단 Navbar — role별 메뉴 필터링 | ✅ |
| Google Fonts (Inter + Material Symbols) | ✅ |

### 인증 페이지

| 라우트 | 파일 | 상태 |
|---|---|---|
| `/login` | `pages/auth/LoginPage.jsx` | ✅ |
| `/signup` | `pages/auth/SignupPage.jsx` | ✅ |
| `/change-password` | `pages/auth/ChangePasswordPage.jsx` | ✅ |

### 직원 포털 페이지

| 라우트 | 파일 | 주요 기능 |
|---|---|---|
| `/dashboard` | `pages/dashboard/DashboardPage.jsx` | role별 바로가기 카드 |
| `/contracts` | `pages/contracts/ContractListPage.jsx` | 목록·상세·해지 |
| `/accidents` | `pages/accidents/AccidentListPage.jsx` | 사고 목록·출동 기록 |
| `/claims` | `pages/claims/ClaimListPage.jsx` | 청구 목록·상세 |
| `/claim-payments` | `pages/claimPayments/ClaimPaymentPage.jsx` | 조사→산출→승인→지급 워크플로 |
| `/sales-activities` | `pages/salesActivities/SalesActivityListPage.jsx` | 채널별 성과·달성률 강조·등록 |
| `/channel-screenings` | `pages/channelScreenings/ChannelScreeningListPage.jsx` | 채용 심사 승인·거절 |
| `/channel-recruitments` | `pages/channelRecruitments/ChannelRecruitmentPage.jsx` | 모집 공고 목록·등록 |
| `/sales-org-evaluations` | `pages/salesOrgEvaluations/SalesOrgEvaluationListPage.jsx` | 평가 등록·성과급 요청 |
| `/underwriting` | `pages/underwriting/UnderwritingListPage.jsx` | 인수심사 대기열·처리 모달 |
| `/consultations` | `pages/consultations/ConsultationPage.jsx` | 상담 목록·수락 |
| `/interview-schedules` | `pages/interviewSchedules/InterviewSchedulePage.jsx` | 면담 일정 목록·등록·취소 |
| `/interview-records` | `pages/interviewRecords/InterviewRecordPage.jsx` | 면담 기록 목록·등록·수정 |
| `/education-plans` | `pages/educationPlans/EducationPlanListPage.jsx` | 계획 목록·승인·반려·신규 |
| `/education-preparations` | `pages/educationPlans/EducationPreparationPage.jsx` | 제반 목록·등록 |
| `/education-executions` | `pages/educationPlans/EducationExecutionPage.jsx` | 실행 목록·출석 등록 |
| `/inquiries` | `pages/inquiries/InquiryPage.jsx` | 문의 목록·상세·답변 |

### 고객 포털 페이지

| 라우트 | 파일 | 주요 기능 |
|---|---|---|
| `/my/contracts` | `pages/contracts/ContractListPage.jsx` | 내 계약 목록·상세·해지 |
| `/my/payments` | `pages/customer/PaymentPage.jsx` | 납입 계약 선택→미리보기→결제 |
| `/my/accidents/new` | `pages/accidents/AccidentReportPage.jsx` | 사고 접수 폼 |
| `/my/claims` | `pages/claims/ClaimListPage.jsx` | 내 청구 목록 |
| `/my/inquiries` | `pages/inquiries/InquiryPage.jsx` | 내 문의 목록·신규 등록 |
| `/my/insurance-applications/new` | `pages/customer/InsuranceApplicationPage.jsx` | 보험 신청 폼 |
| `/my/revivals/new` | `pages/customer/RevivalPage.jsx` | 부활 요청 폼 |
| `/insurance-products` | `pages/insuranceProducts/InsuranceProductPage.jsx` | 상품 목록·상세·신청 |
| `/consultations/new` | `pages/consultations/ConsultationPage.jsx` | 상담 신청 폼 |

### 남은 Placeholder

| 라우트 | 설명 |
|---|---|
| `/expiring-contracts` | 만기 계약 관리 |
| `/contract-statistics` | 계약 통계 |
| `/payment-records` | 납부 내역 관리 (FINANCE_STAFF) |
| `/cancellations` | 해지 관리 |
| `/refunds` | 환급 산출·지급 |
| `/activity-plans` | 영업 활동 계획 |
| `/customer-registrations` | 고객 정보 등록 |
| `/policy-applications` | 청약 목록 |

---

## 1. 기술 스택

| 항목            | 내용                                     |
| --------------- | ---------------------------------------- |
| 번들러          | Vite                                     |
| UI 프레임워크   | React 19                                 |
| 라우팅          | React Router v7                          |
| HTTP 클라이언트 | Axios (`withCredentials: true`)          |
| 스타일          | Tailwind CSS v4 (`@tailwindcss/vite`)    |
| 폰트            | Inter (Google Fonts)                     |
| 아이콘          | Material Symbols Outlined (Google Fonts) |

CSS 모듈(`.module.css`)은 더 이상 사용하지 않는다. 모든 스타일은 Tailwind 유틸리티 클래스와 `index.css`에 정의한 컴포넌트 클래스로 처리한다.

---

## 2. 폴더 구조

```
src/
  api/                    API 함수 모음 (도메인별 파일)
    client.js             Axios 인스턴스 (withCredentials, 401 처리)
    auth.js               getMe, login, logout, signup, changePassword
    contracts.js
    claims.js
    ...
  assets/                 정적 파일
  context/
    AuthContext.jsx       세션 복구, user/role 전파, login/logout
  components/
    common/               공통 UI 컴포넌트
      Button.jsx
      Badge.jsx
      Table.jsx
      Pagination.jsx
      Modal.jsx
      EmptyState.jsx
    layout/
      Layout.jsx          Navbar + <Outlet /> 구조
      Navbar.jsx          상단 고정 바, role 기반 메뉴
      menuConfig.js       role별 메뉴 아이템 정의
  pages/
    auth/
      LoginPage.jsx
      SignupPage.jsx
      ChangePasswordPage.jsx
    customer/             고객 전용 페이지 (/my/*)
      contracts/
      payments/
      accidents/
      claims/
      inquiries/
      applications/
    staff/                직원 전용 페이지
      contracts/
      finance/
      claims/
      sales/
      education/
      inquiries/
  App.jsx                 라우팅 정의
  main.jsx                BrowserRouter + AuthProvider 진입점
  index.css               Tailwind @import + 색상 테마 + 공통 클래스
```

---

## 3. 인증 시스템

### 3.1 세션 복구

앱이 처음 로드될 때 `GET /api/auth/me`를 호출해 기존 세션을 복구한다.
성공하면 `user` 상태에 저장되고, 실패(401)하면 `null`로 처리한다.

```jsx
// AuthContext.jsx 핵심 로직
useEffect(() => {
  getMe()
    .then(setUser)
    .catch(() => setUser(null))
    .finally(() => setLoading(false));
}, []);
```

`loading`이 `true`인 동안은 모든 가드 컴포넌트가 스피너를 렌더링한다.
페이지 새로고침 후에도 세션이 유지되는 이유가 이것이다.

### 3.2 user 객체 구조

```js
{
  id: 1,
  username: "admin",
  role: "ADMIN",               // 아래 role 목록 참고
  linkedCustomerId: null,      // CUSTOMER 계정만 값이 있음
  linkedCustomerNo: null,
  displayName: "관리자",
  passwordChangeRequired: false
}
```

### 3.3 role 목록

| role                 | 설명                |
| -------------------- | ------------------- |
| `CUSTOMER`           | 고객                |
| `ADMIN`              | 관리자 (전체 접근)  |
| `CONTRACT_STAFF`     | 계약 담당           |
| `CLAIM_STAFF`        | 보상/청구 담당      |
| `UNDERWRITING_STAFF` | 인수심사 담당       |
| `SALES_STAFF`        | 영업 담당           |
| `EDUCATION_STAFF`    | 교육 담당           |
| `FINANCE_STAFF`      | 재무/납입/환급 담당 |
| `DISPATCH_STAFF`     | 출동 담당           |
| `STAFF`              | 일반 직원           |

### 3.4 useAuth 훅

```jsx
import { useAuth } from '../context/AuthContext';

function MyPage() {
  const { user, loading, login, logout } = useAuth();
  // user.role, user.displayName 등 사용 가능
}
```

### 3.5 passwordChangeRequired 처리

`user.passwordChangeRequired === true`이면 `RequireAuth` 가드가 자동으로 `/change-password`로 리다이렉트한다. 이 경우 업무 API 호출은 백엔드에서 403으로 차단된다.

---

## 4. 라우팅 구조

### 4.1 라우트 접근 규칙

| 경로                                        | 접근 조건                                       |
| ------------------------------------------- | ----------------------------------------------- |
| `/login`, `/signup`                         | 비로그인 전용 (로그인 상태면 홈으로 리다이렉트) |
| `/change-password`                          | 로그인 사용자                                   |
| `/insurance-products`, `/consultations/new` | 로그인 사용자 전체                              |
| `/my/*`                                     | `CUSTOMER` role만                               |
| 그 외 모든 경로                             | 직원/관리자 role만                              |

### 4.2 로그인 후 기본 이동 경로

```
passwordChangeRequired = true  →  /change-password
role = CUSTOMER                →  /my/contracts
role = ADMIN 또는 *_STAFF      →  /dashboard
```

### 4.3 가드 컴포넌트

`App.jsx`에 다음 가드들이 정의되어 있다.

- `RequireAuth` — 로그인 필요, `passwordChangeRequired` 처리
- `RequireCustomer` — CUSTOMER role만 통과
- `RequireStaff` — 직원/관리자 role만 통과
- `RedirectIfLoggedIn` — 이미 로그인된 상태에서 `/login` 접근 시 홈으로

---

## 5. Navbar와 메뉴 시스템

### 5.1 레이아웃 구조

사이드바 없이 상단 Navbar만 사용한다.

```
┌─────────────────────────────────────────────────┐
│  Kindred Assurance  [메뉴링크...]      [이름] [로그아웃] │  ← Navbar (fixed, h-16)
├─────────────────────────────────────────────────┤
│                                                 │
│              <Outlet /> 페이지 콘텐츠             │
│                                                 │
└─────────────────────────────────────────────────┘
```

### 5.2 메뉴 추가 방법

`src/components/layout/menuConfig.js`에서 관리한다.

```js
// 새 메뉴 그룹 추가 예시
{
  key: 'myGroup',
  allowedRoles: ['CLAIM_STAFF', 'ADMIN'],  // 또는 '*' (전체)
  items: [
    { label: '화면 이름', to: '/route-path', icon: 'material_icon_name' },
  ],
},
```

아이콘 이름은 [Material Symbols](https://fonts.google.com/icons)에서 확인한다.

---

## 6. 새 페이지 추가 절차

1. **API 함수 작성** — `src/api/{domain}.js`에 추가 (기존 파일이 있으면 함수 추가)

2. **페이지 컴포넌트 작성** — `src/pages/{customer or staff}/{domain}/PageName.jsx`

3. **라우트 등록** — `src/App.jsx`에 `<Route>` 추가

   ```jsx
   // 직원용 예시
   <Route path='/my-new-page' element={<MyNewPage />} />
   // RequireStaff 블록 안에 넣으면 자동으로 직원만 접근 가능
   ```

4. **메뉴 등록** — `src/components/layout/menuConfig.js`에 아이템 추가

---

## 7. 공통 Tailwind 클래스

`index.css`에 정의된 재사용 클래스들이다. 페이지 작성 시 인라인 스타일 대신 이것을 먼저 활용한다.

| 클래스             | 용도                           |
| ------------------ | ------------------------------ |
| `.card`            | 흰 배경 카드 (border + shadow) |
| `.btn-primary`     | 초록 주요 버튼                 |
| `.btn-secondary`   | 회색 보조 버튼                 |
| `.btn-ghost`       | 배경 없는 버튼                 |
| `.input`           | 텍스트 입력 필드               |
| `.badge`           | 상태 배지 기본형               |
| `.nav-link`        | 네비게이션 링크                |
| `.nav-link-active` | 활성 네비게이션 링크           |
| `.glass-panel`     | 반투명 블러 패널               |

### 주요 색상 변수 (Tailwind `bg-*`, `text-*`에 사용)

| 변수                 | 값        | 용도           |
| -------------------- | --------- | -------------- |
| `primary`            | `#006c49` | 브랜드 초록    |
| `primary-container`  | `#10b981` | 강조/활성 초록 |
| `background`         | `#f7f9fb` | 전체 배경      |
| `surface`            | `#ffffff` | 카드/패널 배경 |
| `surface-container`  | `#eceef0` | 입력 배경      |
| `on-surface`         | `#191c1e` | 기본 텍스트    |
| `on-surface-variant` | `#3c4a42` | 보조 텍스트    |
| `outline-variant`    | `#bbcabf` | 구분선         |
| `error`              | `#ba1a1a` | 오류/경고      |

---

## 8. API 연동 기준

### 8.1 인증

- 로그인 이후 API 요청은 세션 쿠키 기반이다.
- `src/api/client.js`의 axios 인스턴스는 `withCredentials: true`가 설정되어 있다.
- 401 응답이 오면 자동으로 `/login`으로 리다이렉트한다.
- 별도 토큰 관리 불필요.

### 8.2 목록 응답 형태

```json
{ "page": 1, "size": 20, "total": 100, "items": [] }
```

`items`, `total`, `page`를 기준으로 테이블 컴포넌트를 구성한다.

### 8.3 에러 응답 처리

```json
{ "status": 400, "code": "VALIDATION_ERROR", "message": "...", "fieldErrors": [] }
```

| HTTP | 화면 처리                                   |
| ---- | ------------------------------------------- |
| 400  | `fieldErrors`를 각 필드 하단에 표시         |
| 401  | `/login`으로 이동 (client.js에서 자동 처리) |
| 403  | "권한이 없습니다" 메시지                    |
| 404  | "데이터를 찾을 수 없습니다" 메시지          |
| 500  | "잠시 후 다시 시도해주세요" 메시지          |

### 8.4 Enum 상수 관리

서버 enum 값을 화면 레이블로 변환하는 상수를 `src/api/{domain}.js` 또는 별도 `constants.js`에 둔다.

```js
export const CONTRACT_STATUS = {
  NORMAL: { label: '정상', color: 'text-primary' },
  EXPIRED: { label: '만기', color: 'text-outline' },
  CANCELLED: { label: '해지', color: 'text-error' },
  LAPSED: { label: '실효', color: 'text-error' },
};
```

---

## 9. 화면 패턴

### 9.1 업무 목록 화면 (직원)

```
┌──────────────────────────────────────────┐
│ 페이지 제목        [신규 등록 버튼]         │
├──────────────────────────────────────────┤
│ 필터 영역 (검색어, 상태, 기간 등)  [조회]   │
├──────────────────────────────────────────┤
│ 테이블                                   │
│ ───────────────────────────────────────  │
│ 행 클릭 → 상세 패널 열림                  │
├──────────────────────────────────────────┤
│ 페이지네이션                              │
└──────────────────────────────────────────┘
```

### 9.2 상태별 버튼 노출

백엔드는 `canApprove` 같은 파생 필드를 내려주지 않는다. 프론트가 `status` 값으로 버튼 표시 여부를 결정한다.

```jsx
// 예시
{
  item.status === 'PENDING' && <button onClick={() => handleApprove(item.id)}>승인</button>;
}
```

상태 전이 규칙은 `designDocs/StateTransitionRules.md`를 참고한다.

### 9.3 액션 성공 후 처리

```jsx
// 목록 새로고침 패턴
const handleApprove = async (id) => {
  await approveSomething(id);
  fetchList(); // 목록 다시 조회
  setSelectedItem(null); // 상세 패널 닫기
};
```

---

## 10. 화면 설계 체크리스트

새 화면을 만들기 전에 아래 항목을 확인한다.

- [ ] 유스케이스에서 actor가 누구인가?
- [ ] 어느 role이 접근 가능한가? (`menuConfig.js`에 반영 필요)
- [ ] 목록 / 상세 / 등록 / 상태 전이 중 무엇이 필요한가?
- [ ] 사용할 API endpoint가 `ApiSpec.md`에 있는가?
- [ ] 성공 후 보여줄 정보는 무엇인가?
- [ ] 빈 결과 메시지가 정의되어 있는가?
- [ ] 서버 validation 오류(`fieldErrors`)를 필드에 표시할 수 있는가?
- [ ] 고객 본인 데이터만 보여줘야 하는가?
