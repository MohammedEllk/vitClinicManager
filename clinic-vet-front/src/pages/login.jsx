// src/pages/Login.jsx
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css";

// Mets ton image Figma ici (par ex. dans src/assets/login-vet.png)
import vetImage from "../assets/clinicVet.png"; // adapte le nom si besoin

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      console.error(err.response?.data || err);
      setError("Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="login-page">
      {/* Colonne gauche : formulaire */}
      <div className="login-left">
        <div className="login-card">
          <h1 className="login-title">Connexion</h1>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="login-field">
              <label>Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="login-error">{error}</p>}

            <button type="submit" className="login-button">
              Se connecter
            </button>
          </form>

        </div>
      </div>

      {/* Colonne droite : illustration */}
      <div className="login-right">
        <div className="login-hero">
          <img src={vetImage} alt="Clinique vétérinaire" className="login-hero-img" />
          <div className="login-hero-text">
            <h2>Clinique vétérinaire</h2>
            <p>Suivi des propriétaires, animaux et consultations en toute simplicité.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
