// src/pages/OwnersPage.jsx
import MainLayout from "../../layout/mainLayout";
import { useEffect, useState } from "react";
import { proprietairesApi } from "../../services/proprietairesApi";
import { animauxApi } from "../../services/animauxApi";
import "../../styles/ownersAnimals.css";
import Modal from "../../components/modals";

export default function OwnersPage() {
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  // Modal propriétaire
  const [openProp, setOpenProp] = useState(false);
  const [propForm, setPropForm] = useState({ nom: "", prenom: "", telephone: "", email: "", adresse: "" });
  const [errorProp, setErrorProp] = useState("");

  // Modal animal (attribué)
  const [openAnimal, setOpenAnimal] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [animalForm, setAnimalForm] = useState({ nom: "", espece: "", race: "", sexe: "", date_naissance: "" });
  const [errorAnimal, setErrorAnimal] = useState("");

  async function load(search = q) {
    setLoading(true);
    try {
      const data = await proprietairesApi.list(search);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(""); }, []);

  function openAddOwner() {
    setPropForm({ nom: "", prenom: "", telephone: "", email: "", adresse: "" });
    setErrorProp("");
    setOpenProp(true);
  }

  async function submitOwner(e) {
    e.preventDefault();
    setErrorProp("");
    try {
      await proprietairesApi.create(propForm);
      setOpenProp(false);
      load("");
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstKey = Object.keys(errors)[0];
        setErrorProp(errors[firstKey][0]);
      } else {
        setErrorProp(err.response?.data?.message || "Erreur création propriétaire");
      }
    }
  }

  function openAddAnimal(owner) {
    setSelectedOwner(owner);
    setAnimalForm({ nom: "", espece: "", race: "", sexe: "", date_naissance: "" });
    setErrorAnimal("");
    setOpenAnimal(true);
  }

  async function submitAnimal(e) {
    e.preventDefault();
    setErrorAnimal("");
    try {
      await animauxApi.create({
        ...animalForm,
        proprietaire_id: selectedOwner.id,
      });
      setOpenAnimal(false);
      // option: reload propriétaires ou juste afficher message
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const firstKey = Object.keys(errors)[0];
        setErrorAnimal(errors[firstKey][0]);
      } else {
        setErrorAnimal(err.response?.data?.message || "Erreur création animal");
      }
    }
  }

  return (
    <MainLayout>
      <div className="page-header">
        <h2>Propriétaires</h2>

        <div className="actions">
          <input
            className="search"
            placeholder="Rechercher (nom ou téléphone)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button className="btn" onClick={() => load(q)}>Rechercher</button>
          <button className="btn btn-green" onClick={openAddOwner}>Ajouter propriétaire</button>
        </div>
      </div>

      {loading && <p>Chargement...</p>}

      <div className="cards-grid">
        {items.map((p) => (
          <div key={p.id} className="item-card">
            <div className="item-title">{p.nom} {p.prenom}</div>
            <div className="item-info">📞 {p.telephone || "-"}</div>
            <div className="item-info">✉️ {p.email || "-"}</div>

            <button className="btn btn-purple" onClick={() => openAddAnimal(p)}>
              Ajouter animal
            </button>
          </div>
        ))}
      </div>

      {/* MODAL Ajouter Propriétaire */}
      <Modal open={openProp} title="Ajouter un propriétaire" onClose={() => setOpenProp(false)}>
        <form onSubmit={submitOwner} className="modal-form">
          <input placeholder="Nom *" value={propForm.nom} onChange={(e)=>setPropForm({...propForm, nom:e.target.value})} required />
          <input placeholder="Prénom" value={propForm.prenom} onChange={(e)=>setPropForm({...propForm, prenom:e.target.value})} />
          <input placeholder="Téléphone" value={propForm.telephone} onChange={(e)=>setPropForm({...propForm, telephone:e.target.value})} />
          <input placeholder="Email" value={propForm.email} onChange={(e)=>setPropForm({...propForm, email:e.target.value})} />
          <input placeholder="Adresse" value={propForm.adresse} onChange={(e)=>setPropForm({...propForm, adresse:e.target.value})} />

          {errorProp && <p className="error">{errorProp}</p>}

          <div className="modal-actions">
            <button type="button" className="btn" onClick={() => setOpenProp(false)}>Annuler</button>
            <button type="submit" className="btn btn-green">Créer</button>
          </div>
        </form>
      </Modal>

      {/* MODAL Ajouter Animal (attribué au propriétaire) */}
      <Modal
        open={openAnimal}
        title={selectedOwner ? `Ajouter un animal à ${selectedOwner.nom}` : "Ajouter un animal"}
        onClose={() => setOpenAnimal(false)}
      >
        <form onSubmit={submitAnimal} className="modal-form">
          <input placeholder="Nom *" value={animalForm.nom} onChange={(e)=>setAnimalForm({...animalForm, nom:e.target.value})} required />
          <input placeholder="Espèce * (ex: Chat, Chien)" value={animalForm.espece} onChange={(e)=>setAnimalForm({...animalForm, espece:e.target.value})} required />
          <input placeholder="Race" value={animalForm.race} onChange={(e)=>setAnimalForm({...animalForm, race:e.target.value})} />
          <input placeholder="Sexe (M/F)" value={animalForm.sexe} onChange={(e)=>setAnimalForm({...animalForm, sexe:e.target.value})} />
          <input type="date" value={animalForm.date_naissance} onChange={(e)=>setAnimalForm({...animalForm, date_naissance:e.target.value})} />

          {errorAnimal && <p className="error">{errorAnimal}</p>}

          <div className="modal-actions">
            <button type="button" className="btn" onClick={() => setOpenAnimal(false)}>Annuler</button>
            <button type="submit" className="btn btn-green">Créer</button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}
