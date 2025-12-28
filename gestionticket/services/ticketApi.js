import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⚠️ Change l'URL selon ton serveur Laravel
const API_URL = "http://127.0.0.1:8000/api";

// Création d'une instance axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ================== AUTH ==================

// Mettre le token dans les headers pour toutes les requêtes
export const setAuthToken = async (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    await AsyncStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    await AsyncStorage.removeItem("token");
  }
};

// Récupérer le token stocké et le mettre dans axios
export const loadToken = async () => {
  const token = await AsyncStorage.getItem("token");
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  return token;
};

// ================== TICKETS ==================

export const fetchTickets = async (page = 1) => {
  await loadToken();
  return api.get(`/tickets?page=${page}`);
};

export const fetchTicket = async (id) => {
  await loadToken();
  return api.get(`/tickets/${id}`);
};

export const createTicket = async (data) => {
  await loadToken();
  return api.post(`/tickets`, data);
};

export const updateTicket = async (id, data) => {
  await loadToken();
  return api.put(`/tickets/${id}`, data);
};

export const deleteTicket = async (id) => {
  await loadToken();
  return api.delete(`/tickets/${id}`);
};

export const searchTickets = async (params) => {
  await loadToken();
  return api.get(`/tickets/search`, { params });
};

// ================== TRIPS ==================
export const fetchTrips = async () => {
  await loadToken(); // assure que le token est chargé
  return api.get("/trips"); // récupération de tous les voyages
};

export const fetchTrip = async (id) => {
  await loadToken();
  return api.get(`/trips/${id}`);
};

// ================== TICKETS D'UN VOYAGE ==================
export const fetchTicketsByTrip = async (tripId) => {
  await loadToken(); // s'assurer que le token est chargé
  return api.get(`/trips/${tripId}/tickets`);
};

export default api;
