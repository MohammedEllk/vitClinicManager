import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import MainLayout from "../layout/mainLayout";
import "../styles/dashboard.css";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  return (
    <MainLayout>
      <div className="dash-header">
        <h1>Dashboard clinique vétérinaire</h1>
        <p>Bienvenue, Dr {user?.name}</p>
      </div>

      <div className="dash-cards">
        <div className="dash-card">
          <div className="dash-card-label">Propriétaires</div>
          <div className="dash-card-value">24</div>
          <div className="dash-card-sub">Propriétaires enregistrés</div>
        </div>

        <div className="dash-card">
          <div className="dash-card-label">Animaux</div>
          <div className="dash-card-value">56</div>
          <div className="dash-card-sub">Dossiers actifs</div>
        </div>

        <div className="dash-card">
          <div className="dash-card-label">Consultations du jour</div>
          <div className="dash-card-value">7</div>
          <div className="dash-card-sub">À venir aujourd'hui</div>
        </div>
      </div>
    </MainLayout>
  );
}