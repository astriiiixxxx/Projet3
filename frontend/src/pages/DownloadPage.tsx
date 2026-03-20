import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  downloadPublicFile,
  getPublicFile,
} from "../services/fileApi";
import type { ApiErrorResponse, PublicFileResponse } from "../types/file";

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
      setDownloadError("Le mot de passe est requis pour télécharger ce fichier.");
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
              setDownloadError(parsed.message ?? "Une erreur est survenue pendant le téléchargement.");
            }
          } catch {
            if (status === 401) {
              setDownloadError("Mot de passe invalide.");
            } else if (status === 404) {
              setDownloadError("Fichier introuvable.");
            } else if (status === 410) {
              setDownloadError("Ce lien a expiré.");
            } else {
              setDownloadError("Une erreur est survenue pendant le téléchargement.");
            }
          }
        } else {
          setDownloadError("Une erreur est survenue pendant le téléchargement.");
        }
      } else {
        setDownloadError("Une erreur inattendue est survenue pendant le téléchargement.");
      }
    } finally {
      setDownloading(false);
    }
  }

  if (loading) {
    return <p>Chargement du fichier...</p>;
  }

  if (errorMessage) {
    return (
      <section>
        <h1>Téléchargement</h1>
        <p>{errorMessage}</p>
      </section>
    );
  }

  if (!file) {
    return (
      <section>
        <h1>Téléchargement</h1>
        <p>Aucune donnée disponible.</p>
      </section>
    );
  }

  return (
    <section>
      <h1>Télécharger un fichier</h1>

      <div>
        <p>
          <strong>Nom :</strong> {file.originalFilename}
        </p>
        <p>
          <strong>Type :</strong> {file.mimeType || "Inconnu"}
        </p>
        <p>
          <strong>Taille :</strong> {formatFileSize(file.size)}
        </p>
        <p>
          <strong>Créé le :</strong> {formatDate(file.createdAt)}
        </p>
        <p>
          <strong>Expire le :</strong> {formatDate(file.expiresAt)}
        </p>
        <p>
          <strong>Protection :</strong>{" "}
          {file.passwordProtected ? "Mot de passe requis" : "Aucune"}
        </p>
      </div>

      {file.passwordProtected && (
        <div>
          <label htmlFor="download-password">Mot de passe</label>
          <input
            id="download-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Entrez le mot de passe"
          />
        </div>
      )}

      {downloadError && <p>{downloadError}</p>}

      <button type="button" onClick={handleDownload} disabled={downloading}>
        {downloading ? "Téléchargement..." : "Télécharger le fichier"}
      </button>
    </section>
  );
}