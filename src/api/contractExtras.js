import client from './client';

// 만기 임박 계약
export function fetchExpiringContracts({ page = 1, size = 20 } = {}) {
  return client.get('/api/expiring-contracts', { params: { page, size } }).then((r) => r.data);
}

export function createExpiringNotice(contractNo, data) {
  return client.post(`/api/expiring-contracts/${contractNo}/notice`, data).then((r) => r.data);
}

export function fetchExpiringNotices({ contractNo = '', page = 1, size = 20 } = {}) {
  return client.get('/api/expiring-notices', { params: { contractNo, page, size } }).then((r) => r.data);
}

// 계약 통계
export function fetchContractStatistics() {
  return client.get('/api/contract-statistics').then((r) => r.data);
}

export function createContractStatisticsSnapshot() {
  return client.post('/api/contract-statistics').then((r) => r.data);
}

export function fetchContractStatisticsHistory({ page = 1, size = 20 } = {}) {
  return client.get('/api/contract-statistics/history', { params: { page, size } }).then((r) => r.data);
}

// 해지 관리
export function fetchCancellations({ page = 1, size = 20 } = {}) {
  return client.get('/api/cancellations', { params: { page, size } }).then((r) => r.data);
}
