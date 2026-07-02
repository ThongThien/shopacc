import { API_BASE_URL } from "@/lib/constants";
import { clearAuth } from "@/lib/auth";

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

function handleAuthExpired() {
  if (typeof window === "undefined") return;

  clearAuth();

  window.dispatchEvent(
    new CustomEvent("auth-expired", {
      detail: {
        message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      },
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

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const url = `${API_BASE_URL}${path}`;

  const response = await fetch(url, {
    ...options,
    headers,
    cache: "no-store",
  });

  if (response.status === 401 || response.status === 403) {
    handleAuthExpired();
    throw new Error("Phiên đăng nhập đã hết hạn");
  }

  if (!response.ok) {
    const text = await response.text();

    let message = "API request failed";

    try {
      const data = JSON.parse(text);
      message = data.message || data.error || message;
    } catch {
      message = text || message;
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}
