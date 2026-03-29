import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../AuthContext";
import UploadPage from "./UploadPage";
import { uploadAnonymousFile, uploadFile } from "../services/fileApi";

vi.mock("../AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("../services/fileApi", () => ({
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

describe("UploadPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche le formulaire d'envoi pour tous les utilisateurs", () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(<UploadPage />);

    expect(
      screen.getByRole("heading", { name: /ajouter un fichier/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sélectionner un fichier/i })
    ).toBeInTheDocument();
  });

  it("utilise l'upload authentifié quand l'utilisateur est connecté", async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: 1, email: "a@b.com" },
      token: "jwt",
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
    vi.mocked(uploadFile).mockResolvedValue(mockUploadResponse);

    render(<UploadPage />);

    const file = new File(["hello"], "test.pdf", { type: "application/pdf" });

    fireEvent.change(screen.getByLabelText(/fichier/i), {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole("button", { name: /^téléverser$/i }));

    await waitFor(() => {
      expect(uploadFile).toHaveBeenCalled();
      expect(uploadAnonymousFile).not.toHaveBeenCalled();
    });
  });

  it("utilise l'upload anonyme quand l'utilisateur n'est pas connecté", async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false,
      user: null,
      token: null,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
    });
    vi.mocked(uploadAnonymousFile).mockResolvedValue(mockUploadResponse);

    render(<UploadPage />);

    const file = new File(["hello"], "test.pdf", { type: "application/pdf" });

    fireEvent.change(screen.getByLabelText(/fichier/i), {
      target: { files: [file] },
    });

    fireEvent.click(screen.getByRole("button", { name: /^téléverser$/i }));

    await waitFor(() => {
      expect(uploadAnonymousFile).toHaveBeenCalled();
      expect(uploadFile).not.toHaveBeenCalled();
    });
  });
});
