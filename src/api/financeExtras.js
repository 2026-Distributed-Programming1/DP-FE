import client from './client';

// 납부 내역
export function fetchPaymentRecords({ contractNo = '', status = '', page = 1, size = 20 } = {}) {
  return client.get('/api/payment-records', { params: { contractNo, status, page, size } }).then((r) => r.data);
}

export function confirmPaymentRecord(recordNo) {
  return client.post(`/api/payment-records/${recordNo}/confirm`).then((r) => r.data);
}

export function rejectPaymentRecord(recordNo, data) {
  return client.post(`/api/payment-records/${recordNo}/reject`, data).then((r) => r.data);
}

// 환급 산출·지급
export function createRefundCalculation(cancellationNo) {
  return client.post(`/api/cancellations/${cancellationNo}/refund-calculation`).then((r) => r.data);
}

export function fetchRefundCalculations({ page = 1, size = 20 } = {}) {
  return client.get('/api/refund-calculations', { params: { page, size } }).then((r) => r.data);
}

export function confirmRefundCalculation(refundNo) {
  return client.post(`/api/refund-calculations/${refundNo}/confirm`).then((r) => r.data);
}

export function fetchRefundPayments({ page = 1, size = 20 } = {}) {
  return client.get('/api/refund-payments', { params: { page, size } }).then((r) => r.data);
}

export function executeRefundPayment(paymentNo, otpInput) {
  return client.post(`/api/refund-payments/${paymentNo}/execute`, { otpInput }).then((r) => r.data);
}
