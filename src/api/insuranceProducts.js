import client from './client';

export function fetchInsuranceProducts() {
  return client.get('/api/insurance-products').then((r) => r.data);
}