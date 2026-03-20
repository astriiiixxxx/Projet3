import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit: React.SubmitEventHandler<HTMLFormElement> = async (
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

  const handleEmailChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setPassword(event.target.value);
  };

  return (
    <main>
      <h1>Créer un compte</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            required
          />
        </div>

        <div>
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={isLoading}>
          {isLoading ? "Création..." : "Créer un compte"}
        </button>
      </form>

      <p>
        Déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </main>
  );
}