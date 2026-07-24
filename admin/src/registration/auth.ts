const TOKEN_KEY = "herbavi_auth_token";
const SESSION_KEY = "herbavi_session_active";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function markSessionActive(): void {
  sessionStorage.setItem(SESSION_KEY, "1");
}

export function hasActiveSession(): boolean {
  return sessionStorage.getItem(SESSION_KEY) === "1";
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function normalizeRole(role: unknown): string {
  return String(role ?? "").trim().toLowerCase();
}

export function redirectByRole(role: unknown): boolean {
  if (normalizeRole(role) === "user") {
    window.location.replace("/");
    return true;
  }
  return false;
}
