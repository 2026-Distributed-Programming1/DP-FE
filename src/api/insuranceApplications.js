import client from './client';

export function createInsuranceApplication(data) {
  return client.post('/api/insurance-applications', data).then((r) => r.data);
}

export function createRevival(data) {
  return client.post('/api/revivals', data).then((r) => r.data);
}
