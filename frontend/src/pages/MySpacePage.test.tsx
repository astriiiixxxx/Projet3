import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import MySpacePage from "./MySpacePage";
import { deleteMyFile, getMyFiles } from "../services/fileApi";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/fileApi", () => ({
  getMyFiles: vi.fn(),
  deleteMyFile: vi.fn(),
}));

describe("MySpacePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche l’historique des fichiers", async () => {
    vi.mocked(getMyFiles).mockResolvedValue([
      {
        id: 1,
        originalFilename: "contrat.pdf",
        size: 2048,
        createdAt: "2026-03-20T10:00:00",
        expiresAt: "2026-03-27T10:00:00",
        expired: false,
        passwordProtected: true,
        downloadToken: "abc123",
        downloadUrl: "http://localhost:5173/download/abc123",
      },
    ]);

    render(<MySpacePage />);

    expect(
      screen.getByText(/chargement de l’historique/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("contrat.pdf")).toBeInTheDocument();
    });

    expect(screen.getByText(/valide/i)).toBeInTheDocument();
    expect(screen.getByText(/protégé/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ouvrir/i })).toHaveAttribute(
      "href",
      "http://localhost:5173/download/abc123"
    );
    expect(
      screen.getByRole("button", { name: /supprimer/i })
    ).toBeInTheDocument();
  });

  it("affiche un message vide quand il n’y a aucun fichier", async () => {
    vi.mocked(getMyFiles).mockResolvedValue([]);

    render(<MySpacePage />);

    await waitFor(() => {
      expect(
        screen.getByText(/aucun fichier envoyé pour le moment/i)
      ).toBeInTheDocument();
    });
  });

  it("affiche une erreur si le chargement échoue", async () => {
    vi.mocked(getMyFiles).mockRejectedValue(new Error("boom"));

    render(<MySpacePage />);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    expect(
      screen.getByText(/impossible de charger l’historique des fichiers/i)
    ).toBeInTheDocument();
  });

  it("supprime un fichier et le retire de la liste", async () => {
    vi.mocked(getMyFiles).mockResolvedValue([
      {
        id: 1,
        originalFilename: "contrat.pdf",
        size: 2048,
        createdAt: "2026-03-20T10:00:00",
        expiresAt: "2026-03-27T10:00:00",
        expired: false,
        passwordProtected: true,
        downloadToken: "abc123",
        downloadUrl: "http://localhost:5173/download/abc123",
      },
    ]);

    vi.mocked(deleteMyFile).mockResolvedValue(undefined);

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<MySpacePage />);

    await waitFor(() => {
      expect(screen.getByText("contrat.pdf")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /supprimer/i }));

    await waitFor(() => {
      expect(deleteMyFile).toHaveBeenCalledWith(1);
    });

    await waitFor(() => {
      expect(screen.queryByText("contrat.pdf")).not.toBeInTheDocument();
    });

    confirmSpy.mockRestore();
  });

  it("ne supprime pas le fichier si la confirmation est annulée", async () => {
    vi.mocked(getMyFiles).mockResolvedValue([
      {
        id: 1,
        originalFilename: "contrat.pdf",
        size: 2048,
        createdAt: "2026-03-20T10:00:00",
        expiresAt: "2026-03-27T10:00:00",
        expired: false,
        passwordProtected: true,
        downloadToken: "abc123",
        downloadUrl: "http://localhost:5173/download/abc123",
      },
    ]);

    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<MySpacePage />);

    await waitFor(() => {
      expect(screen.getByText("contrat.pdf")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /supprimer/i }));

    expect(deleteMyFile).not.toHaveBeenCalled();
    expect(screen.getByText("contrat.pdf")).toBeInTheDocument();

    confirmSpy.mockRestore();
  });

  it("affiche une erreur si la suppression échoue", async () => {
    vi.mocked(getMyFiles).mockResolvedValue([
      {
        id: 1,
        originalFilename: "contrat.pdf",
        size: 2048,
        createdAt: "2026-03-20T10:00:00",
        expiresAt: "2026-03-27T10:00:00",
        expired: false,
        passwordProtected: true,
        downloadToken: "abc123",
        downloadUrl: "http://localhost:5173/download/abc123",
      },
    ]);
  
    vi.mocked(deleteMyFile).mockRejectedValue(new Error("boom"));
  
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
  
    render(<MySpacePage />);
  
    await waitFor(() => {
      expect(screen.getByText("contrat.pdf")).toBeInTheDocument();
    });
  
    fireEvent.click(screen.getByRole("button", { name: /supprimer/i }));
  
    await waitFor(() => {
      expect(
        screen.getByText(/impossible de supprimer ce fichier/i)
      ).toBeInTheDocument();
    });
  
    expect(deleteMyFile).toHaveBeenCalledWith(1);
  
    confirmSpy.mockRestore();
  });
});