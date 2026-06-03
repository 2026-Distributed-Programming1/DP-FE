import client from './client';

export function fetchChannelRecruitments({ page = 1, size = 20 } = {}) {
  return client.get('/api/channel-recruitments', { params: { page, size } }).then((r) => r.data);
}

export function createChannelRecruitment(data) {
  return client.post('/api/channel-recruitments', data).then((r) => r.data);
}
