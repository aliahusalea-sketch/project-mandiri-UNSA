import axios from 'axios';

// Gunakan URL dari .env (VITE_API_URL) dan hilangkan trailing slash.
// Fallback ke backend lokal apabila .env belum diisi.
const rawBaseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export const API_BASE_URL = rawBaseURL.replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

export default api;

// ==================== MAHASISWA ====================
export const getMahasiswa = () => api.get('/mahasiswa');
export const getStatistikMahasiswa = () => api.get('/mahasiswa/statistik');
export const getProgramStudi = () => api.get('/mahasiswa/prodi');
export const createMahasiswa = (data) => api.post('/mahasiswa', data);
export const updateMahasiswa = (id, data) => api.put(`/mahasiswa/${id}`, data);
export const deleteMahasiswa = (id) => api.delete(`/mahasiswa/${id}`);

// ==================== AUTH ====================
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const registerUser = (data) => api.post('/auth/register', data);

// ==================== HEALTH CHECK ====================
export const getHealth = () => api.get('/health');
