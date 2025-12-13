// src/layout/MainLayout.jsx
import { NavLink } from "react-router-dom";
import "./mainLayout.css";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";



export default function MainLayout({ children }) {
  const { user } = useContext(AuthContext);
  console.log("user",user);
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">VeteClinix</div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className="sidebar-link">
            Dashboard
          </NavLink>
          <NavLink to="/proprietaires" className="sidebar-link">
            Propriétaires
          </NavLink>
          <NavLink to="/animaux" className="sidebar-link">
            Animaux
          </NavLink>
          <NavLink to="/consultations" className="sidebar-link">
            Consultations
          </NavLink>
          {user?.role === "admin" && (
          <NavLink to="/veterinaires" className="sidebar-link">
            Vétérinaires
          </NavLink>
        )}
        </nav>

        <button
          className="sidebar-logout"
          onClick={() => {
            // tu peux appeler ton logout du contexte ici si tu veux
            window.location.href = "/login";
          }}
        >
          Déconnexion
        </button>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
