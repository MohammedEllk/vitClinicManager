import { useEffect, useState } from "react";
import Modal from "./modals";
import { documentsApi } from "../services/documentsApi";

export default function DocumentsModal({ open, onClose, consultation }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    if (!consultation?.id) return;
    setLoading(true);
    try {
      const data = await documentsApi.listByConsultation(consultation.id);
      console.log("data",data)
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) load();
  }, [open]);

  async function upload(e) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Choisis un fichier (PDF / image).");
      return;
    }

    try {
      await documentsApi.uploadToConsultation(consultation.id, { title, file });
      setTitle("");
      setFile(null);
      await load();
    } catch (err) {
      const msg = err.response?.data?.message || "Erreur upload";
      setError(msg);
    }
  }

  async function removeDoc(id) {
    if (!confirm("Supprimer ce document ?")) return;
    await documentsApi.remove(id);
    await load();
  }

  return (
    <Modal
      open={open}
      title={`Documents - Consultation #${consultation?.id ?? ""}`}
      onClose={onClose}
    >
      <form onSubmit={upload} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input
          placeholder="Titre (optionnel)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="file"
          accept=".pdf,image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button type="button" className="btn" onClick={onClose}>
            Fermer
          </button>
          <button type="submit" className="btn btn-green">
            Upload
          </button>
        </div>
      </form>

      <hr style={{ margin: "16px 0" }} />

      {loading && <p>Chargement...</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((d) => (
          <div
            key={d.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 10,
              padding: 10,
              border: "1px solid #ddd",
              borderRadius: 10,
            }}
          >
            <div>
              <b>{d.title || d.nom_original}</b>
              <div style={{ fontSize: 12, color: "#666" }}>
                {d.type_mime} — {(d.taille / 1024).toFixed(1)} KB
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <a className="btn" href={d.download_url} target="_blank" rel="noreferrer">
                Télécharger
              </a>
              <button className="btn btn-danger" onClick={() => removeDoc(d.id)}>
                Supprimer
              </button>
            </div>
          </div>
        ))}

        {!loading && items.length === 0 && <p>Aucun document.</p>}
      </div>
    </Modal>
  );
}
