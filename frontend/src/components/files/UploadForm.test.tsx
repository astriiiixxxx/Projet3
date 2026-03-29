import { describe, it, expect, beforeEach, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { UploadForm } from "./UploadForm";
import { uploadAnonymousFile, uploadFile } from "../../services/fileApi";

vi.mock("../../services/fileApi", () => ({
  uploadFile: vi.fn(),
  uploadAnonymousFile: vi.fn(),
}));

const mockUploadResponse = {
  id: 1,
  originalFilename: "test.pdf",
  downloadToken: "abc123",
  downloadUrl: "http://localhost:5173/download/abc123",
  createdAt: "2026-03-20T10:00:00",
  expiresAt: "2026-03-27T10:00:00",
  passwordProtected: false,
};

describe("UploadForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche le formulaire avec le sélecteur de fichier au premier rendu", () => {
    render(<UploadForm anonymous />);

    expect(
      screen.getByRole("heading", { name: /ajouter un fichier/i })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /sélectionner un fichier/i })
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^téléverser$/i })
    ).toBeInTheDocument();
  });

  it("affiche le fichier sélectionné après pick", () => {
    render(<UploadForm anonymous />);

    const file = new File(["hello"], "test.pdf", { type: "application/pdf" });

    fireEvent.change(screen.getByLabelText(/fichier/i), {
      target: { files: [file] },
    });

    expect(screen.getByText("test.pdf")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /changer/i })
    ).toBeInTheDocument();
  });

  it("affiche une erreur si on téléverse sans fichier", async () => {
    render(<UploadForm anonymous />);

    fireEvent.click(screen.getByRole("button", { name: /^téléverser$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /sélectionne un fichier/i
    );
    expect(uploadAnonymousFile).not.toHaveBeenCalled();
  });

  it("upload le fichier anonymement et affiche le succès avec lien", async () => {
    vi.mocked(uploadAnonymousFile).mockResolvedValue(mockUploadResponse);

    render(<UploadForm anonymous />);

    const file = new File(["hello"], "test.pdf", { type: "application/pdf" });

    fireEvent.change(screen.getByLabelText(/fichier/i), {
      target: { files: [file] },
    });

    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: "secret123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /^téléverser$/i }));

    await waitFor(() => {
      expect(uploadAnonymousFile).toHaveBeenCalledWith({
        file,
        expirationDays: 7,
        password: "secret123",
      });
    });

    expect(
      await screen.findByText(/félicitations, ton fichier sera conservé/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /localhost:5173\/download\/abc123/i })
    ).toHaveAttribute("href", "http://localhost:5173/download/abc123");
    expect(
      screen.getByRole("button", { name: /copier le lien/i })
    ).toBeInTheDocument();
  });

  it("utilise uploadFile quand anonymous vaut false", async () => {
    vi.mocked(uploadFile).mockResolvedValue({
      ...mockUploadResponse,
      id: 2,
      originalFilename: "private.pdf",
      downloadToken: "secure123",
      downloadUrl: "http://localhost:5173/download/secure123",
      passwordProtected: true,
    });

    render(<UploadForm anonymous={false} />);

    const file = new File(["hello"], "private.pdf", {
      type: "application/pdf",
    });

    fireEvent.change(screen.getByLabelText(/fichier/i), {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole("button", { name: /^téléverser$/i }));

    await waitFor(() => {
      expect(uploadFile).toHaveBeenCalled();
      expect(uploadAnonymousFile).not.toHaveBeenCalled();
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

    fireEvent.click(screen.getByRole("button", { name: /^téléverser$/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      /ce type de fichier est interdit/i
    );
  });

  it("affiche l'état loading pendant l'envoi", async () => {
    let resolvePromise!: (value: typeof mockUploadResponse) => void;

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

    fireEvent.click(screen.getByRole("button", { name: /^téléverser$/i }));

    expect(
      screen.getByRole("button", { name: /envoi\.\.\./i })
    ).toBeDisabled();

    resolvePromise(mockUploadResponse);

    await waitFor(() => {
      expect(
        screen.getByText(/félicitations, ton fichier sera conservé/i)
      ).toBeInTheDocument();
    });
  });

  it("permet de retourner au formulaire après un upload réussi", async () => {
    vi.mocked(uploadAnonymousFile).mockResolvedValue(mockUploadResponse);

    render(<UploadForm anonymous />);

    const file = new File(["hello"], "test.pdf", { type: "application/pdf" });

    fireEvent.change(screen.getByLabelText(/fichier/i), {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole("button", { name: /^téléverser$/i }));

    await screen.findByText(/félicitations, ton fichier sera conservé/i);

    fireEvent.click(
      screen.getByRole("button", { name: /téléverser un autre fichier/i })
    );

    expect(
      screen.getByRole("button", { name: /sélectionner un fichier/i })
    ).toBeInTheDocument();
  });
});
