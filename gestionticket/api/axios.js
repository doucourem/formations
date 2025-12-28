// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://tonbackend.com/api",
  headers: { "Content-Type": "application/json" }
});

export default api;
