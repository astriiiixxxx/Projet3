import { render, screen, waitFor } from "@testing-library/react";
import MySpacePage from "./MySpacePage";
import { getMyFiles } from "../services/fileApi";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../services/fileApi", () => ({
  getMyFiles: vi.fn(),
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
      expect(
        screen.getByRole("alert", {
          name: "",
        })
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/impossible de charger l’historique des fichiers/i)
    ).toBeInTheDocument();
  });
});