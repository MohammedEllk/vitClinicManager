import { useEffect, useState } from "react";
import MainLayout from "../../layout/mainLayout";
import api from "../../services/api/axiosClient";
import OwnerModal from "../../components/ownerModals";
import "../../styles/ownersAnimals.css";

export default function OwnersPage() {
  const [owners, setOwners] = useState([]);

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const perPage = 8;

  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("details"); // "create" | "edit" | "details"
  const [selected, setSelected] = useState(null);

  const loadOwners = async (pageToLoad = 1) => {
    setErr("");
    setLoading(true);

    try {
      const res = await api.get("/proprietaires", {
        params: {
          page: pageToLoad,
          per_page: perPage,
          ...(q ? { q } : {}),
        },
      });

      // paginate() => { data: [...], current_page, last_page, ... }
      setOwners(res.data?.data || []);
      setPage(res.data?.current_page || pageToLoad);
      setLastPage(res.data?.last_page || 1);
    } catch (e) {
      setOwners([]);
      setErr(e?.response?.data?.message || "Erreur chargement propriétaires");
    } finally {
      setLoading(false);
    }
  };

  // ✅ IMPORTANT : charger dès l'ouverture de la page
  useEffect(() => {
    loadOwners(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    loadOwners(1); // ✅ reset page quand on cherche
  };

  const openCreate = () => {
    setSelected(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEdit = (owner) => {
    setSelected(owner);
    setModalMode("edit");
    setModalOpen(true);
  };

  const openDetails = (owner) => {
    setSelected(owner);
    setModalMode("details");
    setModalOpen(true);
  };

  const onDelete = async (owner) => {
    const ok = window.confirm(`Supprimer "${owner.nom}" ?`);
    if (!ok) return;

    try {
      await api.delete(`/proprietaires/${owner.id}`);
      // si tu supprimes le dernier élément d’une page, reviens d’une page si besoin
      const nextPage = owners.length === 1 && page > 1 ? page - 1 : page;
      await loadOwners(nextPage);
    } catch (e) {
      alert(e?.response?.data?.message || "Erreur suppression");
    }
  };

  // refresh = true => reload list
  const closeModal = async (refresh) => {
    setModalOpen(false);
    setSelected(null);
    if (refresh) await loadOwners(page);
  };

  // pagination: fenêtre de pages
  const pages = Array.from({ length: lastPage }, (_, i) => i + 1);
  const start = Math.max(0, page - 3);
  const end = Math.min(lastPage, page + 2);
  const visiblePages = pages.slice(start, end);

  return (
    <MainLayout>
      <div className="owners-page">
        <div className="owners-head">
          <h2>Propriétaires</h2>

          <form className="owners-search" onSubmit={onSearch}>
            <input
              placeholder="Rechercher (nom ou téléphone)"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <button type="submit" className="btn-light">
              Rechercher
            </button>
            <button type="button" className="btn-primary" onClick={openCreate}>
              Ajouter propriétaire
            </button>
          </form>
        </div>

        {err && <div className="page-error">{err}</div>}
        {loading && <p>Chargement...</p>}

        {!loading && owners.length === 0 && !err && (
          <p style={{ marginTop: 16 }}>Aucun propriétaire.</p>
        )}

        <div className="owners-grid">
          {owners.map((o) => (
            <div key={o.id} className="owner-card">
              <div className="owner-name">{o.nom}</div>

              <div className="owner-line">📞 {o.telephone || "—"}</div>
              <div className="owner-line">✉️ {o.email || "—"}</div>

              <div className="owner-actions">
                <button className="btn-light" onClick={() => openDetails(o)}>
                  Détails
                </button>
                <button className="btn-edit" onClick={() => openEdit(o)}>
                  Modifier
                </button>
                <button className="btn-danger" onClick={() => onDelete(o)}>
                  Supprimer
                </button>
              </div>

              <button className="btn-add-animal">
                Ajouter animal
              </button>
            </div>
          ))}
        </div>

        {/* ✅ pagination dans la page (pas en dehors du container) */}
        {lastPage > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={page <= 1}
              onClick={() => loadOwners(page - 1)}
            >
              ‹
            </button>

            {visiblePages.map((p) => (
              <button
                key={p}
                className={`page-btn ${p === page ? "active" : ""}`}
                onClick={() => loadOwners(p)}
              >
                {p}
              </button>
            ))}

            <button
              className="page-btn"
              disabled={page >= lastPage}
              onClick={() => loadOwners(page + 1)}
            >
              ›
            </button>
          </div>
        )}
      </div>

      <OwnerModal
        open={modalOpen}
        onClose={closeModal}
        owner={selected}
        mode={modalMode}
      />
    </MainLayout>
  );
}
