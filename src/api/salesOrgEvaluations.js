import client from './client';

export function fetchSalesOrgEvaluations({ startDate = '', endDate = '', channelType = '', page = 0, size = 15 } = {}) {
  return client
    .get('/api/sales-org-evaluations', { params: { startDate, endDate, channelType, page, size } })
    .then((r) => r.data);
}