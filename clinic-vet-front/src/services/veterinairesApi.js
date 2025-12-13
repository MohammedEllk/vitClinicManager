import api from "./api/axiosClient";

export const veterinairesApi = {
  list: () => api.get("/veterinaires").then(r => r.data),
  create: (payload) => api.post("/veterinaires", payload).then(r => r.data),
  update: (id, payload) => api.put(`/veterinaires/${id}`, payload).then(r => r.data),
  remove: (id) => api.delete(`/veterinaires/${id}`),
};