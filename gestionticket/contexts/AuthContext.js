import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/ticketApi"; // axios instance

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Charger token/user depuis AsyncStorage au lancement
  useEffect(() => {
    const loadAuth = async () => {
      const t = await AsyncStorage.getItem("token");
      const u = await AsyncStorage.getItem("user");
      if (t && u) {
        setToken(t);
        setUser(JSON.parse(u));
        api.defaults.headers.common["Authorization"] = `Bearer ${t}`;
      }
      setLoading(false);
    };
    loadAuth();
  }, []);

  // Fonction login pour mettre à jour contexte + AsyncStorage
  const loginUser = async (userData, tokenData) => {
    setUser(userData);
    setToken(tokenData);
    api.defaults.headers.common["Authorization"] = `Bearer ${tokenData}`;
    await AsyncStorage.setItem("token", tokenData);
    await AsyncStorage.setItem("user", JSON.stringify(userData));
  };

  // Logout
  const logout = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken, loginUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
