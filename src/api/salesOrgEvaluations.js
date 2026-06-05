import client from './client';

export const CHANNEL_TYPE_OPTIONS = [
  { value: '', label: '전체 채널' },
  { value: 'DESIGNER', label: '설계사' },
  { value: 'AGENCY', label: '대리점' },
];

export const EVAL_GRADE_LABEL = { S: 'S등급', A: 'A등급', B: 'B등급', C: 'C등급', D: 'D등급' };
export const EVAL_GRADE_CLS = {
  S: 'bg-primary text-on-primary',
  A: 'bg-primary-container/30 text-primary',
  B: 'bg-secondary-container text-on-secondary-container',
  C: 'bg-error-container/30 text-error',
  D: 'bg-error-container text-on-error-container',
};

export function fetchSalesOrgEvaluations({ startDate = '', endDate = '', channelType = '', page = 1, size = 20 } = {}) {
  return client.get('/api/sales-org-evaluations', { params: { startDate, endDate, channelType, page, size } }).then((r) => r.data);
}

export function createSalesOrgEvaluation(data) {
  return client.post('/api/sales-org-evaluations', data).then((r) => r.data);
}

export function fetchBonusRequests({ page = 1, size = 20 } = {}) {
  return client.get('/api/bonus-requests', { params: { page, size } }).then((r) => r.data);
}

export function createBonusRequest(data) {
  return client.post('/api/bonus-requests', data).then((r) => r.data);
}
