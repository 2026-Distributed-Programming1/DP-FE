import client from './client';

export function fetchEducationPlans({ status = '' } = {}) {
  return client.get('/api/education-plans', { params: { status } }).then((r) => r.data);
}

export function fetchEducationPlan(planNo) {
  return client.get(`/api/education-plans/${planNo}`).then((r) => r.data);
}
