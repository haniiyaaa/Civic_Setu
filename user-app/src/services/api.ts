import axios from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

// Assuming the expo host machine is at 192.168.0.110 and backend port is 5000
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://192.168.0.110:5000/api'; 
  }
  return 'http://192.168.0.110:5000/api';
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
