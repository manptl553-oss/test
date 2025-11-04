import axios from 'axios';
import type { ApiConfig } from './types';

export function makeClient(cfg: ApiConfig) {
  const instance = axios.create({ baseURL: cfg.baseURL });
  instance.interceptors.request.use(async (req) => {
    const token = cfg.getAuthToken ? await cfg.getAuthToken() : undefined;
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
  });
  instance.interceptors.response.use(r => r, (e) => { cfg.onError?.(e); return Promise.reject(e); });
  return instance;
}
