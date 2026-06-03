import client from './client';

export function fetchAccidents() {
  return client.get('/api/accidents').then((r) => r.data);
}

export function createAccident(data) {
  return client.post('/api/accidents', data).then((r) => r.data);
}

export function fetchDispatches() {
  return client.get('/api/dispatches').then((r) => r.data);
}

export function recordDispatch(dispatchNo, data) {
  return client.post(`/api/dispatches/${dispatchNo}/record`, data).then((r) => r.data);
}