import client from './client';

export function fetchClaims() {
  return client.get('/api/claims').then((r) => r.data);
}

export function fetchClaim(claimNo) {
  return client.get(`/api/claims/${claimNo}`).then((r) => r.data);
}

export function submitClaimRequest(payload) {
  return client.post('/api/claims', payload).then((r) => r.data);
}
