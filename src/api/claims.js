import client from './client';

export const CLAIM_STATUS_LABEL = {
  RECEIVED:     { label: '접수',     cls: 'bg-error-container/30 text-error' },
  INVESTIGATED: { label: '조사완료', cls: 'bg-primary-container/20 text-primary' },
  CALCULATED:   { label: '산출완료', cls: 'bg-secondary-container text-on-secondary-container' },
  APPROVED:     { label: '승인',     cls: 'bg-primary-container/20 text-primary' },
  PAID:         { label: '지급완료', cls: 'bg-surface-container text-outline' },
  CLOSED:       { label: '종결',     cls: 'bg-surface-container text-outline' },
};

export const CLAIM_TYPE_LABEL = { DISEASE: '질병', ACCIDENT: '재해' };

export function fetchClaims({ page = 1, size = 20 } = {}) {
  return client.get('/api/claims', { params: { page, size } }).then((r) => r.data);
}

export function fetchClaim(claimNo) {
  return client.get(`/api/claims/${claimNo}`).then((r) => r.data);
}

export function submitClaimRequest(payload) {
  return client.post('/api/claims', payload).then((r) => r.data);
}
