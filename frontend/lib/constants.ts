export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const AUTH_STORAGE_KEYS = {
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  role: "role",
} as const;

export const ROUTES = {
  home: "/",
  accounts: "/accounts",
  login: "/login",
  register: "/register",
  me: "/me",
  admin: "/admin",
} as const;
