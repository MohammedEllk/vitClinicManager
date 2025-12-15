import api from "./api/axiosClient";

export const documentsApi = {
  listByConsultation: (consultationId) =>
    api.get(`/consultations/${consultationId}/documents`).then((r) => r.data),

  uploadToConsultation: (consultationId, { title, file }) => {
    const form = new FormData();
    if (title) form.append("title", title);
    form.append("file", file);

    return api
      .post(`/consultations/${consultationId}/documents`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  remove: (id) => api.delete(`/documents/${id}`),

  downloadUrl: (id) => `${api.defaults.baseURL}/documents/${id}/download`,
};