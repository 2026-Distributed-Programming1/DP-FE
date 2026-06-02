# feat/sales 브랜치 구현 현황

> 기준: `WebsiteConceptGapReview.md` Phase 1 (내부 직원용 MVP — 영업 도메인)
> 브랜치: `feat/sales`

## 구현 완료

### 1. 채널 심사 (`323c1ee`)

| 항목 | 내용 |
|------|------|
| 페이지 | `src/pages/channelScreenings/ChannelScreeningListPage.jsx` |
| API | `src/api/channelScreenings.js` |
| 라우트 | `/channel-screenings` |
| 사이드바 | 영업 > 채널 심사 |

- `GET /api/channel-screenings` 연동
- 지원일 기간 / 채널유형(AGENT·AGENCY) / 심사상태 필터 — 서버 필터 미지원으로 클라이언트 필터링
- 행 클릭 → 우측 상세 패널 (지원자명, 채널유형, 경력, 자격증, 심사상태)
- PENDING 상태일 때 승인/거절 버튼 노출
  - 승인: 확인 팝업 → `POST /api/channel-screenings/{screeningNo}/approve` → 승인 완료 결과 팝업
  - 거절: 사유 입력 팝업 → `POST /api/channel-screenings/{screeningNo}/reject`

### 2. 영업조직 평가 (`e80b082`)

| 항목 | 내용 |
|------|------|
| 페이지 | `src/pages/salesOrgEvaluations/SalesOrgEvaluationListPage.jsx` |
| 상세 패널 | `src/pages/salesOrgEvaluations/SalesOrgEvaluationDetailPanel.jsx` |
| API | `src/api/salesOrgEvaluations.js` |
| 라우트 | `/sales-org-evaluations` |
| 사이드바 | 영업 > 영업조직 평가 |

- `GET /api/sales-org-evaluations?startDate&endDate&channelType&page&size` 연동
- 기간 / 채널유형(DIRECT·AGENCY·BROKER·ONLINE·BANCASSURANCE) 필터 + 페이지네이션
- 행 클릭 → 우측 상세 패널 (evaluationNo, channelType, channelName, evaluationGrade, 기간, 등록일)
- 성과급 요청 버튼은 **Phase 2 예정**으로 비활성화

## 미구현 (Phase 2 예정)

- 채널 심사 승인/거절 이후 workflow는 이미 구현됨 (Phase 2 항목이지만 채널 심사에 포함)
- 영업조직 평가 → 성과급 요청 (`POST /api/bonus-requests`) 연결
  - FE-SALES-01: 성과급 요청 목록/상세 조회 API 없음 (백엔드 보완 필요)
  - FE-SALES-03: 성과급 요청 시 evaluationNo + channelName/channelType/evaluationGrade/baseSalary 중복 전송 필요

## 참고 문서

- `WebsiteConceptGapReview.md` — Phase 분류 및 전체 구현 우선순위
- `FrontendIntegrationReview.md` — API 연동 세부 이슈 (FE-SALES-*)