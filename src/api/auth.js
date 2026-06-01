import client from './client';

export const login = (username, password) =>
  client.post('/api/auth/login', { username, password }).then((res) => res.data.user);
