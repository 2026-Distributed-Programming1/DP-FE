import client from './client';

export function fetchConsultations({ page = 1, size = 20 } = {}) {
  return client.get('/api/consultations', { params: { page, size } }).then((r) => r.data);
}

export function createConsultation(data) {
  return client.post('/api/consultations', data).then((r) => r.data);
}

export function acceptConsultation(consultNo) {
  return client.post(`/api/consultations/${consultNo}/accept`).then((r) => r.data);
}
