import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { AppCallout } from "../components/ui/AppCallout";
import { AppTextField } from "../components/ui/AppTextField";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
    event
  ) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate("/my-space");
    } catch (error: any) {
      console.error("LOGIN ERROR", error?.response?.data);

      setError(
        error?.response?.data?.message ?? "Email ou mot de passe invalide."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ds-feature">
      <header className="ds-feature__hero">
        <p className="ds-feature__eyebrow">DataShare</p>
        <h1 className="ds-feature__title">Connexion</h1>
        <p className="ds-feature__subtitle">
          Connecte-toi pour retrouver tes fichiers et gérer tes liens.
        </p>
      </header>

      <section className="ds-card" aria-label="Formulaire de connexion">
        <div className="ds-card__header">
          <h2 className="ds-card__title">Se connecter</h2>
          <p className="ds-card__subtitle">
            Entre tes identifiants pour accéder à ton espace.
          </p>
        </div>

        <form className="ds-form" onSubmit={handleSubmit} noValidate>
          <AppTextField
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="nom@exemple.com"
            value={email}
            onChange={setEmail}
            isRequired
          />

          <AppTextField
            label="Mot de passe"
            type="password"
            autoComplete="current-password"
            placeholder="Votre mot de passe"
            value={password}
            onChange={setPassword}
            isRequired
          />

          {error && (
            <AppCallout variant="error" announce>
              {error}
            </AppCallout>
          )}

          <div className="ds-form-actions">
            <button
              type="submit"
              className="app-button app-button--dark app-button--md app-button--full-width"
              disabled={isLoading}
            >
              {isLoading && (
                <span className="app-button__spinner" aria-hidden="true" />
              )}
              <span className="app-button__label">
                {isLoading ? "Connexion..." : "Se connecter"}
              </span>
            </button>
          </div>
        </form>

        <p className="ds-card__footer">
          Pas encore de compte ? <Link to="/register">Créer un compte</Link>
        </p>
      </section>
    </div>
  );
}
