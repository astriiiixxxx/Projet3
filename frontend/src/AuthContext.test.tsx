import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";

function buildJwtWithExp(expSeconds: number): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const payload = btoa(JSON.stringify({ exp: expSeconds }))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${header}.${payload}.sig`;
}

function Consumer() {
  const { isAuthenticated } = useAuth();
  return <span data-testid="auth-flag">{String(isAuthenticated)}</span>;
}

describe("AuthProvider (session initiale)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("purge le stockage et n’est pas authentifié si le JWT est déjà expiré", () => {
    const expired = buildJwtWithExp(Math.floor(Date.now() / 1000) - 120);
    localStorage.setItem("datashare_token", expired);
    localStorage.setItem(
      "datashare_user",
      JSON.stringify({ id: 1, email: "a@b.com" })
    );

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    expect(screen.getByTestId("auth-flag").textContent).toBe("false");
    expect(localStorage.getItem("datashare_token")).toBeNull();
    expect(localStorage.getItem("datashare_user")).toBeNull();
  });
});
