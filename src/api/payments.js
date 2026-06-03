import client from './client';

export function fetchCustomerContracts(customerId) {
  return client.get(`/api/customers/${customerId}/contracts`).then((r) => r.data);
}

export function previewPayment(items) {
  return client.post('/api/payments/preview', { items }).then((r) => r.data);
}

export function submitPayment(data) {
  return client.post('/api/payments', data).then((r) => r.data);
}
