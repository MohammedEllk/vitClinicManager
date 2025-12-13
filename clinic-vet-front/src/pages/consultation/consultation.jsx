import { useEffect, useState } from "react";
import MainLayout from "../../layout/mainLayout"
import Modal from "../../components/modals";
import { consultationsApi } from "../../services/consultationsApi";
import { animauxApi } from "../../services/animauxApi";
import "../../styles/consultation.css";
import DocumentsModal from "../../components/documentModals";


export default function ConsultationsPage() {
  const [animals, setAnimals] = useState([]);
  const [animalId, setAnimalId] = useState("");
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // modal consultation (create/edit)
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    animal_id: "",
    date_consultation: "",
    motif: "",
    diagnostic: "",
    traitement: "",
    recommandations: "",
    poids: "",
    temperature: "",
  });

  // modal documents
  const [docOpen, setDocOpen] = useState(false);
  const [docConsultation, setDocConsultation] = useState(null);

  async function load(selectedAnimal = animalId, currentQ = search) {
    setLoading(true);
    try {
      const data = await consultationsApi.list({
        animalId: selectedAnimal,
        q: currentQ,
      });
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    (async () => {
      const a = await animauxApi.list(); // doit renvoyer proprietaire aussi (animal.proprietaire)
      setAnimals(a);
      load("", "");
    })();
  }, []);

  useEffect(() => {
    load(animalId, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animalId]);

  function openCreate() {
    setEditing(null);
    setError("");
    setForm({
      animal_id: animalId || (animals[0]?.id ?? ""),
      date_consultation: new Date().toISOString().slice(0, 10),
      motif: "",
      diagnostic: "",
      traitement: "",
      recommandations: "",
      poids: "",
      temperature: "",
    });
    setOpen(true);
  }

  function openEdit(c) {
    setEditing(c);
    setError("");
    setForm({
      animal_id: c.animal_id || c.animal?.id || "",
      date_consultation: c.date_consultation?.slice(0, 10) || "",
      motif: c.motif || "",
      diagnostic: c.diagnostic || "",
      traitement: c.traitement || "",
      recommandations: c.recommandations || "",
      poids: c.poids ?? "",
      temperature: c.temperature ?? "",
    });
    setOpen(true);
  }

  function closeConsultationModal() {
    setOpen(false);
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        ...form,
        poids: form.poids === "" ? null : Number(form.poids),
        temperature: form.temperature === "" ? null : Number(form.temperature),
      };

      if (editing) {
        await consultationsApi.update(editing.id, payload);
      } else {
        await consultationsApi.create(payload);
      }

      closeConsultationModal();
      load(animalId, search);
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

  async function remove(c) {
    if (!confirm("Supprimer cette consultation ?")) return;
    await consultationsApi.remove(c.id);
    load(animalId, search);
  }

  function openDocs(c) {
    setDocConsultation(c);
    setDocOpen(true);
  }

  return (
    <MainLayout>
      <div className="consult-header">
        <h2>Consultations</h2>

        <div className="toolbar">
          <select value={animalId} onChange={(e) => setAnimalId(e.target.value)}>
            <option value="">-- Filtrer par animal (optionnel) --</option>
            {animals.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nom} ({a.espece}) - {a.proprietaire?.nom ?? "?"}
              </option>
            ))}
          </select>

          <input
            className="search"
            placeholder="Rechercher (motif, diagnostic, animal, propriétaire...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="btn" onClick={() => load(animalId, search)}>
            Rechercher
          </button>

          <button className="btn btn-green" onClick={openCreate}>
            Ajouter consultation
          </button>
        </div>
      </div>

      {loading && <p>Chargement...</p>}

      <div className="consult-grid">
        {items.map((c) => (
          <div key={c.id} className="consult-card">
            <div className="top">
              <div className="date">{c.date_consultation?.slice(0, 10)}</div>
              <div className="animal">
                {c.animal ? `${c.animal.nom} (${c.animal.espece})` : "—"}
              </div>
            </div>

            <div className="line">
              <b>Motif:</b> {c.motif || "—"}
            </div>
            <div className="line">
              <b>Diagnostic:</b> {c.diagnostic || "—"}
            </div>
            <div className="line">
              <b>Traitement:</b> {c.traitement || "—"}
            </div>

            <div className="metrics">
              <span>
                Poids: <b>{c.poids ?? "—"}</b>
              </span>
              <span>
                Temp: <b>{c.temperature ?? "—"}</b>
              </span>
            </div>

            <div className="consultation-actions">
              <button className="btn-doc" onClick={() => openDocs(c)}>
                Documents
              </button>

              <button className="edit" onClick={() => openEdit(c)}>
                modifier
              </button>

              <button className="btn-delete" onClick={() => remove(c)}>
                supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL CREATE/EDIT CONSULTATION */}
      <Modal
        open={open}
        title={editing ? "Modifier consultation" : "Ajouter consultation"}
        onClose={closeConsultationModal}
      >
        <form className="modal-form" onSubmit={submit}>
          <select
            value={form.animal_id}
            onChange={(e) => setForm({ ...form, animal_id: e.target.value })}
            required
          >
            <option value="" disabled>
              Choisir animal
            </option>
            {animals.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nom} ({a.espece}) - {a.proprietaire?.nom ?? "?"}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={form.date_consultation}
            onChange={(e) => setForm({ ...form, date_consultation: e.target.value })}
            required
          />

          <input
            placeholder="Motif"
            value={form.motif}
            onChange={(e) => setForm({ ...form, motif: e.target.value })}
          />

          <textarea
            placeholder="Diagnostic"
            value={form.diagnostic}
            onChange={(e) => setForm({ ...form, diagnostic: e.target.value })}
          />

          <textarea
            placeholder="Traitement"
            value={form.traitement}
            onChange={(e) => setForm({ ...form, traitement: e.target.value })}
          />

          <textarea
            placeholder="recommandations"
            value={form.recommandations}
            onChange={(e) => setForm({ ...form, recommandations: e.target.value })}
          />

          <div className="row">
            <input
              type="number"
              step="0.1"
              placeholder="Poids (kg)"
              value={form.poids}
              onChange={(e) => setForm({ ...form, poids: e.target.value })}
            />
            <input
              type="number"
              step="0.1"
              placeholder="Température"
              value={form.temperature}
              onChange={(e) => setForm({ ...form, temperature: e.target.value })}
            />
          </div>

          {error && <p className="error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn" onClick={closeConsultationModal}>
              Annuler
            </button>
            <button type="submit" className="btn btn-green">
              {editing ? "Enregistrer" : "Créer"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL DOCUMENTS */}
      <DocumentsModal
        open={docOpen}
        onClose={() => setDocOpen(false)}
        consultation={docConsultation}
      />
    </MainLayout>
  );
}
