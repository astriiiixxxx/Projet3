/**
 * Vérifie l’expiration du JWT côté client à partir du claim `exp` (sans vérifier la signature).
 * Un token mal formé est traité comme invalide / expiré.
 */
export function isJwtExpiredOrInvalid(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    const json = decodeBase64Url(parts[1]);
    const claims = JSON.parse(json) as { exp?: number };
    if (typeof claims.exp !== "number") return true;

    return Date.now() >= claims.exp * 1000;
  } catch {
    return true;
  }
}

function decodeBase64Url(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (base64.length % 4)) % 4;
  const padded = base64 + "=".repeat(padLen);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}
