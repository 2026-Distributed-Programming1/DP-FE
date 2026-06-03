import client from './client';

export function fetchUnderwritingPending() {
  return client.get('/api/underwriting/pending').then((r) => r.data);
}

export function createUnderwriting(data) {
  return client.post('/api/underwriting', data).then((r) => r.data);
}