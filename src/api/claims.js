import client from './client';

export function fetchClaims() {
  return client.get('/api/claims').then((r) => r.data);
}

export function fetchClaim(claimNo) {
  return client.get(`/api/claims/${claimNo}`).then((r) => r.data);
}
