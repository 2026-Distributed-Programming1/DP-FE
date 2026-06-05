import client from './client';

export const INQUIRY_TYPE_LABEL = {
  INSURANCE:        '보험료',
  CLAIM:            '보험금',
  CONTRACT_CHANGE:  '계약변경',
  CANCELLATION:     '해지',
  OTHER:            '기타',
};

export const INQUIRY_STATUS_LABEL = {
  PENDING:  '답변대기',
  ANSWERED: '답변완료',
};

export function fetchInquiries({ customerName = '', status = '', page = 1, size = 20 } = {}) {
  return client
    .get('/api/inquiries', { params: { customerName, status, page, size } })
    .then((r) => r.data);
}

export function fetchInquiry(inquiryNo) {
  return client.get(`/api/inquiries/${inquiryNo}`).then((r) => r.data);
}

export function createInquiry(data) {
  return client.post('/api/inquiries', data).then((r) => r.data);
}

export function answerInquiry(inquiryNo, answerContent) {
  return client
    .post(`/api/inquiries/${inquiryNo}/answer`, { answerContent })
    .then((r) => r.data);
}
