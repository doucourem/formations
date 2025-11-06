import api from './api';

// --- CLIENT ---
export const getClients = async () => {
  const res = await api.get('/clients');
  return res.data;
};

export const getClientById = async (id) => {
  const res = await api.get(`/clients/${id}`);
  return res.data;
};

export const updateClient = async (id, payload) => {
  const res = await api.patch(`/clients/${id}`, payload);
  return res.data;
};

// --- PAYMENT ---
export const createPayment = async (payload) => {
  const res = await api.post('/payments', payload);
  return res.data;
};

export const getPayments = async (clientId) => {
  const res = await api.get(`/clients/${clientId}/payments`);
  return res.data;
};

// --- TRANSACTION ---
export const createTransaction = async (payload) => {
  const res = await api.post('/transactions', payload);
  return res.data;
};

export const getTransactions = async (clientId) => {
  const res = await api.get(`/clients/${clientId}/transactions`);
  return res.data;
};

// --- AUTH ---
export const login = async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  return res.data;
};

export const register = async (payload) => {
  const res = await api.post('/auth/register', payload);
  return res.data;
};
