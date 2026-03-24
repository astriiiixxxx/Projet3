import { describe, it, expect, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { UploadForm } from "./UploadForm";
import { uploadAnonymousFile, uploadFile } from "../../services/fileApi";

vi.mock("../../services/fileApi", () => ({
  uploadFile: vi.fn(),
  uploadAnonymousFile: vi.fn(),
}));

describe("UploadForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche le formulaire d'upload anonyme", () => {
    render(<UploadForm anonymous />);

    expect(
      screen.getByRole("heading", { name: /envoyer un fichier anonymement/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/fichier/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expiration \(jours\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe optionnel/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /uploader/i })
    ).toBeInTheDocument();
  });

  it("affiche une erreur si aucun fichier n'est sélectionné", async () => {
    render(<UploadForm anonymous />);

    fireEvent.click(screen.getByRole("button", { name: /uploader/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /sélectionne un fichier/i
    );
    expect(uploadAnonymousFile).not.toHaveBeenCalled();
  });

  it("upload le fichier anonymement et affiche le résultat", async () => {
    vi.mocked(uploadAnonymousFile).mockResolvedValue({
      id: 1,
      originalFilename: "test.pdf",
      downloadToken: "abc123",
      downloadUrl: "http://localhost:5173/download/abc123",
      createdAt: "2026-03-20T10:00:00",
      expiresAt: "2026-03-27T10:00:00",
      passwordProtected: false,
    });

    render(<UploadForm anonymous />);

    const file = new File(["hello"], "test.pdf", { type: "application/pdf" });

    fireEvent.change(screen.getByLabelText(/fichier/i), {
      target: { files: [file] },
    });

    fireEvent.change(screen.getByLabelText(/expiration \(jours\)/i), {
      target: { value: "5" },
    });

    fireEvent.change(screen.getByLabelText(/mot de passe optionnel/i), {
      target: { value: "secret123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /uploader/i }));

    await waitFor(() => {
      expect(uploadAnonymousFile).toHaveBeenCalledWith({
        file,
        expirationDays: 5,
        password: "secret123",
      });
    });

    expect(await screen.findByText(/fichier envoyé/i)).toBeInTheDocument();
    expect(screen.getByText(/test\.pdf/i)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "http://localhost:5173/download/abc123"
    );
  });

  it("utilise uploadFile quand anonymous vaut false", async () => {
    vi.mocked(uploadFile).mockResolvedValue({
      id: 2,
      originalFilename: "private.pdf",
      downloadToken: "secure123",
      downloadUrl: "http://localhost:5173/download/secure123",
      createdAt: "2026-03-20T10:00:00",
      expiresAt: "2026-03-27T10:00:00",
      passwordProtected: true,
    });

    render(<UploadForm anonymous={false} />);

    const file = new File(["hello"], "private.pdf", { type: "application/pdf" });

    fireEvent.change(screen.getByLabelText(/fichier/i), {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole("button", { name: /uploader/i }));

    await waitFor(() => {
      expect(uploadFile).toHaveBeenCalled();
    });
  });

  it("affiche le message d'erreur backend", async () => {
    vi.mocked(uploadAnonymousFile).mockRejectedValue({
      response: {
        data: {
          message: "Ce type de fichier est interdit.",
        },
      },
    });

    render(<UploadForm anonymous />);

    const file = new File(["hello"], "virus.exe", {
      type: "application/octet-stream",
    });

    fireEvent.change(screen.getByLabelText(/fichier/i), {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole("button", { name: /uploader/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /ce type de fichier est interdit/i
    );
  });

  it("affiche l'état loading pendant l'envoi", async () => {
    let resolvePromise!: (value: {
      id: number;
      originalFilename: string;
      downloadToken: string;
      downloadUrl: string;
      createdAt: string;
      expiresAt: string;
      passwordProtected: boolean;
    }) => void;

    vi.mocked(uploadAnonymousFile).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    render(<UploadForm anonymous />);

    const file = new File(["hello"], "test.pdf", { type: "application/pdf" });

    fireEvent.change(screen.getByLabelText(/fichier/i), {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole("button", { name: /uploader/i }));

    expect(
      screen.getByRole("button", { name: /envoi\.\.\./i })
    ).toBeDisabled();

    resolvePromise({
      id: 1,
      originalFilename: "test.pdf",
      downloadToken: "abc123",
      downloadUrl: "http://localhost:5173/download/abc123",
      createdAt: "2026-03-20T10:00:00",
      expiresAt: "2026-03-27T10:00:00",
      passwordProtected: false,
    });

    expect(await screen.findByText(/fichier envoyé/i)).toBeInTheDocument();
  });
});