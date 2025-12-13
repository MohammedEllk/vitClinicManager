import api from "./api/axiosClient";

export const animauxApi = {
  list: () => api.get("/animaux").then(r => r.data),
  create: (payload) => api.post("/animaux", payload).then(r => r.data),
  update: (id, payload) => api.put(`/animaux/${id}`, payload).then(r => r.data),
  remove: (id) => api.delete(`/animaux/${id}`),
  byOwner: (ownerId) => api.get(`/proprietaires/${ownerId}/animaux`).then(r => r.data),
};
