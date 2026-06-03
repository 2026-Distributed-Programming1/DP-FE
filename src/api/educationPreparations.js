import client from './client';

export function fetchEducationPreparations({ planNo = '', page = 1, size = 20 } = {}) {
  return client.get('/api/education-preparations', { params: { planNo, page, size } }).then((r) => r.data);
}

export function createEducationPreparation(data) {
  return client.post('/api/education-preparations', data).then((r) => r.data);
}

export function fetchEducationExecutions({ prepNo = '', page = 1, size = 20 } = {}) {
  return client.get('/api/education-executions', { params: { prepNo, page, size } }).then((r) => r.data);
}

export function createEducationExecution(data) {
  return client.post('/api/education-executions', data).then((r) => r.data);
}
