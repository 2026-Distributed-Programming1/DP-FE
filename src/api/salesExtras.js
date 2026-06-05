import client from './client';

// 활동 계획
export function fetchActivityPlans({ page = 1, size = 20 } = {}) {
  return client.get('/api/activity-plans', { params: { page, size } }).then((r) => r.data);
}

export function createActivityPlan(data) {
  return client.post('/api/activity-plans', data).then((r) => r.data);
}

// 고객 등록
export function fetchCustomerRegistrations({ page = 1, size = 20 } = {}) {
  return client.get('/api/customer-registrations', { params: { page, size } }).then((r) => r.data);
}

export function createCustomerRegistration(data) {
  return client.post('/api/customer-registrations', data).then((r) => r.data);
}

// 청약 목록
export function fetchPolicyApplications({ page = 1, size = 20 } = {}) {
  return client.get('/api/policy-applications', { params: { page, size } }).then((r) => r.data);
}

export function fetchInsuranceApplications({ page = 1, size = 20 } = {}) {
  return client.get('/api/insurance-applications', { params: { page, size } }).then((r) => r.data);
}

export function fetchRevivals({ page = 1, size = 20 } = {}) {
  return client.get('/api/revivals', { params: { page, size } }).then((r) => r.data);
}
