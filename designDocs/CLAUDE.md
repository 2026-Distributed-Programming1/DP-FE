# DP-FE 프로젝트 컨텍스트

## 프로젝트 개요

**Kindred Assurance** 보험 업무 포털의 프론트엔드.
React + Vite + React Router + Axios + CSS Modules 구성.

백엔드(`DP-BE`)는 EC2에 Docker로 배포되어 있고, `http://3.19.29.29:8080` 으로 접근 가능.

---

## 현재 작업 상황

`src/aiDesign/` 폴더에 Google Stitch로 새로 디자인한 HTML 파일이 12개 있다.
**이 HTML들이 새로운 디자인 기준이다.**

기존 `src/pages/`에 있는 React 페이지들은 Phase 1으로 직접 구현하고 PR까지 올린 것들이다. 하지만 Stitch로 새로 디자인한 aiDesign HTML이 새 디자인 기준이므로 **전부 교체 대상**이다.

### 할 일: aiDesign HTML → React 변환 및 pages 교체

| HTML 파일 | 변환할 페이지 | 라우트 |
|-----------|--------------|--------|
| `underwriting-list.html` | 인수심사 목록 | `/underwriting` |
| `underwriting-dashboard.html` | 인수심사 대시보드 | `/underwriting/dashboard` |
| `accident-registration-dispatch.html` | 사고 접수/출동 | `/accidents` |
| `claims-assessment-payment.html` | 보험금 지급 | `/claim-payments` |
| `consultation-request.html` | 상담 요청 | `/consultations` |
| `agent-activity-schedule-hub.html` | 면담 일정 | `/interview-schedules` |
| `sales-activity-management.html` | 영업활동 관리 | `/sales-activities` |
| `sales-channel-recruitment.html` | 채널 모집 | `/channel-recruitments` |
| `sales-org-evaluation-incentive.html` | 영업조직 평가 | `/sales-org-evaluations` |
| `training-plan-management.html` | 교육 계획 | `/education-plans` |
| `insurance-product-portal.html` | 보험상품 포털 | `/insurance-products` |
| `customer-support-inquiry.html` | 문의 | `/inquiries` |

---

## 변환 작업 규칙

### HTML → React 변환 시 따를 것

1. HTML 파일의 디자인/레이아웃을 그대로 재현한다
2. `src/pages/{도메인명}/{PageName}.jsx` + `{PageName}.module.css` 로 분리
3. Layout 컴포넌트(`src/components/layout/Layout.jsx`)로 감싼다
4. API 호출은 `src/api/{도메인}.js`에 분리해서 작성
5. CSS는 반드시 CSS Modules 사용 (tailwind X, inline style X)
6. 변환 후 `src/App.jsx` 라우팅 추가
7. 변환 후 `src/components/layout/Sidebar.jsx` 메뉴 항목 업데이트

### 기존 pages 중 교체 대상
`src/pages/` 안의 모든 기존 파일은 새 디자인으로 교체한다.
교체 시 API 연동 로직(`src/api/` 파일)은 그대로 재활용한다.

---

## 디자인 시스템 (guidelines.txt)

- **Primary color**: Emerald Green `#10b981`
- **Background**: `#f7f9fb`
- **Surface (카드/패널)**: `#ffffff`
- **Font**: Inter
- **Layout**: TopNavBar + 접이식 SideNavBar(좌측 고정, 접기/펼치기) + 메인 콘텐츠
- **아이콘**: 3D 클레이 스타일 이모지
- **StatusBadge**: 원형 모서리, 부드러운 색상

---

## API 클라이언트

`src/api/client.js` — axios 인스턴스, `withCredentials: true`, 401 시 `/login` 리다이렉트

---

## 백엔드 API 주요 엔드포인트

### 현재 연동 가능한 API

```
# 계약
GET  /api/contracts?type=&page=&size=
GET  /api/contracts/{contractNo}

# 청구
GET  /api/claims?page=&size=

# 영업
GET  /api/sales-activity-managements?startDate=&endDate=&channelType=&page=&size=
GET  /api/channel-screenings
POST /api/channel-screenings/{screeningNo}/approve
POST /api/channel-screenings/{screeningNo}/reject
GET  /api/sales-org-evaluations?startDate=&endDate=&channelType=&page=&size=

# 교육
GET  /api/education-plans?status=

# 문의
GET  /api/inquiries?customerName=&status=
POST /api/inquiries/{inquiryNo}/answer

# 상담/인수심사
GET  /api/consultations
GET  /api/underwriting/pending
POST /api/underwriting
GET  /api/insurance-products

# 면담
GET  /api/interview-schedules
POST /api/interview-schedules

# 사고/출동
GET  /api/accidents
POST /api/accidents
GET  /api/dispatches
POST /api/dispatches/{dispatchNo}/record

# 영업 채널 모집
GET  /api/channel-recruitments
POST /api/channel-recruitments

# 인증
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### 알려진 API 이슈 (백엔드 작업 예정)

- 고객 검색 API 없음 (`GET /api/customers?keyword=` 추가 예정) → 임시로 ID 직접 입력
- enum 옵션 API 없음 → 현재는 프론트 하드코딩
- 일부 목록이 배열 전체 반환 (페이지네이션 없음) → 추후 통일 예정

---

## 목록 응답 형태 (두 가지 혼재)

**페이지 객체** (계약, 영업활동, 영업조직 평가 등):
```json
{ "items": [...], "total": 100, "page": 0, "size": 15 }
```

**배열 직반환** (상담, 면담, 채널 심사 등):
```json
[...]
```

두 형태 모두 처리하는 패턴 사용:
```js
const items = data?.items ?? data?.content ?? [];
const total = data?.total ?? data?.totalElements ?? 0;
```

---

## 사이드바 메뉴 구조

`src/components/layout/Sidebar.jsx`에 정의.
새 페이지 추가 시 여기에도 메뉴 항목 추가.
`disabled: true`이면 링크 비활성화 표시.

---

## 배포 구조

- **BE**: GitHub Actions → Docker Hub → EC2 Docker Compose
- **EC2**: Amazon Linux, `/home/ec2-user`
- **BE 접근**: `http://3.19.29.29:8080`
- **FE**: Vite 빌드 (`npm run build`), `dist/` 폴더 생성

---

## 자주 하는 작업

```bash
# 개발 서버 실행
npm run dev

# 빌드
npm run build

# HTML → React 변환 순서
# 1. src/aiDesign/{파일}.html 디자인 확인
# 2. src/api/{domain}.js 작성 (기존 있으면 재활용)
# 3. src/pages/{domain}/{PageName}.jsx + .module.css 작성
# 4. src/App.jsx에 Route 추가
# 5. src/components/layout/Sidebar.jsx 메뉴 업데이트
```