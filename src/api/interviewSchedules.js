import client from './client';

export function fetchInterviewSchedules({ page = 1, size = 20 } = {}) {
  return client.get('/api/interview-schedules', { params: { page, size } }).then((r) => r.data);
}

export function createInterviewSchedule(data) {
  return client.post('/api/interview-schedules', data).then((r) => r.data);
}

export function updateInterviewSchedule(scheduleNo, data) {
  return client.put(`/api/interview-schedules/${scheduleNo}`, data).then((r) => r.data);
}

export function cancelInterviewSchedule(scheduleNo) {
  return client.post(`/api/interview-schedules/${scheduleNo}/cancel`).then((r) => r.data);
}
