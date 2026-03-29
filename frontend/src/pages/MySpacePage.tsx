import { useEffect, useMemo, useState } from "react";
import { deleteMyFile, getMyFiles } from "../services/fileApi";
import type { FileHistoryResponse } from "../types/file";
import { AppCallout } from "../components/ui/AppCallout";
import { AppSegmentedControl } from "../components/ui/AppSegmentedControl";

type FilterId = "all" | "active" | "expired";

const filterItems = [
  { id: "all", label: "Tous" },
  { id: "active", label: "Actifs" },
  { id: "expired", label: "Expiré" },
];

function formatExpire(expiresAt: string, expired: boolean): string {
  const date = new Date(expiresAt);
  if (Number.isNaN(date.getTime())) return expiresAt;

  if (expired) {
    return "Expiré";
  }

  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const dayMs = 1000 * 60 * 60 * 24;
  const days = Math.ceil(diffMs / dayMs);

  if (days <= 0) return "Expire aujourd'hui";
  if (days === 1) return "Expire demain";
  return `Expire dans ${days} jours`;
}

function FileIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

function CloudUploadIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M17.5 19a4.5 4.5 0 1 0-1.4-8.78A6 6 0 0 0 4 11.5 4.5 4.5 0 0 0 6.5 19h11Z" />
      <path d="M12 12v8" />
      <path d="M9 15l3-3 3 3" />
    </svg>
  );
}

export default function MySpacePage() {
  const [files, setFiles] = useState<FileHistoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterId>("all");

  useEffect(() => {
    async function loadFiles() {
      try {
        setLoading(true);
        setError(null);
        const data = await getMyFiles();
        setFiles(data);
      } catch {
        setError("Impossible de charger l’historique des fichiers.");
      } finally {
        setLoading(false);
      }
    }

    loadFiles();
  }, []);

  async function handleDelete(fileId: number) {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer ce fichier ?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(fileId);
      setError(null);
      await deleteMyFile(fileId);
      setFiles((currentFiles) =>
        currentFiles.filter((file) => file.id !== fileId)
      );
    } catch {
      setError("Impossible de supprimer ce fichier.");
    } finally {
      setDeletingId(null);
    }
  }

  const visibleFiles = useMemo(() => {
    if (filter === "active") return files.filter((f) => !f.expired);
    if (filter === "expired") return files.filter((f) => f.expired);
    return files;
  }, [files, filter]);

  // ---------- Loading ----------
  if (loading) {
    return (
      <div className="ds-feature">
        <header className="ds-feature__hero">
          <p className="ds-feature__eyebrow">Mon espace</p>
          <h1 className="ds-feature__title">Mes fichiers</h1>
        </header>
        <section className="ds-card ds-card--wide">
          <p className="ds-card__subtitle" style={{ textAlign: "center" }}>
            Chargement de l’historique...
          </p>
        </section>
      </div>
    );
  }

  // ---------- Error ----------
  if (error && files.length === 0) {
    return (
      <div className="ds-feature">
        <header className="ds-feature__hero">
          <p className="ds-feature__eyebrow">Mon espace</p>
          <h1 className="ds-feature__title">Mes fichiers</h1>
        </header>
        <section className="ds-card ds-card--wide">
          <AppCallout variant="error" announce>
            {error}
          </AppCallout>
        </section>
      </div>
    );
  }

  // ---------- Empty state (same hero as homepage) ----------
  if (files.length === 0) {
    return (
      <div className="ds-feature">
        <div className="ds-hero">
          <h1 className="ds-hero__title">
            Aucun fichier envoyé pour le moment.
          </h1>
          <a
            href="/upload"
            className="ds-hero__cta"
            aria-label="Téléverser un fichier"
          >
            <span className="ds-hero__cta-icon" aria-hidden="true">
              <CloudUploadIcon />
            </span>
          </a>
        </div>
      </div>
    );
  }

  // ---------- Files list ----------
  return (
    <div className="ds-feature">
      <header className="ds-feature__hero">
        <p className="ds-feature__eyebrow">Mon espace</p>
        <h1 className="ds-feature__title">Mes fichiers</h1>
      </header>

      <section className="ds-card ds-card--wide" aria-label="Mes fichiers">
        <div className="ds-myspace-toolbar">
          <AppSegmentedControl
            aria-label="Filtrer les fichiers"
            items={filterItems}
            value={filter}
            onChange={(v) => setFilter(v as FilterId)}
          />
        </div>

        {error && (
          <AppCallout variant="error" announce>
            {error}
          </AppCallout>
        )}

        {visibleFiles.length === 0 ? (
          <p className="ds-empty__text" style={{ textAlign: "center" }}>
            Aucun fichier dans cette catégorie.
          </p>
        ) : (
          <ul className="ds-files">
            {visibleFiles.map((file) => {
              const isDeleting = deletingId === file.id;
              const expireText = formatExpire(file.expiresAt, file.expired);

              return (
                <li key={file.id} className="ds-file-row">
                  <div className="ds-file-row__lead">
                    <span
                      className="ds-file-row__icon"
                      aria-hidden="true"
                    >
                      <FileIcon />
                    </span>
                    <div className="ds-file-row__main">
                      <span className="ds-file-row__name">
                        {file.originalFilename}
                      </span>
                      <span className="ds-file-row__expire">
                        <span data-testid={`status-${file.id}`}>
                          {file.expired ? "Expiré" : "Valide"}
                        </span>
                        <span aria-hidden="true"> · </span>
                        {expireText}
                      </span>
                    </div>
                  </div>

                  <div className="ds-file-row__actions">
                    <span className="ds-visually-hidden">
                      {file.passwordProtected ? "Protégé" : "Non protégé"}
                    </span>
                    {file.passwordProtected && (
                      <span
                        className="ds-file-row__lock"
                        title="Fichier protégé par mot de passe"
                        aria-hidden="true"
                      >
                        <LockIcon />
                      </span>
                    )}

                    {file.expired ? (
                      <span className="ds-file-row__expired-msg">
                        Ce fichier a expiré, il n'est plus stocké chez nous
                      </span>
                    ) : (
                      <>
                        <button
                          type="button"
                          className="app-button app-button--secondary app-button--sm"
                          onClick={() => handleDelete(file.id)}
                          disabled={isDeleting}
                        >
                          <span className="app-button__label">
                            {isDeleting ? "Suppression..." : "Supprimer"}
                          </span>
                        </button>
                        <a
                          href={file.downloadUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="app-button app-button--primary app-button--sm"
                          style={{ textDecoration: "none" }}
                        >
                          <span className="app-button__label">Accéder</span>
                        </a>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
