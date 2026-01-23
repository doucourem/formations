import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://nilatouleltrans.com/api";
//const API_URL = "http://127.0.0.1:8000/api";
const api = axios.create({
  baseURL: API_URL, // ex: http://127.0.0.1:8000/api
  headers: {
    Accept: "application/json",
  },
  withCredentials: true, // ⚠️ obligatoire pour cookies / CORS
});

/**
 * Appliquer / retirer le token globalement
 */
export const setAuthToken = async (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    await AsyncStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    await AsyncStorage.removeItem("token");
  }
};

/**
 * Restaurer le token au démarrage de l’app
 */
export const loadAuthToken = async () => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
  return token;
};

export default api;
