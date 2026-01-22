import api from "./api";

/* =======================
   📦 PARCELS
   ======================= */

export const fetchParcels = (params = {}) =>
  api.get("/parcels", { params });

export const fetchParcel = (id) =>
  api.get(`/parcels/${id}`);

export const createParcel = (data) => {
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

export const updateParcel = (id, data) => {
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

export const deleteParcel = (id) =>
  api.delete(`/parcels/${id}`);
