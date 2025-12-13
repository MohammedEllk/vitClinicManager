import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../layout/mainLayout";
import "../../styles/ownersAnimals.css";
import Modal from "../../components/modals";
import { animauxApi } from "../../services/animauxApi";
import { proprietairesApi } from "../../services/proprietairesApi";
import "../../styles/animaux.css";

const PAGE_SIZE = 6;

export default function AnimalsPage() {
  const [items, setItems] = useState([]);
  const [owners, setOwners] = useState([]);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  // modal state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // animal ou null
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    nom: "",
    espece: "",
    race: "",
    sexe: "",
    date_naissance: "",
    proprietaire_id: "",
  });

  async function load() {
    setLoading(true);
    try {
      const [animals, props] = await Promise.all([
        animauxApi.list(q),
        proprietairesApi.list(),
      ]);
      setItems(animals);
      setOwners(props);
      setPage(1);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(items.length / PAGE_SIZE)), [items]);
  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  function openCreate() {
    setEditing(null);
    setError("");
    setForm({
      nom: "",
      espece: "",
      race: "",
      sexe: "",
      date_naissance: "",
      proprietaire_id: owners[0]?.id || "",
    });
    setOpen(true);
  }

  function openEdit(animal) {
    setEditing(animal);
    setError("");
    setForm({
      nom: animal.nom || "",
      espece: animal.espece || "",
      race: animal.race || "",
      sexe: animal.sexe || "",
      date_naissance: animal.date_naissance ? animal.date_naissance.slice(0, 10) : "",
      proprietaire_id: animal.proprietaire_id || animal.proprietaire?.id || "",
    });
    setOpen(true);
  }

  function close() {
    setOpen(false);
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    try {
      if (editing) {
        await animauxApi.update(editing.id, form);
      } else {
        await animauxApi.create(form);
      }
      close();
      load();
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstKey = Object.keys(errors)[0];
        setError(errors[firstKey][0]);
      } else {
        setError(err.response?.data?.message || "Erreur");
      }
    }
  }

  async function remove(animal) {
    if (!confirm(`Supprimer ${animal.nom} ?`)) return;
    await animauxApi.remove(animal.id);
    load();
  }

  return (
    <MainLayout>
      <div className="animals-header">
        <div className="hello">Bonjour Dr Mohammed</div>
        <h2 className="title">Liste des animaux</h2>

        <div className="toolbar">
          <input
            className="search"
            placeholder="Rechercher (nom, espèce, propriétaire...)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn" onClick={load}>Rechercher</button>
          <button className="btn btn-green" onClick={openCreate}>Ajouter animaux</button>
        </div>
      </div>

      {loading && <p>Chargement...</p>}

      <div className="cards-grid">
        {pageItems.map((a) => (
          <div key={a.id} className="animal-card">
            <div className="animal-name">{a.nom}</div>
            <div className="animal-sub">
              {a.espece}{a.race ? `, ${a.race}` : ""}{a.sexe ? `, ${a.sexe}` : ""}
            </div>
            <div className="animal-owner">
              Propriétaire: <b>{a.proprietaire ? `${a.proprietaire.nom}` : "-"}</b>
            </div>

            <div className="card-actions">
              <button className="btn btn-purple" onClick={() => openEdit(a)}>modifier</button>
              <button className="btn btn-danger" onClick={() => remove(a)}>supprimer</button>
            </div>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button className="page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            className={`page-btn ${p === page ? "active" : ""}`}
            onClick={() => setPage(p)}
          >
            {p}
          </button>
        ))}
        <button className="page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
      </div>

      <Modal
        open={open}
        title={editing ? "Modifier un animal" : "Ajouter un animal"}
        onClose={close}
      >
        <form onSubmit={submit} className="modal-form">
          <input
            placeholder="Nom *"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            required
          />
          <input
            placeholder="Espèce * (Chat, Chien...)"
            value={form.espece}
            onChange={(e) => setForm({ ...form, espece: e.target.value })}
            required
          />
          <input
            placeholder="Race"
            value={form.race}
            onChange={(e) => setForm({ ...form, race: e.target.value })}
          />

          <div className="row">
            <input
              placeholder="Sexe (M/F)"
              value={form.sexe}
              onChange={(e) => setForm({ ...form, sexe: e.target.value })}
            />
            <input
              type="date"
              value={form.date_naissance}
              onChange={(e) => setForm({ ...form, date_naissance: e.target.value })}
            />
          </div>

          <select
            value={form.proprietaire_id}
            onChange={(e) => setForm({ ...form, proprietaire_id: e.target.value })}
            required
          >
            <option value="" disabled>Choisir propriétaire</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nom} {o.prenom || ""} ({o.telephone || "tel?"})
              </option>
            ))}
          </select>

          {error && <p className="error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn" onClick={close}>Annuler</button>
            <button type="submit" className="btn btn-green">{editing ? "Enregistrer" : "Créer"}</button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}
