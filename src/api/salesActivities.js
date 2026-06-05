import client from './client';

export const CHANNEL_TYPE_OPTIONS = [
  { value: '', label: '전체 채널' },
  { value: 'DESIGNER', label: '설계사' },
  { value: 'AGENCY', label: '대리점' },
];

export function fetchSalesActivities({ startDate = '', endDate = '', channelType = '', page = 1, size = 20 } = {}) {
  return client
    .get('/api/sales-activity-managements', { params: { startDate, endDate, channelType, page, size } })
    .then((r) => r.data);
}

export function createSalesActivity(data) {
  return client.post('/api/sales-activity-managements', data).then((r) => r.data);
}
