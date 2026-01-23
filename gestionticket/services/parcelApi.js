import api, { loadAuthToken } from "./api";

/* =======================
   📦 PARCELS
   ======================= */

export const fetchParcels = async (params = {}) => {
  await loadAuthToken(); // ⚠️ important pour le Bearer token
  return api.get("/parcels", { params });
};

export const fetchParcel = async (id) => {
  await loadAuthToken();
  return api.get(`/parcels/${id}`);
};

export const createParcel = async (data) => {
  await loadAuthToken();
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });

  return api.post("/parcels", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateParcel = async (id, data) => {
  await loadAuthToken();
  const formData = new FormData();
  formData.append("_method", "PUT");

  Object.keys(data).forEach((key) => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });

  return api.post(`/parcels/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteParcel = async (id) => {
  await loadAuthToken();
  return api.delete(`/parcels/${id}`);
};
