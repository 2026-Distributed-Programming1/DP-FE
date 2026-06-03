import client from './client';

export const APPLICATION_TYPE_LABEL = {
  POLICY:    '청약서',
  INSURANCE: '보험신청',
};

export function fetchUnderwritingPending({ page = 1, size = 20 } = {}) {
  return client.get('/api/underwriting/pending', { params: { page, size } }).then((r) => r.data);
}

export function createUnderwriting(data) {
  return client.post('/api/underwriting', data).then((r) => r.data);
}
