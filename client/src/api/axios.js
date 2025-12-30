import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// A placeholder for the token retrieval function
let getTokenRef = null;

export const injectTokenGetter = (getter) => {
  getTokenRef = getter;
};

api.interceptors.request.use(async (config) => {
  if (getTokenRef) {
    try {
      const token = await getTokenRef();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Failed to get auth token", error);
    }
  }
  return config;
});

export default api;
