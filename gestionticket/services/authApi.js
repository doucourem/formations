import axios from "axios";

const API_URL = "https://nilatouleltrans.com/api";

/* ================= LOGIN ================= */
export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, {
    email,
    password,
  });
  return response.data;
};

/* ================= LOGOUT ================= */
export const logout = async (token) => {
  if (!token) return;

  const response = await axios.post(
    `${API_URL}/logout`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    }
  );

  return response.data;
};
