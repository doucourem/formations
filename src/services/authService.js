// services/authService.js
import axios from 'axios';

const API_URL = 'https://example.com/api'; // ⚠️ changez par votre backend

export const login = async (data) => {
  const response = await axios.post(`${API_URL}/login`, data);
  localStorage.setItem('token', response.data.token);
  return response.data;
};


export const register = async (data) => {
  const response = await axios.post(`${API_URL}/register`, data);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const isAuthenticated = () => !!localStorage.getItem('token');
