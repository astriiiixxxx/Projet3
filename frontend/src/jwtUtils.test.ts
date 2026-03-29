import { describe, expect, it } from "vitest";
import { isJwtExpiredOrInvalid } from "./jwtUtils";

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

describe("isJwtExpiredOrInvalid", () => {
  it("retourne true si le token n’a pas 3 segments", () => {
    expect(isJwtExpiredOrInvalid("a.b")).toBe(true);
  });

  it("retourne true si le JWT est expiré", () => {
    const token = buildJwtWithExp(Math.floor(Date.now() / 1000) - 60);
    expect(isJwtExpiredOrInvalid(token)).toBe(true);
  });

  it("retourne false si le JWT n’est pas encore expiré", () => {
    const token = buildJwtWithExp(Math.floor(Date.now() / 1000) + 3600);
    expect(isJwtExpiredOrInvalid(token)).toBe(false);
  });
});
