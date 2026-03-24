import { useEffect, useState } from "react";
import { deleteMyFile, getMyFiles } from "../services/fileApi";
import type { FileHistoryResponse } from "../types/file";

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("fr-FR");
}

function formatSize(size: number): string {
  if (size < 1024) {
    return `${size} o`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} Ko`;
  }

  if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
  }

  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} Go`;
}

export default function MySpacePage() {
  const [files, setFiles] = useState<FileHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadFiles() {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyFiles();
        setFiles(data);
      } catch (err) {
        setError("Impossible de charger l’historique des fichiers.");
      } finally {
        setLoading(false);
      }
    }

    loadFiles();
  }, []);

  async function handleDelete(fileId: number) {
    const confirmed = window.confirm("Voulez-vous vraiment supprimer ce fichier ?");

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(fileId);
      setError(null);
      await deleteMyFile(fileId);
      setFiles((currentFiles) => currentFiles.filter((file) => file.id !== fileId));
    } catch (err) {
      setError("Impossible de supprimer ce fichier.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Mon espace</h1>
      <h2>Historique des fichiers</h2>

      {loading && <p>Chargement de l’historique...</p>}

      {!loading && error && <p role="alert">{error}</p>}

      {!loading && !error && files.length === 0 && (
        <p>Aucun fichier envoyé pour le moment.</p>
      )}

      {!loading && !error && files.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
          <thead>
            <tr>
              <th align="left">Nom</th>
              <th align="left">Taille</th>
              <th align="left">Date d’envoi</th>
              <th align="left">Date d’expiration</th>
              <th align="left">État</th>
              <th align="left">Protection</th>
              <th align="left">Lien</th>
              <th align="left">Action</th>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id}>
                <td>{file.originalFilename}</td>
                <td>{formatSize(file.size)}</td>
                <td>{formatDate(file.createdAt)}</td>
                <td>{formatDate(file.expiresAt)}</td>
                <td>{file.expired ? "Expiré" : "Valide"}</td>
                <td>{file.passwordProtected ? "Protégé" : "Non protégé"}</td>
                <td>
                  <a
                    href={file.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ouvrir
                  </a>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => handleDelete(file.id)}
                    disabled={deletingId === file.id}
                  >
                    {deletingId === file.id ? "Suppression..." : "Supprimer"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}