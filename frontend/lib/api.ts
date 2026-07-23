import { API_BASE_URL, AUTH_STORAGE_KEYS } from "@/lib/constants";
import { clearAuth } from "@/lib/auth";

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem(AUTH_STORAGE_KEYS.refreshToken);
  if (!refreshToken) return false;

  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      localStorage.setItem(AUTH_STORAGE_KEYS.accessToken, data.accessToken);
      if (data.role) localStorage.setItem(AUTH_STORAGE_KEYS.role, data.role);
      return true;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();
  return refreshPromise;
}

function handleAuthExpired() {
  if (typeof window === "undefined") return;
  clearAuth();
  window.dispatchEvent(
    new CustomEvent("auth-expired", {
      detail: { message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." },
    }),
  );
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;

  if (!headers.has("Content-Type") && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth !== false && typeof window !== "undefined") {
    const token = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}${path}`;

  let response = await fetch(url, { ...options, headers, cache: "no-store" });

  // Auto-refresh on 401 (skip for auth endpoints)
  if (response.status === 401 && !path.startsWith("/api/auth/")) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      // Retry original request with new token
      const newToken = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken);
      if (newToken) headers.set("Authorization", `Bearer ${newToken}`);
      response = await fetch(url, { ...options, headers, cache: "no-store" });
    }
  }

  if (response.status === 401 || response.status === 403) {
    // If still 401 after refresh attempt → real logout
    if (path.startsWith("/api/auth/")) {
      // Auth endpoints: don't logout, just throw
      const text = await response.text();
      let message = "Lỗi xác thực";
      try { const data = JSON.parse(text); message = data.message || message; } catch {}
      throw new Error(message);
    }
    handleAuthExpired();
    throw new Error("Phiên đăng nhập đã hết hạn");
  }

  if (!response.ok) {
    const text = await response.text();
    let message = "API request failed";
    try { const data = JSON.parse(text); message = data.message || data.error || message; } catch { message = text || message; }
    throw new Error(message);
  }

  if (response.status === 204) return null as T;
  return response.json();
}
