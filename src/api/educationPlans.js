import client from './client';

export const PLAN_STATUS_LABEL = {
  TEMP_SAVE:    { label: '임시저장',   cls: 'bg-surface-container text-outline' },
  UNDER_REVIEW: { label: '승인요청',   cls: 'bg-error-container/30 text-error' },
  APPROVED:     { label: '승인',       cls: 'bg-primary-container/20 text-primary' },
  REJECTED:     { label: '반려',       cls: 'bg-error-container text-on-error-container' },
};

export function fetchEducationPlans({ status = '', page = 1, size = 20 } = {}) {
  return client.get('/api/education-plans', { params: { status, page, size } }).then((r) => r.data);
}

export function fetchEducationPlan(planNo) {
  return client.get(`/api/education-plans/${planNo}`).then((r) => r.data);
}

export function createEducationPlan(data) {
  return client.post('/api/education-plans', data).then((r) => r.data);
}

export function approveEducationPlan(planNo) {
  return client.post(`/api/education-plans/${planNo}/approve`).then((r) => r.data);
}

export function rejectEducationPlan(planNo, reason) {
  return client.post(`/api/education-plans/${planNo}/reject`, { reason }).then((r) => r.data);
}
