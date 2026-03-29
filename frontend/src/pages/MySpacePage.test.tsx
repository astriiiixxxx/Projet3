import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import MySpacePage from "./MySpacePage";
import { deleteMyFile, getMyFiles } from "../services/fileApi";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/fileApi", () => ({
  getMyFiles: vi.fn(),
  deleteMyFile: vi.fn(),
}));

const fileFixture = {
  id: 1,
  originalFilename: "contrat.pdf",
  size: 2048,
  createdAt: "2026-03-20T10:00:00",
  expiresAt: "2099-03-27T10:00:00",
  expired: false,
  passwordProtected: true,
  downloadToken: "abc123",
  downloadUrl: "http://localhost:5173/download/abc123",
};

describe("MySpacePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("affiche l'historique des fichiers", async () => {
    vi.mocked(getMyFiles).mockResolvedValue([fileFixture]);

    render(<MySpacePage />);

    expect(
      screen.getByText(/chargement de l’historique/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("contrat.pdf")).toBeInTheDocument();
    });

    expect(screen.getByTestId("status-1")).toHaveTextContent(/valide/i);
    expect(screen.getByText("Protégé")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /accéder/i })).toHaveAttribute(
      "href",
      "http://localhost:5173/download/abc123"
    );
    expect(
      screen.getByRole("button", { name: /supprimer/i })
    ).toBeInTheDocument();
  });

  it("affiche le hero d'accueil quand il n'y a aucun fichier", async () => {
    vi.mocked(getMyFiles).mockResolvedValue([]);

    render(<MySpacePage />);

    await waitFor(() => {
      expect(
        screen.getByText(/aucun fichier envoyé pour le moment/i)
      ).toBeInTheDocument();
    });

    expect(
      screen.getByRole("link", { name: /téléverser un fichier/i })
    ).toHaveAttribute("href", "/upload");
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
    vi.mocked(getMyFiles).mockResolvedValue([fileFixture]);
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
    vi.mocked(getMyFiles).mockResolvedValue([fileFixture]);

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
    vi.mocked(getMyFiles).mockResolvedValue([fileFixture]);
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

  it("affiche le message d'expiration au lieu des actions pour un fichier expiré", async () => {
    vi.mocked(getMyFiles).mockResolvedValue([
      { ...fileFixture, id: 2, originalFilename: "old.pdf", expired: true },
    ]);

    render(<MySpacePage />);

    await waitFor(() => {
      expect(screen.getByText("old.pdf")).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        /ce fichier a expiré, il n'est plus stocké chez nous/i
      )
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("link", { name: /accéder/i })
    ).not.toBeInTheDocument();
  });
});
