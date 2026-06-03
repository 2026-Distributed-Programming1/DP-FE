import client from './client';

export function fetchInterviewRecords({ page = 1, size = 20 } = {}) {
  return client.get('/api/interview-records', { params: { page, size } }).then((r) => r.data);
}

export function createInterviewRecord(data) {
  return client.post('/api/interview-records', data).then((r) => r.data);
}

export function updateInterviewRecord(recordNo, data) {
  return client.put(`/api/interview-records/${recordNo}`, data).then((r) => r.data);
}
