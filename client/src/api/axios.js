import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Helper to set the Clerk token for requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Request interceptor to handle token if managed globally or simply use helper
// Note: In Clerk + React, we often get the token in the component and pass it.
// However, for a cleaner setup, we can stick to passing it per request or updating this global.
// Given strict strict rules, let's keep it simple: Components will use `api` and we can attach token in the call config
// OR we can export a hook that wraps axios. Let's stick to the raw instance for now but pre-configure base URL.

export default api;
