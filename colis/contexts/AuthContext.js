import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/ticketApi"; // instance axios
import { Alert } from "react-native";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger le token et user depuis AsyncStorage au lancement
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const t = await AsyncStorage.getItem("token");
        const u = await AsyncStorage.getItem("user");
        if (t && u) {
          setToken(t);
          setUser(JSON.parse(u));
          api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
        }
      } catch (e) {
        console.error("Erreur chargement auth:", e);
      } finally {
        setLoading(false);
      }
    };
    loadAuth();
  }, []);

  // Intercepteur pour gérer automatiquement 401
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      res => res,
      async (error) => {
        if (error.response?.status === 401) {
          // Token invalide → logout automatique
          await logout();
          Alert.alert("Session expirée", "Veuillez vous reconnecter.");
        }
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

  // Login
  const loginUser = async (userData, tokenData) => {
    try {
      setUser(userData);
      setToken(tokenData);
      api.defaults.headers.common["Authorization"] = `Bearer ${tokenData}`;
      await AsyncStorage.setItem("token", tokenData);
      await AsyncStorage.setItem("user", JSON.stringify(userData));
    } catch (e) {
      console.error("Erreur login:", e);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      delete api.defaults.headers.common["Authorization"];
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    } catch (e) {
      console.error("Erreur logout:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken, loginUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
