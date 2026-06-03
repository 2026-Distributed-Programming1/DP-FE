# DP-FE - 보험 업무 포털 프론트엔드

React + Vite 기반 보험 업무 포털 프론트엔드입니다. 백엔드 `DP` 서버의 API를 Vite 프록시(`/api`)를 통해 호출합니다.

## 요구사항

- Node.js 18 이상
- npm
- 백엔드 서버 실행 또는 접근 가능한 백엔드 API 주소

## 설치

```bash
npm install
```

## 환경 변수

`.env.example`을 복사해 `.env`를 만든 뒤 백엔드 API 주소를 설정합니다.

```bash
cp .env.example .env
```

| 변수 | 설명 | 예시 |
|---|---|---|
| `VITE_API_TARGET` | Vite 개발 서버가 `/api` 요청을 프록시할 백엔드 주소 | `http://localhost:8080` |

로컬 Spring 서버를 사용할 때:

```env
VITE_API_TARGET=http://localhost:8080
```

EC2 등 원격 백엔드를 사용할 때:

```env
VITE_API_TARGET=<BACKEND_API_URL>
```

`.env`는 gitignore 대상입니다. 팀 공용 기본값은 `.env.example`에서 관리합니다.

## 실행

개발 서버 실행:

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속합니다.

프로덕션 빌드:

```bash
npm run build
```

빌드 결과 미리보기:

```bash
npm run preview
```

린트:

```bash
npm run lint
```

## 구현된 화면

| 경로 | 화면 |
|---|---|
| `/login` | 로그인 |
| `/contracts` | 계약 조회 |
| `/claims` | 청구 목록 |
| `/accidents` | 사고 접수 및 현장 출동 관리 |
| `/claim-payments` | 보험금 산정 및 지급 |
| `/consultations` | 상담 예약 신청 |
| `/underwriting` | 인수심사 대기열 |
| `/underwriting-dashboard` | 인수심사 대시보드 |
| `/interview-schedules` | 면담 일정 관리 |
| `/sales-activities` | 영업활동 관리 |
| `/channel-screenings` | 채널 심사 |
| `/channel-recruitments` | 채널 모집 |
| `/sales-org-evaluations` | 영업조직 평가 |
| `/education-plans` | 교육 계획 |
| `/insurance-products` | 보험상품 포털 |
| `/inquiries` | 문의 목록 |

## 주요 디렉터리 구조

```text
src/
  api/                  백엔드 API 호출 모듈과 axios 클라이언트
  components/layout/    공통 레이아웃, 헤더, 사이드바
  pages/                라우트 단위 화면 컴포넌트와 CSS module
```

### `src/api`

도메인별 API 함수를 관리합니다. `src/api/client.js`의 axios 인스턴스를 기준으로 `/api` 경로에 요청하며, 개발 환경에서는 `vite.config.js`의 프록시 설정에 따라 `VITE_API_TARGET`으로 전달됩니다.

### `src/pages`

업무 화면별 React 컴포넌트와 CSS module이 위치합니다. 각 화면은 `src/App.jsx`에서 라우트로 연결되고, 대부분 `Layout` 컴포넌트를 통해 공통 사이드바와 헤더를 사용합니다.

### `src/components/layout`

포털 공통 UI 골격입니다.

- `Layout.jsx`: 사이드바, 헤더, 본문 영역을 조합합니다.
- `Sidebar.jsx`: 업무 메뉴와 라우트 링크를 정의합니다.
- `Header.jsx`: 현재 화면 제목과 사용자 영역을 표시합니다.

## 라우팅과 메뉴

라우팅은 `react-router-dom`의 `BrowserRouter`, `Routes`, `Route`로 구성되어 있습니다. 로그인 이후 접근 가능한 업무 화면은 `PrivateRoute`로 보호됩니다. 새 화면을 추가할 때는 다음 두 곳을 함께 수정해야 합니다.

- `src/App.jsx`: 페이지 컴포넌트 import 및 route 추가
- `src/components/layout/Sidebar.jsx`: 사이드바 메뉴 링크 추가 또는 disabled 해제

## 주요 패키지

| 패키지 | 용도 |
|---|---|
| `react`, `react-dom` | UI 프레임워크 |
| `react-router-dom` | 클라이언트 사이드 라우팅 |
| `axios` | HTTP API 호출 |
| `vite`, `@vitejs/plugin-react` | 개발 서버와 빌드 |
| `eslint` | 정적 검사 |
| `@playwright/test`, `playwright` | E2E 검증 도구 |
