import { describe, it, expect, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { UploadForm } from "./UploadForm";
import { uploadFile } from "../../services/fileApi";

vi.mock("../../services/fileApi", () => ({
  uploadFile: vi.fn(),
}));

describe("UploadForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche le formulaire d'upload", () => {
    render(<UploadForm />);

    expect(
      screen.getByRole("heading", { name: /envoyer un fichier/i })
    ).toBeInTheDocument();

    expect(screen.getByLabelText(/fichier/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/expiration \(jours\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe optionnel/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /uploader/i })
    ).toBeInTheDocument();
  });

  it("affiche une erreur si aucun fichier n'est sélectionné", async () => {
    render(<UploadForm />);

    fireEvent.click(screen.getByRole("button", { name: /uploader/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /sélectionne un fichier/i
    );
    expect(uploadFile).not.toHaveBeenCalled();
  });

  it("upload le fichier et affiche le résultat", async () => {
    vi.mocked(uploadFile).mockResolvedValue({
      id: 1,
      originalFilename: "test.pdf",
      downloadToken: "abc123",
      downloadUrl: "http://localhost:3000/download/abc123",
      createdAt: "2026-03-20T10:00:00",
      expiresAt: "2026-03-27T10:00:00",
      passwordProtected: false,
    });

    render(<UploadForm />);

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
      expect(uploadFile).toHaveBeenCalledWith({
        file,
        expirationDays: 5,
        password: "secret123",
      });
    });

    expect(await screen.findByText(/fichier envoyé/i)).toBeInTheDocument();
    expect(screen.getByText(/test\.pdf/i)).toBeInTheDocument();
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "http://localhost:3000/download/abc123"
    );
  });

  it("affiche le message d'erreur backend", async () => {
    vi.mocked(uploadFile).mockRejectedValue({
      response: {
        data: {
          message: "Ce type de fichier est interdit.",
        },
      },
    });

    render(<UploadForm />);

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

    vi.mocked(uploadFile).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
    );

    render(<UploadForm />);

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
      downloadUrl: "http://localhost:3000/download/abc123",
      createdAt: "2026-03-20T10:00:00",
      expiresAt: "2026-03-27T10:00:00",
      passwordProtected: false,
    });

    expect(await screen.findByText(/fichier envoyé/i)).toBeInTheDocument();
  });
});