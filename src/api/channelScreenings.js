import client from './client';

export const SCREENING_STATUS_LABEL = {
  PENDING:  { label: '대기',   cls: 'bg-error-container/30 text-error' },
  APPROVED: { label: '승인',   cls: 'bg-primary-container/20 text-primary' },
  REJECTED: { label: '거절',   cls: 'bg-surface-container text-outline' },
};

export function fetchChannelScreenings({ page = 1, size = 20 } = {}) {
  return client.get('/api/channel-screenings', { params: { page, size } }).then((r) => r.data);
}

export function approveChannelScreening(screeningNo) {
  return client.post(`/api/channel-screenings/${screeningNo}/approve`).then((r) => r.data);
}

export function rejectChannelScreening(screeningNo, rejectionReason) {
  return client.post(`/api/channel-screenings/${screeningNo}/reject`, { rejectionReason }).then((r) => r.data);
}
