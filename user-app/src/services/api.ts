import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Production backend deployed on Render
const getBaseUrl = () => {
  return 'https://civic-setu.onrender.com/api';
};

export const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request/response interceptors here for handling Auth tokens
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('user_jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token for API request', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);