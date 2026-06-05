import { apiFetch } from "@/lib/api";
import { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth";

export async function login(request: LoginRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(request),
    auth: false,
  });
}

export async function register(
  request: RegisterRequest,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(request),
    auth: false,
  });
}
