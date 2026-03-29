import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  downloadPublicFile,
  getPublicFile,
} from "../services/fileApi";
import type { ApiErrorResponse, PublicFileResponse } from "../types/file";
import { AppCallout } from "../components/ui/AppCallout";

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} o`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} Ko`;
  if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} Mo`;
  }
  return `${(size / (1024 * 1024 * 1024)).toFixed(2)} Go`;
}

function formatDate(date: string): string {
  return new Date(date).toLocaleString("fr-FR");
}

export default function DownloadPage() {
  const { token } = useParams<{ token: string }>();

  const [file, setFile] = useState<PublicFileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPublicFile() {
      if (!token) {
        setErrorMessage("Lien invalide.");
        setLoading(false);
        return;
      }

      try {
        const data = await getPublicFile(token);
        setFile(data);
      } catch (error) {
        if (axios.isAxiosError<ApiErrorResponse>(error)) {
          const status = error.response?.status;
          const message = error.response?.data?.message;

          if (status === 404) {
            setErrorMessage(message ?? "Fichier introuvable.");
          } else if (status === 410) {
            setErrorMessage(message ?? "Ce lien a expiré.");
          } else {
            setErrorMessage(message ?? "Une erreur est survenue.");
          }
        } else {
          setErrorMessage("Une erreur inattendue est survenue.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchPublicFile();
  }, [token]);

  async function handleDownload() {
    if (!token || !file) {
      return;
    }

    if (file.passwordProtected && !password.trim()) {
      setDownloadError(
        "Le mot de passe est requis pour télécharger ce fichier."
      );
      return;
    }

    setDownloadError(null);
    setDownloading(true);

    try {
      const blob = await downloadPublicFile(token, password);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.originalFilename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        if (error.response?.data instanceof Blob) {
          try {
            const text = await error.response.data.text();
            const parsed = JSON.parse(text) as ApiErrorResponse;

            if (status === 401) {
              setDownloadError(parsed.message ?? "Mot de passe invalide.");
            } else if (status === 404) {
              setDownloadError(parsed.message ?? "Fichier introuvable.");
            } else if (status === 410) {
              setDownloadError(parsed.message ?? "Ce lien a expiré.");
            } else {
              setDownloadError(
                parsed.message ??
                  "Une erreur est survenue pendant le téléchargement."
              );
            }
          } catch {
            if (status === 401) {
              setDownloadError("Mot de passe invalide.");
            } else if (status === 404) {
              setDownloadError("Fichier introuvable.");
            } else if (status === 410) {
              setDownloadError("Ce lien a expiré.");
            } else {
              setDownloadError(
                "Une erreur est survenue pendant le téléchargement."
              );
            }
          }
        } else {
          setDownloadError(
            "Une erreur est survenue pendant le téléchargement."
          );
        }
      } else {
        setDownloadError(
          "Une erreur inattendue est survenue pendant le téléchargement."
        );
      }
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return (
      <div className="ds-feature">
        <header className="ds-feature__hero">
          <p className="ds-feature__eyebrow">Téléchargement</p>
          <h1 className="ds-feature__title">Préparation du fichier…</h1>
        </header>
        <section className="ds-card" aria-label="Chargement">
          <p className="ds-card__subtitle" style={{ textAlign: "center" }}>
            Chargement du fichier...
          </p>
        </section>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="ds-feature">
        <header className="ds-feature__hero">
          <p className="ds-feature__eyebrow">Téléchargement</p>
          <h1 className="ds-feature__title">Téléchargement</h1>
        </header>
        <section className="ds-card" aria-label="Erreur">
          <AppCallout variant="error" announce>
            {errorMessage}
          </AppCallout>
        </section>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="ds-feature">
        <header className="ds-feature__hero">
          <p className="ds-feature__eyebrow">Téléchargement</p>
          <h1 className="ds-feature__title">Téléchargement</h1>
        </header>
        <section className="ds-card">
          <p>Aucune donnée disponible.</p>
        </section>
      </div>
    );
  }

  const isExpired = file.expired;

  return (
    <div className="ds-feature">
      <header className="ds-feature__hero">
        <p className="ds-feature__eyebrow">Téléchargement</p>
        <h1 className="ds-feature__title">Télécharger un fichier</h1>
        <p className="ds-feature__subtitle">
          Voici les informations du fichier partagé. Vérifie-les avant
          téléchargement.
        </p>
      </header>

      <section
        className="ds-card"
        aria-label="Téléchargement de fichier"
      >
        <div className="ds-card__header">
          <h2 className="ds-card__title">{file.originalFilename}</h2>
          <p className="ds-card__subtitle">
            {file.mimeType || "Type inconnu"} · {formatFileSize(file.size)}
          </p>
        </div>

        <dl className="ds-details">
          <dt>Type</dt>
          <dd>{file.mimeType || "Inconnu"}</dd>

          <dt>Taille</dt>
          <dd>{formatFileSize(file.size)}</dd>

          <dt>Créé le</dt>
          <dd>{formatDate(file.createdAt)}</dd>

          <dt>Expire le</dt>
          <dd>
            {formatDate(file.expiresAt)}{" "}
            <span
              className={
                isExpired ? "ds-badge ds-badge--warn" : "ds-badge ds-badge--ok"
              }
            >
              {isExpired ? "Expiré" : "Valide"}
            </span>
          </dd>

          <dt>Protection</dt>
          <dd>
            {file.passwordProtected ? (
              <span className="ds-badge ds-badge--warn">
                Mot de passe requis
              </span>
            ) : (
              <span className="ds-badge ds-badge--muted">Aucune</span>
            )}
          </dd>
        </dl>

        {file.passwordProtected && (
          <div className="ds-field" style={{ marginTop: 24 }}>
            <label htmlFor="download-password" className="ds-label">
              Mot de passe
            </label>
            <input
              id="download-password"
              className="ds-input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Entrez le mot de passe"
            />
          </div>
        )}

        {downloadError && (
          <div style={{ marginTop: 16 }}>
            <AppCallout variant="error" announce>
              {downloadError}
            </AppCallout>
          </div>
        )}

        <div className="ds-form-actions" style={{ marginTop: 24 }}>
          <button
            type="button"
            className="app-button app-button--dark app-button--md app-button--full-width"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading && (
              <span className="app-button__spinner" aria-hidden="true" />
            )}
            <span className="app-button__label">
              {downloading
                ? "Téléchargement..."
                : "Télécharger le fichier"}
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}
