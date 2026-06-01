# DP-FE — 보험 업무 포털 프론트엔드

React + Vite 기반 직원 업무 포털 프론트엔드입니다.  
백엔드(`DP` 서버)와 함께 사용합니다.

## 요구사항

- Node.js 18 이상
- 백엔드 서버 실행 중 (`localhost:8080`)

## 설치

```bash
npm install
```

## 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속.  
백엔드 API는 Vite 프록시를 통해 자동으로 `localhost:8080`으로 전달됩니다.

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

## 프록시 설정

`vite.config.js`에 `/api` 경로를 `localhost:8080`으로 프록시하도록 설정되어 있습니다.  
별도의 CORS 설정 없이 백엔드와 통신할 수 있습니다.

```js
server: {
  proxy: {
    '/api': { target: 'http://localhost:8080', changeOrigin: true }
  }
}
```

백엔드 주소가 다를 경우 `vite.config.js`의 `target` 값을 변경하세요.

## 구현된 화면 (Phase 1 MVP)

| 경로 | 화면 |
|---|---|
| `/contracts` | 계약 목록 / 상세 패널 |
| `/claims` | 청구 목록 |
| `/sales-activities` | 영업활동 관리 |
| `/education-plans` | 교육 계획 목록 / 상세 패널 |
| `/inquiries` | 문의 목록 / 상세 패널 |
