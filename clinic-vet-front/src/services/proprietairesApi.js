import api from "./api/axiosClient";

export const proprietairesApi = {
  list: (q = "") => api.get(`/proprietaires${q ? `?q=${encodeURIComponent(q)}` : ""}`).then(r => r.data),
  create: (payload) => api.post("/proprietaires", payload).then(r => r.data),
  update: (id, payload) => api.put(`/proprietaires/${id}`, payload).then(r => r.data),
  remove: (id) => api.delete(`/proprietaires/${id}`),
  get: (id) => api.get(`/proprietaires/${id}`).then(r => r.data),
};