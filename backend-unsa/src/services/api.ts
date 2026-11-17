import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Mengarah ke port backend Express.js
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;