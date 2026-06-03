import client from './client';

export function fetchInterviewSchedules() {
  return client.get('/api/interview-schedules').then((r) => r.data);
}

export function createInterviewSchedule(data) {
  return client.post('/api/interview-schedules', data).then((r) => r.data);
}