import axios from "axios";

const API_URL = "https://nilatouleltrans.com/api";
//const API_URL = "http://127.0.0.1:8000/api";
/* ================= LOGIN ================= */
export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });
  return response.data;
};

/* ================= LOGOUT ================= */
export const logout = async () => {
  const response = await axios.post(
    `${API_URL}/logout`,
    {},
    { withCredentials: true }
  );

  return response.data;
};

