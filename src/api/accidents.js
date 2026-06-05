import client from './client';

export const ACCIDENT_TYPE_LABEL = {
  PROPERTY: '대물사고',
  PERSONAL: '인명사고',
};

export const ACCIDENT_STATUS_LABEL = {
  RECEIVED:     { label: '접수',   cls: 'bg-error-container text-on-error-container' },
  DISPATCHING:  { label: '출동중', cls: 'bg-primary-container/30 text-primary' },
  DISPATCHED:   { label: '현장도착', cls: 'bg-surface-container text-on-surface-variant' },
  CLOSED:       { label: '종결',   cls: 'bg-surface-container text-outline' },
};

export function fetchAccidents({ page = 1, size = 20 } = {}) {
  return client.get('/api/accidents', { params: { page, size } }).then((r) => r.data);
}

export function fetchAccident(accidentNo) {
  return client.get(`/api/accidents/${accidentNo}`).then((r) => r.data);
}

export function createAccident(data) {
  return client.post('/api/accidents', data).then((r) => r.data);
}

export function fetchDispatches({ page = 1, size = 20 } = {}) {
  return client.get('/api/dispatches', { params: { page, size } }).then((r) => r.data);
}

export function fetchDispatchRecord(dispatchNo) {
  return client.get(`/api/dispatches/${dispatchNo}/record`).then((r) => r.data);
}

export function recordDispatch(dispatchNo, formData) {
  return client.post(`/api/dispatches/${dispatchNo}/record`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
}
