import { useState } from "react";
import type React from "react";
import type { UploadFileResponse } from "../../types/file";
import { uploadFile } from "../../services/fileApi";

export function UploadForm() {
    const [file, setFile] = useState<File | null>(null);
    const [expirationDays, setExpirationDays] = useState(7);
    const [password, setPassword] = useState("");
    const [result, setResult] = useState<UploadFileResponse | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
        e.preventDefault();
        setError("");
        setResult(null);

        if (!file) {
            setError("Sélectionne un fichier.");
            return;
        }

        try {
            setLoading(true);

            const data = await uploadFile({
                file,
                expirationDays,
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

    return (
        <div>
            <h2>Envoyer un fichier</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="file-input">Fichier</label>
                    <input
                        id="file-input"
                        type="file"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setFile(e.target.files?.[0] ?? null)
                        }
                    />
                </div>

                <div>
                    <label htmlFor="expiration-days">Expiration (jours)</label>
                    <input
                        id="expiration-days"
                        type="number"
                        min={1}
                        max={7}
                        value={expirationDays}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setExpirationDays(Number(e.target.value))
                        }
                    />
                </div>

                <div>
                    <label htmlFor="password-input">Mot de passe optionnel</label>
                    <input
                        id="password-input"
                        type="password"
                        value={password}
                        minLength={6}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setPassword(e.target.value)
                        }
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Envoi..." : "Uploader"}
                </button>
            </form>

            {error && <p role="alert">{error}</p>}

            {result && (
                <div>
                    <p>Fichier envoyé : {result.originalFilename}</p>
                    <p>
                        Lien :{" "}
                        <a href={result.downloadUrl} target="_blank" rel="noreferrer">
                            {result.downloadUrl}
                        </a>
                    </p>
                    <p>Expire le : {new Date(result.expiresAt).toLocaleString()}</p>
                </div>
            )}
        </div>
    );
}