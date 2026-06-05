import client from './client';

// 조사 등록
export function createInvestigation(claimNo, data) {
  return client.post(`/api/claims/${claimNo}/investigation`, data).then((r) => r.data);
}
export function fetchInvestigation(claimNo) {
  return client.get(`/api/claims/${claimNo}/investigation`).then((r) => r.data);
}

// 보험금 산출
export function createCalculation(investigationNo) {
  return client.post(`/api/investigations/${investigationNo}/calculation`).then((r) => r.data);
}
export function fetchCalculation(investigationNo) {
  return client.get(`/api/investigations/${investigationNo}/calculation`).then((r) => r.data);
}

// 산출 승인
export function approveCalculation(calculationNo) {
  return client.post(`/api/calculations/${calculationNo}/approve`).then((r) => r.data);
}

// 지급 생성
export function createClaimPayment(calculationNo, data) {
  return client.post(`/api/calculations/${calculationNo}/payment`, data).then((r) => r.data);
}
export function fetchClaimPayment(calculationNo) {
  return client.get(`/api/calculations/${calculationNo}/payment`).then((r) => r.data);
}

// 지급 실행
export function executeClaimPayment(paymentNo, otp) {
  return client.post(`/api/payments/${paymentNo}/execute`, { otp }).then((r) => r.data);
}
