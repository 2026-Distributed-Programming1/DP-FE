import client from './client';

export function fetchChannelScreenings() {
  return client.get('/api/channel-screenings').then((r) => r.data);
}

export function approveChannelScreening(screeningNo) {
  return client.post(`/api/channel-screenings/${screeningNo}/approve`).then((r) => r.data);
}

export function rejectChannelScreening(screeningNo, rejectReason) {
  return client.post(`/api/channel-screenings/${screeningNo}/reject`, { rejectReason }).then((r) => r.data);
}