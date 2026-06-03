import client from './client';

export function fetchSalesActivities({ startDate = '', endDate = '', channelType = '', page = 0, size = 15 } = {}) {
  return client
    .get('/api/sales-activity-managements', { params: { startDate, endDate, channelType, page, size } })
    .then((r) => r.data);
}
