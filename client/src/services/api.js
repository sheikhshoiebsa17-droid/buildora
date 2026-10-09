import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true,
  timeout: 20000,
});

api.interceptors.request.use((reqConfig) => {
  const token = localStorage.getItem('buildora_token');
  if (token && !reqConfig.headers.Authorization) {
    reqConfig.headers.Authorization = `Bearer ${token}`;
  }
  return reqConfig;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.message ||
      'Something went wrong. Please try again.';
    const status = err.response?.status;
    if (status === 401 && !String(window.location.pathname).startsWith('/login')) {
      window.dispatchEvent(new CustomEvent('buildora:unauthorized'));
    }
    return Promise.reject(Object.assign(err, { friendlyMessage: message, status }));
  }
);

export const errMsg = (e) => e?.friendlyMessage || e?.message || 'Unexpected error';
