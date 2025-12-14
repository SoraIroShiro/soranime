// Client-side auth utilities
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('adminToken');
  return !!token;
};

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminToken');
};

export const logout = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('adminToken');
  window.location.href = '/admin/login';
};
