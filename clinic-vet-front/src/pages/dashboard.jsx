import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import MainLayout from "../layout/mainLayout";
import "../styles/dashboard.css";
import api from "../services/api/axiosClient"; 

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({
    proprietaires: 0,
    animaux: 0,
    consultations_du_jour: 0,
    consultations_total: 0,
  });

  const [agenda, setAgenda] = useState(null);
  const [agendaLoading, setAgendaLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, agendaRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/dashboard/agenda-week"),
        ]);

        const s = statsRes.data;
        setStats({
          proprietaires: s.proprietaires ?? 0,
          animaux: s.animaux ?? 0,
          consultations_du_jour: s.consultations_du_jour ?? 0,
          consultations_total: s.consultations_total ?? 0,
        });

        setAgenda(agendaRes.data);
      } catch (e) {
        console.error(e);
      } finally {
        setAgendaLoading(false);
      }
    };
    load();
  }, []);

  return (
    <MainLayout>
      <div className="dash-header">
        <h1>Dashboard clinique vétérinaire</h1>
        <p>Bienvenue, Dr {user?.name}</p>
      </div>

      <div className="dash-cards">
        <div className="dash-card">
          <div className="dash-card-label">Propriétaires</div>
          <div className="dash-card-value">{stats.proprietaires}</div>
          <div className="dash-card-sub">Propriétaires enregistrés</div>
        </div>

        <div className="dash-card">
          <div className="dash-card-label">Animaux</div>
          <div className="dash-card-value">{stats.animaux}</div>
          <div className="dash-card-sub">Dossiers actifs</div>
        </div>

        <div className="dash-card">
          <div className="dash-card-label">Consultations du jour</div>
          <div className="dash-card-value">{stats.consultations_du_jour}</div>
          <div className="dash-card-sub">À venir aujourd&apos;hui</div>
        </div>

        <div className="dash-card">
          <div className="dash-card-label">Historique consultations</div>
          <div className="dash-card-value">{stats.consultations_total}</div>
          <div className="dash-card-sub">Consultations enregistrées</div>
        </div>
      </div>

      {/* ✅ AGENDA SEMAINE */}
      <div className="agenda-card">
        <div className="agenda-header">
          <div className="agenda-title">Agenda</div>
          {agenda?.weekStart && (
            <div className="agenda-range">
              Semaine : {agenda.weekStart} → {agenda.weekEnd}
            </div>
          )}
        </div>

        {agendaLoading ? (
          <div className="agenda-empty">Chargement...</div>
        ) : !agenda ? (
          <div className="agenda-empty">Impossible de charger l’agenda.</div>
        ) : (
          <div className="agenda-grid">
            {Object.values(agenda.days).map((day) => (
              <div className="agenda-day" key={day.label}>
                <div className="agenda-day-title">{day.label}</div>

                {day.items.length === 0 ? (
                  <div className="agenda-empty-line">Aucune consultation</div>
                ) : (
                  <ul className="agenda-list">
                    {day.items.map((it) => (
                      <li className="agenda-item" key={it.id}>
                        <span className="agenda-time">{it.time}</span>
                        <span className="agenda-text">
                          {it.animal} — {it.motif || "Consultation"}
                          {it.proprietaire ? ` (prop: ${it.proprietaire})` : ""}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
