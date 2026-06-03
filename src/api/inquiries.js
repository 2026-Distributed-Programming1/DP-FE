import client from './client';

export function fetchInquiries({ customerName = '', status = '' } = {}) {
  return client.get('/api/inquiries', { params: { customerName, status } }).then((r) => r.data);
}

export function fetchInquiry(inquiryNo) {
  return client.get(`/api/inquiries/${inquiryNo}`).then((r) => r.data);
}
