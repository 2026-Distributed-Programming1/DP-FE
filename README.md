# DP-FE — 보험 업무 포털 프론트엔드

React + Vite 기반 직원 업무 포털 프론트엔드입니다.  
백엔드(`DP` 서버)와 함께 사용합니다.

## 요구사항

- Node.js 18 이상
- 백엔드 서버 실행 중

## 설치

```bash
npm install
```

## 환경 변수 설정

`.env.example`을 복사해 `.env`를 만든 뒤 환경에 맞게 수정하세요.

```bash
cp .env.example .env
```

| 변수 | 설명 |
|------|------|
| `VITE_API_TARGET` | 백엔드 API 주소 |

**로컬 개발 (localhost Spring 서버)**

```
VITE_API_TARGET=http://localhost:8080
```

**EC2 서버 테스트**

```
VITE_API_TARGET=<BACKEND_API_URL>
```

EC2 서버 주소는 팀에서 공유받은 백엔드 API 주소를 입력하세요.

> `.env`는 gitignore 대상입니다. 팀원 간 설정 공유는 `.env.example`을 사용하세요.

## 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속.  
백엔드 API는 Vite 프록시를 통해 `VITE_API_TARGET`으로 자동 전달됩니다.

## 빌드

```bash
npm run build
```

## 주요 패키지

| 패키지 | 용도 |
|---|---|
| `react`, `react-dom` | UI 프레임워크 |
| `react-router-dom` | 클라이언트 사이드 라우팅 |
| `axios` | HTTP API 호출 |
| `@playwright/test` | E2E 검증 (개발용) |

## 구현된 화면 (Phase 1 MVP)

| 경로 | 화면 |
|---|---|
| `/login` | 로그인 |
| `/contracts` | 계약 목록 / 상세 패널 |
| `/claims` | 청구 목록 |
| `/sales-activities` | 영업활동 관리 |
| `/education-plans` | 교육 계획 목록 / 상세 패널 |
| `/inquiries` | 문의 목록 / 상세 패널 |
