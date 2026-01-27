import api, { loadAuthToken } from "./api";

/* =======================
   💸 TRANSFERS
   ======================= */

// ✅ Lister les transferts avec filtres optionnels
export const fetchTransfers = async (filters = {}) => {
  await loadAuthToken();
  const { data } = await api.get("/transfers", { params: filters });
  return data;
};

// ✅ Obtenir un transfert spécifique
export const fetchTransfer = async (id) => {
  await loadAuthToken();
  const { data } = await api.get(`/transfers/${id}`);
  return data;
};

// ✅ Créer un transfert
export const createTransfer = async (transfer) => {
  await loadAuthToken();
  const { data } = await api.post("/transfers", transfer);
  return data;
};

// ✅ Mettre à jour un transfert
export const updateTransfer = async (id, transfer) => {
  await loadAuthToken();
  const { data } = await api.put(`/transfers/${id}`, transfer);
  return data;
};

// ✅ Supprimer un transfert
export const deleteTransfer = async (id) => {
  await loadAuthToken();
  const { data } = await api.delete(`/transfers/${id}`);
  return data;
};

// ✅ Obtenir statistiques journalières
export const getDailyStats = async (params = {}) => {
  await loadAuthToken();
  const { data } = await api.get("/transfers/stats/daily", { params });
  return data;
};

// ✅ Export Excel des transferts
export const exportTransfers = async (params = {}) => {
  await loadAuthToken();
  const { data } = await api.get("/transfers/export", {
    params,
    responseType: "blob",
  });
  return data;
};

// ✅ Lister tous les expéditeurs
export const fetchSenders = async () => {
  await loadAuthToken();
  const { data } = await api.get("/senders");
  return data;
};

// ✅ Lister tous les destinataires
export const fetchReceivers = async () => {
  await loadAuthToken();
  const { data } = await api.get("/receivers");
  return data;
};
