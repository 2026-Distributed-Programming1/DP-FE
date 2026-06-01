import client from './client';

export function fetchExpiringContracts() {
  return client.get('/api/expiring-contracts').then((r) => r.data);
}

export function sendExpiringNotice(contractNo, payload) {
  return client
    .post(`/api/expiring-contracts/${contractNo}/notice`, payload)
    .then((r) => r.data);
}

export function fetchExpiringNotices(contractNo) {
  return client
    .get('/api/expiring-notices', { params: { contractNo } })
    .then((r) => r.data);
}

export function recordNoticeResponse(noticeNo, payload) {
  return client
    .post(`/api/expiring-notices/${noticeNo}/response`, payload)
    .then((r) => r.data);
}