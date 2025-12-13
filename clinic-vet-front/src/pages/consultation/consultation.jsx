// src/pages/ConsultationsPage.jsx
import MainLayout from "../../layout/mainLayout";
import "../../styles/ownersAnimals.css";

export default function ConsultationsPage() {
  return (
    <MainLayout>
      <div className="page-header">
        <div className="page-hello">Bonjour Dr Mohammed</div>
        <h2 className="page-title">Liste des consultations</h2>
        <button className="btn-add">Ajouter consultation</button>
      </div>

      {/* plus tard : cartes de consultations */}
      <p>Contenu des consultations à venir...</p>
    </MainLayout>
  );
}
