import { useEffect, useMemo, useState } from "react";
import MainLayout from "../../layout/mainLayout";
import Modal from "../../components/modals";

import { animauxApi } from "../../services/animauxApi";
import { proprietairesApi } from "../../services/proprietairesApi";

import "../../styles/ownersAnimals.css";
import "../../styles/animaux.css";

const PAGE_SIZE = 6;

// ✅ normalize laravel responses (plain array OR paginate() OR wrapped)
function toArray(payload) {
  if (!payload) return [];

  // already array
  if (Array.isArray(payload)) return payload;

  // axios response { data: ... }
  if (payload?.data && !Array.isArray(payload) && typeof payload === "object") {
    // case: { data: [...] }
    if (Array.isArray(payload.data)) return payload.data;

    // case: paginate() => { data: { data: [...] } } or { data: { data, current_page... } }
    if (payload.data?.data && Array.isArray(payload.data.data)) return payload.data.data;

    // case: paginate() => { data: [...] , current_page... }
    if (payload?.data && Array.isArray(payload.data)) return payload.data;
  }

  // case: paginate() => { data: [...] , current_page... }
  if (payload?.data && Array.isArray(payload.data)) return payload.data;

  return [];
}

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
    setError("");
    try {
      const [animalsRes, ownersRes] = await Promise.all([
        animauxApi.list(q),
        proprietairesApi.list(), // peut être paginé !
      ]);

      const animals = toArray(animalsRes);
      const props = toArray(ownersRes);

      setItems(animals);
      setOwners(props);
      setPage(1);
    } catch (e) {
      setItems([]);
      setOwners([]);
      setError(e?.response?.data?.message || "Erreur chargement animaux/propriétaires");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(items.length / PAGE_SIZE)),
    [items]
  );

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return items.slice(start, start + PAGE_SIZE);
  }, [items, page]);

  function openCreate() {
    const ownersArr = Array.isArray(owners) ? owners : [];
    if (ownersArr.length === 0) {
      setError("Ajoute d'abord un propriétaire avant de créer un animal.");
      return;
    }

    setEditing(null);
    setError("");
    setForm({
      nom: "",
      espece: "",
      race: "",
      sexe: "",
      date_naissance: "",
      proprietaire_id: ownersArr[0]?.id || "",
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
      date_naissance: animal.date_naissance ? String(animal.date_naissance).slice(0, 10) : "",
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
      const errors = err?.response?.data?.errors;
      if (errors) {
        const firstKey = Object.keys(errors)[0];
        setError(errors[firstKey]?.[0] || "Erreur validation");
      } else {
        setError(err?.response?.data?.message || "Erreur");
      }
    }
  }

  async function remove(animal) {
    if (!confirm(`Supprimer ${animal.nom} ?`)) return;
    try {
      await animauxApi.remove(animal.id);
      // si on supprime le dernier élément d'une page, on recule d'une page si besoin
      const newItemsCount = items.length - 1;
      const newTotalPages = Math.max(1, Math.ceil(newItemsCount / PAGE_SIZE));
      if (page > newTotalPages) setPage(newTotalPages);
      load();
    } catch (e) {
      alert(e?.response?.data?.message || "Erreur suppression");
    }
  }

  const ownersArr = Array.isArray(owners) ? owners : [];

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
          <button className="btn" onClick={() => load()}>
            Rechercher
          </button>
          <button className="btn btn-green" onClick={openCreate}>
            Ajouter animaux
          </button>
        </div>
      </div>

      {error && <div className="page-error">{error}</div>}
      {loading && <p>Chargement...</p>}

      {!loading && pageItems.length === 0 && (
        <p style={{ marginTop: 16 }}>Aucun animal.</p>
      )}

      <div className="cards-grid">
        {pageItems.map((a) => (
          <div key={a.id} className="animal-card">
            <div className="animal-name">{a.nom}</div>

            <div className="animal-sub">
              {a.espece}
              {a.race ? `, ${a.race}` : ""}
              {a.sexe ? `, ${a.sexe}` : ""}
            </div>

            <div className="animal-owner">
              Propriétaire:{" "}
              <b>{a.proprietaire ? `${a.proprietaire.nom}` : "-"}</b>
            </div>

            <div className="card-actions">
              <button className="btn btn-purple" onClick={() => openEdit(a)}>
                modifier
              </button>
              <button className="btn btn-danger" onClick={() => remove(a)}>
                supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ‹
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              className={`page-btn ${p === page ? "active" : ""}`}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}

          <button
            className="page-btn"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            ›
          </button>
        </div>
      )}

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
            <option value="" disabled>
              Choisir propriétaire
            </option>

            {/* ✅ ownersArr est toujours un tableau */}
            {ownersArr.map((o) => (
              <option key={o.id} value={o.id}>
                {o.nom} {o.prenom || ""} ({o.telephone || "tel?"})
              </option>
            ))}
          </select>

          {error && <p className="error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn" onClick={close}>
              Annuler
            </button>
            <button type="submit" className="btn btn-green">
              {editing ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}
