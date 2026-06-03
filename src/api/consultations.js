import client from './client';

export function fetchConsultations() {
  return client.get('/api/consultations').then((r) => r.data);
}

export function createConsultation(data) {
  return client.post('/api/consultations', data).then((r) => r.data);
}