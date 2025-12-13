import { useEffect, useState } from "react";
import api from "../services/api/axiosClient";
import "../styles/ownerModal.css";

export default function OwnerModal({ open, onClose, owner, mode }) {
  // mode: "edit" | "details"
  const isEdit = mode === "edit";
  const isDetails = mode === "details";

  const [form, setForm] = useState({ nom: "", telephone: "", email: "", adresse: "" });
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!open) return;

    setErr("");
    setDetails(null);

    if (owner && isEdit) {
      setForm({
        nom: owner.nom ?? "",
        telephone: owner.telephone ?? "",
        email: owner.email ?? "",
        adresse: owner.adresse ?? "",
      });
    }

    if (owner && isDetails) {
      setLoading(true);
      api.get(`/proprietaires/${owner.id}/details`)
        .then((res) => setDetails(res.data))
        .catch((e) => setErr(e?.response?.data?.message || "Erreur chargement détails"))
        .finally(() => setLoading(false));
    }
  }, [open, owner, mode]);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      setLoading(true);
      await api.put(`/proprietaires/${owner.id}`, form);
      onClose(true); // true => refresh list
    } catch (e2) {
      setErr(e2?.response?.data?.message || "Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>
            {isEdit ? "Modifier propriétaire" : `Détails - ${owner?.nom ?? ""}`}
          </h3>
          <button className="modal-close" onClick={() => onClose(false)}>✕</button>
        </div>

        {err && <div className="modal-error">{err}</div>}

        {isEdit && (
          <form onSubmit={submit} className="modal-body">
            <input
              placeholder="Nom"
              value={form.nom}
              onChange={(e) => setForm({ ...form, nom: e.target.value })}
              required
            />
            <input
              placeholder="Téléphone"
              value={form.telephone}
              onChange={(e) => setForm({ ...form, telephone: e.target.value })}
            />
            <input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              placeholder="Adresse"
              value={form.adresse}
              onChange={(e) => setForm({ ...form, adresse: e.target.value })}
            />

            <div className="modal-actions">
              <button type="button" className="btn-light" onClick={() => onClose(false)}>
                Annuler
              </button>
              <button className="btn-primary" disabled={loading}>
                {loading ? "..." : "Enregistrer"}
              </button>
            </div>
          </form>
        )}

        {isDetails && (
          <div className="modal-body">
            {loading && <p>Chargement...</p>}

            {!loading && details && (
              <>
                <div className="details-grid">
                  <div><b>Nom :</b> {details.nom}</div>
                  <div><b>Téléphone :</b> {details.telephone || "—"}</div>
                  <div><b>Email :</b> {details.email || "—"}</div>
                  <div><b>Adresse :</b> {details.adresse || "—"}</div>
                </div>

                <h4 className="mt">Animaux</h4>
                {details.animaux?.length ? (
                  <ul className="animals-list">
                    {details.animaux.map((a) => (
                      <li key={a.id}>
                        <b>{a.nom}</b> — {a.espece} {a.race ? `(${a.race})` : ""}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Aucun animal.</p>
                )}

                <div className="modal-actions">
                  <button className="btn-light" onClick={() => onClose(false)}>Fermer</button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
