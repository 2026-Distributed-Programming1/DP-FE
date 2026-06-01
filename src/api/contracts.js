import client from './client';

export function fetchContracts({ type = '', page = 0, size = 15 } = {}) {
  return client.get('/api/contracts', { params: { type, page, size } }).then((r) => r.data);
}

export function fetchContract(contractNo) {
  return client.get(`/api/contracts/${contractNo}`).then((r) => r.data);
}
