import axios from 'axios';
import { API_BASE_URL } from './constants';
import { Category, Worker, LeadRequest, Booking } from './types';
import { useAuthStore } from './store/authStore';


const client = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add JWT
client.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export const api = {
  auth: {
    sendOTP: async (phoneE164: string) => {
      const res = await client.post('/v1/auth/otp/send', { phoneE164 });
      return res.data;
    },
    verifyOTP: async (phoneE164: string, code: string, role: string) => {
      const res = await client.post('/v1/auth/otp/verify', { phoneE164, code, role });
      return res.data;
    },
  },
  categories: {
    list: async () => {
      const res = await client.get<{ categories: Category[] }>('/v1/categories');
      return res.data.categories;
    },
  },
  workers: {
    nearby: async (params: { lat: number; lng: number; radiusKm: number; categoryId?: string; onlyOnline?: boolean }) => {
      const res = await client.get<{ workers: Worker[]; radiusKm: number }>('/v1/workers/nearby', { params });
      return res.data.workers;
    },
    getById: async (id: string) => {
      const res = await client.get<{ worker: Worker }>(`/v1/workers/${id}`);
      return res.data.worker;
    },
    updateStatus: async (id: string, isOnline: boolean) => {
      const res = await client.patch(`/v1/workers/${id}/status`, { isOnline });
      return res.data;
    },
  },
  bookings: {
    create: async (data: any) => {
      let body = data;
      let headers = {};

      if (data.imageUri) {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
          if (key !== 'imageUri') {
            formData.append(key, typeof data[key] === 'object' ? JSON.stringify(data[key]) : data[key]);
          }
        });

        const uri = data.imageUri;
        const name = uri.split('/').pop() || 'photo.jpg';
        const type = `image/${name.split('.').pop() || 'jpeg'}`;

        formData.append('image', {
          uri,
          name,
          type,
        } as any);

        body = formData;
        headers = { 'Content-Type': 'multipart/form-data' };
      }

      const res = await client.post<{ booking: Booking }>('/v1/bookings', body, { headers });
      return res.data.booking;
    },
    getById: async (id: string) => {
      const res = await client.get<{ booking: Booking }>(`/v1/bookings/${id}`);
      return res.data.booking;
    },
    updateStatus: async (id: string, status: string) => {
      const res = await client.patch(`/v1/bookings/${id}/status`, { status });
      return res.data.booking;
    },
    getUserBookings: async (userId: string) => {
      const res = await client.get<{ bookings: Booking[] }>(`/v1/bookings/user/${userId}`);
      return res.data.bookings;
    },
  },
  leads: {
    create: async (params: { categoryId: string; requirement: string; lat: number; lng: number }) => {
      const res = await client.post<{ lead: LeadRequest }>('/v1/leads', params);
      return res.data.lead;
    },
  }
};

export { Category, Worker } from './types';
export const fetchCategories = api.categories.list;
export const fetchNearbyWorkers = api.workers.nearby;
export const createLead = api.leads.create;

