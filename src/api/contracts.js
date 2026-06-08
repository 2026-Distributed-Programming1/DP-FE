import client from './client';

<<<<<<< Updated upstream
export const CONTRACT_STATUS = {
  NORMAL:    { label: '정상',   cls: 'bg-primary-container/20 text-primary' },
  EXPIRED:   { label: '만기',   cls: 'bg-surface-container text-outline' },
  CANCELLED: { label: '해지',   cls: 'bg-error-container text-on-error-container' },
  LAPSED:    { label: '실효',   cls: 'bg-error-container/50 text-error' },
};

export function fetchContracts({ type = '', page = 1, size = 20 } = {}) {
=======
<<<<<<< Updated upstream
export function fetchContracts({ type = '', page = 0, size = 15 } = {}) {
>>>>>>> Stashed changes
  return client.get('/api/contracts', { params: { type, page, size } }).then((r) => r.data);
=======
export const CONTRACT_STATUS = {
  NORMAL:    { label: '정상',   cls: 'bg-primary-container/20 text-primary' },
  EXPIRED:   { label: '만기',   cls: 'bg-surface-container text-outline' },
  CANCELLED: { label: '해지',   cls: 'bg-error-container text-on-error-container' },
  LAPSED:    { label: '실효',   cls: 'bg-error-container/50 text-error' },
};

export function fetchContracts({ type = '', page = 1, size = 20 } = {}) {
  return client.get('/api/subscribed-insurances', { params: { type, page, size } }).then((r) => r.data);
>>>>>>> Stashed changes
}

export function fetchContract(contractNo) {
  return client.get(`/api/subscribed-insurances/${contractNo}`).then((r) => r.data);
}

export function cancelContract(contractNo, data) {
  return client.post(`/api/contracts/${contractNo}/cancellation`, data).then((r) => r.data);
}
