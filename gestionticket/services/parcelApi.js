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
export const getAgencies = async (params = {}) => {
  await loadAuthToken();
  return api.get("/agencies", { params });
};
export const createParcel = async (data) => {
  await loadAuthToken();

  return api.post("/parcels", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
export const updateParcel = async (id, data) => {
  await loadAuthToken();

  // Laravel utilise la méthode POST + _method=PUT
  data.append("_method", "PUT");

  return api.post(`/parcels/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};




export const deleteParcel = async (id) => {
  await loadAuthToken();
  return api.delete(`/parcels/${id}`);
};
