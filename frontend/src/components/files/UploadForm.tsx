import { useRef, useState } from "react";
import type React from "react";
import type { UploadFileResponse } from "../../types/file";
import { uploadAnonymousFile, uploadFile } from "../../services/fileApi";
import { AppCallout } from "../ui/AppCallout";
import { AppSelect } from "../ui/AppSelect";

type UploadFormProps = {
  anonymous?: boolean;
};

const expirationOptions = [
  { id: "1", label: "Une journée" },
  { id: "3", label: "3 jours" },
  { id: "7", label: "Une semaine" },
];

function expirationLabel(days: string): string {
  switch (days) {
    case "1":
      return "une journée";
    case "3":
      return "trois jours";
    case "7":
    default:
      return "une semaine";
  }
}

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} o`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} Ko`;
  if (size < 1024 * 1024 * 1024)
    return `${(size / (1024 * 1024)).toFixed(1)} Mo`;
  return `${(size / (1024 * 1024 * 1024)).toFixed(1)} Go`;
}

function FileIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function UploadForm({ anonymous = true }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [expirationDays, setExpirationDays] = useState<string>("7");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<UploadFileResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files?.[0] ?? null;
    setFile(picked);
    setError("");
    setResult(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Sélectionne un fichier.");
      return;
    }

    try {
      setLoading(true);

      const data = anonymous
        ? await uploadAnonymousFile({
            file,
            expirationDays: Number(expirationDays),
            password: password.trim() || undefined,
          })
        : await uploadFile({
            file,
            expirationDays: Number(expirationDays),
            password: password.trim() || undefined,
          });

      setResult(data);
      setPassword("");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Erreur lors de l'upload.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyLink() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.downloadUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore clipboard errors
    }
  }

  function handleNewUpload() {
    setFile(null);
    setResult(null);
    setPassword("");
    setExpirationDays("7");
    setError("");
  }

  // Hidden file input — always present so the picker is always reachable
  const hiddenFileInput = (
    <input
      ref={fileInputRef}
      id="file-input"
      type="file"
      aria-label="Fichier"
      className="ds-visually-hidden"
      onChange={handleFileChange}
    />
  );

  // ---------- Success state ----------
  if (result) {
    return (
      <div className="ds-feature">
        {hiddenFileInput}

        <section
          className="ds-card ds-card--upload"
          aria-label="Fichier téléversé"
        >
          <h2 className="ds-card__title-bold">Ajouter un fichier</h2>

          <div className="ds-file-selected" style={{ marginBottom: 16 }}>
            <span className="ds-file-selected__icon" aria-hidden="true">
              <FileIcon />
            </span>
            <span className="ds-file-selected__body">
              <span className="ds-file-selected__name">
                {result.originalFilename}
              </span>
              <span className="ds-file-selected__meta">Téléversé</span>
            </span>
          </div>

          <p className="ds-card__success-text">
            Félicitations, ton fichier sera conservé chez nous pendant{" "}
            {expirationLabel(expirationDays)} !
          </p>

          <a
            href={result.downloadUrl}
            target="_blank"
            rel="noreferrer"
            className="ds-link-display"
          >
            {result.downloadUrl}
          </a>

          <button
            type="button"
            className="app-button app-button--primary app-button--md app-button--full-width"
            onClick={handleCopyLink}
          >
            <span className="app-button__label">
              {copied ? "Lien copié !" : "Copier le lien"}
            </span>
          </button>

          <button
            type="button"
            className="ds-link-button"
            onClick={handleNewUpload}
            style={{ marginTop: 12, alignSelf: "center" }}
          >
            Téléverser un autre fichier
          </button>
        </section>
      </div>
    );
  }

  // ---------- Form state (always shown when no result) ----------
  return (
    <div className="ds-feature">
      {hiddenFileInput}

      <section
        className="ds-card ds-card--upload"
        aria-label="Formulaire d'envoi"
      >
        <h2 className="ds-card__title-bold">Ajouter un fichier</h2>

        <form className="ds-form" onSubmit={handleSubmit}>
          {file ? (
            <div className="ds-file-selected">
              <span className="ds-file-selected__icon" aria-hidden="true">
                <FileIcon />
              </span>
              <span className="ds-file-selected__body">
                <span className="ds-file-selected__name">{file.name}</span>
                <span className="ds-file-selected__meta">
                  {formatFileSize(file.size)}
                </span>
              </span>
              <button
                type="button"
                className="ds-link-button"
                onClick={openFilePicker}
              >
                Changer
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="ds-pick-file"
              onClick={openFilePicker}
              aria-controls="file-input"
            >
              <span className="ds-pick-file__icon" aria-hidden="true">
                <PlusIcon />
              </span>
              <span className="ds-pick-file__body">
                <span className="ds-pick-file__title">
                  Sélectionner un fichier
                </span>
                <span className="ds-pick-file__hint">
                  Clique pour choisir un fichier sur ton appareil
                </span>
              </span>
            </button>
          )}

          <div className="ds-field">
            <label htmlFor="password-input" className="ds-label">
              Mot de passe
            </label>
            <input
              id="password-input"
              className="ds-input"
              type="password"
              value={password}
              minLength={6}
              placeholder="Optionnel"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <AppSelect
            label="Expiration"
            items={expirationOptions}
            value={expirationDays}
            onChange={(key) =>
              setExpirationDays(key ? String(key) : "7")
            }
          />

          {error && (
            <AppCallout variant="error" announce>
              {error}
            </AppCallout>
          )}

          <button
            type="submit"
            className="app-button app-button--primary app-button--md app-button--full-width"
            disabled={loading}
          >
            {loading && (
              <span className="app-button__spinner" aria-hidden="true" />
            )}
            <span className="app-button__label">
              {loading ? "Envoi..." : "Téléverser"}
            </span>
          </button>
        </form>
      </section>
    </div>
  );
}
