import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { applyUnauthorizedResponseHandling } from "./axios";
import { authStorage } from "../authStorage";

describe("applyUnauthorizedResponseHandling", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("supprime le token et redirige vers /login sur 401 hors auth", () => {
    const replace = vi.fn();
    vi.stubGlobal("location", {
      pathname: "/my-space",
      replace,
    } as unknown as Location);

    authStorage.setToken("old-token");
    authStorage.setUser({ id: 1, email: "a@b.com" });

    applyUnauthorizedResponseHandling(401, "/files");

    expect(authStorage.getToken()).toBeNull();
    expect(authStorage.getUser()).toBeNull();
    expect(replace).toHaveBeenCalledWith("/login");
  });

  it("ne fait rien sur le stockage sur 401 pendant une tentative de login", () => {
    vi.stubGlobal("location", {
      pathname: "/login",
      replace: vi.fn(),
    } as unknown as Location);

    authStorage.setToken("x");
    applyUnauthorizedResponseHandling(401, "/auth/login");
    expect(authStorage.getToken()).toBe("x");
  });

  it("ne redirige pas si on est déjà sur /login (mais purge la session sur 401 API)", () => {
    const replace = vi.fn();
    vi.stubGlobal("location", {
      pathname: "/login",
      replace,
    } as unknown as Location);

    authStorage.setToken("stale");
    applyUnauthorizedResponseHandling(401, "/files");
    expect(authStorage.getToken()).toBeNull();
    expect(replace).not.toHaveBeenCalled();
  });

  it("ne déconnecte pas sur 401 de téléchargement (mot de passe fichier incorrect)", () => {
    vi.stubGlobal("location", {
      pathname: "/download/abc",
      replace: vi.fn(),
    } as unknown as Location);

    authStorage.setToken("valid-session-token");
    applyUnauthorizedResponseHandling(401, "/files/download/abc");
    expect(authStorage.getToken()).toBe("valid-session-token");
  });
});
