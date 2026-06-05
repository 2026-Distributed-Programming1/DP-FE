import client from './client';

export const getMe = () =>
  client.get('/api/auth/me').then((res) => res.data);

export const login = (username, password) =>
  client.post('/api/auth/login', { username, password }).then((res) => res.data.user);

export const logout = () =>
  client.post('/api/auth/logout').then((res) => res.data);

export const signup = (form) =>
  client.post('/api/auth/signup/customer', form).then((res) => res.data);

export const changePassword = (currentPassword, newPassword) =>
  client.post('/api/auth/password', { currentPassword, newPassword }).then((res) => res.data);
