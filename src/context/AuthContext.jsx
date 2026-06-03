import { createContext, useContext, useEffect, useState } from 'react';
import { getMe, login as apiLogin, logout as apiLogout } from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 앱 로드 시 기존 세션 복구
  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const user = await apiLogin(username, password);
    setUser(user);
    return user;
  };

  const logout = async () => {
    await apiLogout().catch(() => {});
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

// role 유틸
export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  ADMIN: 'ADMIN',
  CONTRACT_STAFF: 'CONTRACT_STAFF',
  CLAIM_STAFF: 'CLAIM_STAFF',
  UNDERWRITING_STAFF: 'UNDERWRITING_STAFF',
  SALES_STAFF: 'SALES_STAFF',
  EDUCATION_STAFF: 'EDUCATION_STAFF',
  FINANCE_STAFF: 'FINANCE_STAFF',
  DISPATCH_STAFF: 'DISPATCH_STAFF',
  STAFF: 'STAFF',
};

export const isStaff = (role) => role && role !== ROLES.CUSTOMER;

export const isCustomer = (role) => role === ROLES.CUSTOMER;

// 로그인 후 role에 따른 기본 이동 경로
export const defaultPathForRole = (user) => {
  if (!user) return '/login';
  if (user.passwordChangeRequired) return '/change-password';
  if (isCustomer(user.role)) return '/my/contracts';
  return '/dashboard';
};
