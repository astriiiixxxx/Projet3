import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import DownloadPage from "./DownloadPage";
import * as fileApi from "../services/fileApi";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/fileApi", () => ({
  getPublicFile: vi.fn(),
  downloadPublicFile: vi.fn(),
}));

function renderDownloadPage(route = "/download/token-123") {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/download/:token" element={<DownloadPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("DownloadPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche le champ mot de passe si le fichier est protégé", async () => {
    vi.mocked(fileApi.getPublicFile).mockResolvedValue({
      originalFilename: "document.pdf",
      mimeType: "application/pdf",
      size: 1200,
      createdAt: "2026-03-20T10:00:00",
      expiresAt: "2026-03-21T10:00:00",
      expired: false,
      passwordProtected: true,
      downloadUrl: "/api/files/download/token-123",
    });

    renderDownloadPage();

    expect(
      await screen.findByText(/document\.pdf/i)
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/mot de passe/i)).toBeInTheDocument();
  });

  it("n'affiche pas le champ mot de passe si le fichier n'est pas protégé", async () => {
    vi.mocked(fileApi.getPublicFile).mockResolvedValue({
      originalFilename: "document.pdf",
      mimeType: "application/pdf",
      size: 1200,
      createdAt: "2026-03-20T10:00:00",
      expiresAt: "2026-03-21T10:00:00",
      expired: false,
      passwordProtected: false,
      downloadUrl: "/api/files/download/token-123",
    });

    renderDownloadPage();

    expect(
      await screen.findByText(/document\.pdf/i)
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/mot de passe/i)).not.toBeInTheDocument();
  });

  it("affiche une erreur locale si on clique sur télécharger sans mot de passe pour un fichier protégé", async () => {
    vi.mocked(fileApi.getPublicFile).mockResolvedValue({
      originalFilename: "document.pdf",
      mimeType: "application/pdf",
      size: 1200,
      createdAt: "2026-03-20T10:00:00",
      expiresAt: "2026-03-21T10:00:00",
      expired: false,
      passwordProtected: true,
      downloadUrl: "/api/files/download/token-123",
    });

    renderDownloadPage();

    await screen.findByText(/document\.pdf/i);

    fireEvent.click(screen.getByRole("button", { name: /télécharger le fichier/i }));

    expect(
      screen.getByText(/le mot de passe est requis pour télécharger ce fichier/i)
    ).toBeInTheDocument();

    expect(fileApi.downloadPublicFile).not.toHaveBeenCalled();
  });

  it("appelle downloadPublicFile avec le bon mot de passe", async () => {
    vi.mocked(fileApi.getPublicFile).mockResolvedValue({
      originalFilename: "document.pdf",
      mimeType: "application/pdf",
      size: 1200,
      createdAt: "2026-03-20T10:00:00",
      expiresAt: "2026-03-21T10:00:00",
      expired: false,
      passwordProtected: true,
      downloadUrl: "/api/files/download/token-123",
    });

    vi.mocked(fileApi.downloadPublicFile).mockResolvedValue(
      new Blob(["hello"], { type: "application/pdf" })
    );

    const createObjectURLSpy = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:test-url");

    const revokeObjectURLSpy = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});

    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    const removeChildSpy = vi.spyOn(document.body, "removeChild");

    renderDownloadPage();

    await screen.findByText(/document\.pdf/i);

    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: "secret123" },
    });

    fireEvent.click(screen.getByRole("button", { name: /télécharger le fichier/i }));

    await waitFor(() => {
      expect(fileApi.downloadPublicFile).toHaveBeenCalledWith("token-123", "secret123");
    });

    createObjectURLSpy.mockRestore();
    revokeObjectURLSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it("affiche l'erreur backend si le mot de passe est invalide", async () => {
    vi.mocked(fileApi.getPublicFile).mockResolvedValue({
      originalFilename: "document.pdf",
      mimeType: "application/pdf",
      size: 1200,
      createdAt: "2026-03-20T10:00:00",
      expiresAt: "2026-03-21T10:00:00",
      expired: false,
      passwordProtected: true,
      downloadUrl: "/api/files/download/token-123",
    });

    const errorBlob = new Blob(
      [
        JSON.stringify({
          timestamp: "2026-03-20T12:00:00",
          status: 401,
          error: "Unauthorized",
          message: "Mot de passe invalide.",
          path: "/api/files/download/token-123",
        }),
      ],
      { type: "application/json" }
    );

    vi.mocked(fileApi.downloadPublicFile).mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 401,
        data: errorBlob,
      },
    });

    renderDownloadPage();

    await screen.findByText(/document\.pdf/i);

    fireEvent.change(screen.getByLabelText(/mot de passe/i), {
      target: { value: "wrong-password" },
    });

    fireEvent.click(screen.getByRole("button", { name: /télécharger le fichier/i }));

    expect(await screen.findByText(/mot de passe invalide/i)).toBeInTheDocument();
  });
});