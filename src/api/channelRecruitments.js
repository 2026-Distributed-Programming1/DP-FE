import client from './client';

export function fetchChannelRecruitments() {
  return client.get('/api/channel-recruitments').then((r) => r.data);
}

export function createChannelRecruitment(data) {
  return client.post('/api/channel-recruitments', data).then((r) => r.data);
}