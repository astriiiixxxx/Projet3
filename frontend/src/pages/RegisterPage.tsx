import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { AppCallout } from "../components/ui/AppCallout";
import { AppTextField } from "../components/ui/AppTextField";

export default function RegisterPage() {
  const { register } = useAuth();
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
      await register({ email, password });
      navigate("/login");
    } catch (error: any) {
      console.error("REGISTER ERROR", error?.response?.data);

      setError(
        error?.response?.data?.message ??
          error?.response?.data?.fields?.email ??
          error?.response?.data?.fields?.password ??
          "Impossible de créer le compte."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="ds-feature">
      <header className="ds-feature__hero">
        <p className="ds-feature__eyebrow">DataShare</p>
        <h1 className="ds-feature__title">Créer un compte</h1>
        <p className="ds-feature__subtitle">
          Inscris-toi pour conserver l'historique de tes envois et gérer tes
          liens.
        </p>
      </header>

      <section className="ds-card" aria-label="Formulaire d'inscription">
        <div className="ds-card__header">
          <h2 className="ds-card__title">Inscription</h2>
          <p className="ds-card__subtitle">
            C'est rapide, et ça reste entre nous.
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
            autoComplete="new-password"
            placeholder="Au moins 6 caractères"
            description="6 caractères minimum. Choisis un mot de passe unique."
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
                {isLoading ? "Création..." : "Créer un compte"}
              </span>
            </button>
          </div>
        </form>

        <p className="ds-card__footer">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </section>
    </div>
  );
}
