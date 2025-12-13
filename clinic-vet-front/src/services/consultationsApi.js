import api from "./api/axiosClient";

export const consultationsApi = {
  list: ({ animalId = "", q = "" } = {}) => {
    const params = new URLSearchParams();
    if (animalId) params.append("animal_id", animalId);
    if (q) params.append("q", q);

    const qs = params.toString();
    return api.get(`/consultations${qs ? `?${qs}` : ""}`).then((r) => r.data);
  },

  create: (payload) => api.post("/consultations", payload).then((r) => r.data),

  update: (id, payload) =>
    api.put(`/consultations/${id}`, payload).then((r) => r.data),

  remove: (id) => api.delete(`/consultations/${id}`),

  historyByAnimal: (animalId) =>
    api.get(`/animaux/${animalId}/consultations`).then((r) => r.data),
};
