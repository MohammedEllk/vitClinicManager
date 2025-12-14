import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../layout/mainLayout";
import { veterinairesApi } from "../../services/veterinairesApi";
import "../../styles/ownersAnimals.css";
import Modal from "../../components/modals";

function pickFirstError(err) {
  const errors = err?.response?.data?.errors;
  if (!errors) return null;
  const firstKey = Object.keys(errors)[0];
  return errors[firstKey]?.[0] || null;
}

export default function VeterinairesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // modal
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("create"); // "create" | "edit" | "details"
  const [selected, setSelected] = useState(null);

  // form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // seulement create / reset password
  const [error, setError] = useState("");

  const isReadOnly = useMemo(() => mode === "details", [mode]);
  const isEdit = useMemo(() => mode === "edit", [mode]);
  const isCreate = useMemo(() => mode === "create", [mode]);

  async function load() {
    setLoading(true);
    try {
      const data = await veterinairesApi.list();
      // si ton API est paginée, adapte ici (data.data)
      setItems(Array.isArray(data) ? data : data?.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
    setSelected(null);
  }

  function openCreate() {
    resetForm();
    setMode("create");
    setOpen(true);
  }

  function openDetails(v) {
    setSelected(v);
    setMode("details");
    setError("");
    setName(v?.name || "");
    setEmail(v?.email || "");
    setPassword("");
    setOpen(true);
  }

  function openEdit(v) {
    setSelected(v);
    setMode("edit");
    setError("");
    setName(v?.name || "");
    setEmail(v?.email || "");
    setPassword(""); // optionnel : si tu veux un champ reset password
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    try {
      if (isCreate) {
        await veterinairesApi.create({ name, email, password });
      } else if (isEdit) {
        // ⚠️ update : on n’envoie pas password si vide
        const payload = { name, email };
        if (password?.trim()) payload.password = password.trim();

        await veterinairesApi.update(selected.id, payload);
      }

      closeModal();
      resetForm();
      load();
    } catch (err) {
      console.error(err?.response?.data || err);
      setError(
        pickFirstError(err) ||
          err?.response?.data?.message ||
          (isEdit ? "Erreur lors de la modification" : "Erreur lors de la création")
      );
    }
  }

  async function remove(v) {
    if (!confirm(`Supprimer ${v.name} ?`)) return;
    try {
      await veterinairesApi.remove(v.id);
      load();
    } catch (e) {
      alert(e?.response?.data?.message || "Erreur suppression");
    }
  }

  const modalTitle =
    mode === "create"
      ? "Ajouter un vétérinaire"
      : mode === "edit"
      ? "Modifier un vétérinaire"
      : "Détails vétérinaire";

  return (
    <MainLayout>
      <div className="page-header">
        <h2 className="page-title">Vétérinaires (Admin)</h2>

        <button className="btn-add" onClick={openCreate}>
          Ajouter vétérinaire
        </button>
      </div>

      {loading && <p>Chargement...</p>}

      <div className="cards-grid">
        {items.map((v) => (
          <div key={v.id} className="item-card">
            <div className="item-title">{v.name}</div>
            <div className="item-info">{v.email}</div>

            <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
              <button className="btn-light" onClick={() => openDetails(v)}>
                Détails
              </button>

              <button className="btn-edit" onClick={() => openEdit(v)}>
                Modifier
              </button>

              <button className="btn-danger" onClick={() => remove(v)}>
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} title={modalTitle} onClose={closeModal}>
        <form
          onSubmit={submit}
          style={{ display: "flex", flexDirection: "column", gap: 10 }}
        >
          <input
            placeholder="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isReadOnly}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />

          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isReadOnly}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />

          {/* Password:
              - obligatoire en création
              - optionnel en modification (si tu veux permettre reset)
              - caché en détails
           */}
          {mode !== "details" && (
            <input
              placeholder={isCreate ? "Mot de passe" : "Nouveau mot de passe (optionnel)"}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={isCreate}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />
          )}

          {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 8,
            }}
          >
            <button type="button" onClick={closeModal} style={{ padding: "8px 14px" }}>
              {mode === "details" ? "Fermer" : "Annuler"}
            </button>

            {mode !== "details" && (
              <button type="submit" className="btn-add">
                {isEdit ? "Enregistrer" : "Créer"}
              </button>
            )}
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}
