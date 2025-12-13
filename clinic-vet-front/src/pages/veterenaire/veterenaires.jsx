import { useEffect, useState } from "react";
import MainLayout from "../../layout/mainLayout";
import { veterinairesApi } from "../../services/veterinairesApi";
import "../../styles/ownersAnimals.css";
import Modal from "../../components/modals";

export default function VeterinairesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await veterinairesApi.list();
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setError("");
  }

  function openModal() {
    resetForm();
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    try {
      await veterinairesApi.create({ name, email, password });
      closeModal();
      load();
    } catch (err) {
      console.error(err.response?.data || err);
      // Laravel validation errors (422)
      const msg = err.response?.data?.message || "Erreur lors de la création";
      setError(msg);
    }
  }

  async function remove(id) {
    if (!confirm("Supprimer ce vétérinaire ?")) return;
    await veterinairesApi.remove(id);
    load();
  }

  return (
    <MainLayout>
      <div className="page-header">
        <h2 className="page-title">Vétérinaires (Admin)</h2>
        <button className="btn-add" onClick={openModal}>
          Ajouter vétérinaire
        </button>
      </div>

      {loading && <p>Chargement...</p>}

      <div className="cards-grid">
        {items.map((v) => (
          <div key={v.id} className="item-card">
            <div className="item-title">{v.name}</div>
            <div className="item-info">{v.email}</div>
            <button className="btn-edit" onClick={() => remove(v.id)}>
              supprimer
            </button>
          </div>
        ))}
      </div>

      <Modal open={open} title="Ajouter un vétérinaire" onClose={closeModal}>
        <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            placeholder="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
          <input
            placeholder="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />

          {error && <p style={{ color: "red", margin: 0 }}>{error}</p>}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
            <button type="button" onClick={closeModal} style={{ padding: "8px 14px" }}>
              Annuler
            </button>
            <button type="submit" className="btn-add">
              Créer
            </button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}
