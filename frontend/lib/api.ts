import { API_BASE_URL, AUTH_STORAGE_KEYS } from "@/lib/constants";

type ApiFetchOptions = RequestInit & {
  auth?: boolean;
};

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

  console.log("API REQUEST:", {
    url,
    method: options.method || "GET",
    headers: Object.fromEntries(headers.entries()),
    body: options.body,
  });

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      cache: "no-store",
    });

    if (!response.ok) {
      let message = "API request failed";

      try {
        const error = await response.json();
        message = error.message || message;
      } catch {
        message = response.statusText || message;
      }

      // token hết hạn hoặc chưa login
      if (response.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem(AUTH_STORAGE_KEYS.accessToken);
          localStorage.removeItem(AUTH_STORAGE_KEYS.refreshToken);
          localStorage.removeItem(AUTH_STORAGE_KEYS.role);
        }

        throw new Error("UNAUTHORIZED");
      }

      throw new Error(message);
    }

    if (response.status === 204) {
      return null as T;
    }

    return response.json();
  } catch (error) {
    console.error("API FETCH ERROR:", error);
    throw error;
  }
}
