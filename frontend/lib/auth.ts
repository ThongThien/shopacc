import { AUTH_STORAGE_KEYS } from "@/lib/constants";
import { AuthResponse, UserRole } from "@/types/auth";

export function saveAuth(auth: AuthResponse) {
  if (typeof window === "undefined") return;

  localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, auth.accessToken);
  localStorage.setItem(AUTH_STORAGE_KEYS.refreshToken, auth.refreshToken);
  localStorage.setItem(AUTH_STORAGE_KEYS.role, auth.role);

  document.cookie = `accessToken=${auth.accessToken}; path=/; max-age=86400; SameSite=Lax`;
  document.cookie = `role=${auth.role}; path=/; max-age=86400; SameSite=Lax`;

  window.dispatchEvent(new Event("auth-changed"));
}

export function clearAuth() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
  localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken);
  localStorage.removeItem(AUTH_STORAGE_KEYS.role);

  document.cookie = "accessToken=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "role=; path=/; max-age=0; SameSite=Lax";

  window.dispatchEvent(new Event("auth-changed"));
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken);
}

export function getUserRole(): UserRole | null {
  if (typeof window === "undefined") return null;

  return localStorage.getItem(AUTH_STORAGE_KEYS.role) as UserRole | null;
}

export function isLoggedIn() {
  return Boolean(getAccessToken());
}

export function isAdmin() {
  return getUserRole() === "ADMIN";
}

export function getUserId(): string | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || null;
  } catch {
    return null;
  }
}
