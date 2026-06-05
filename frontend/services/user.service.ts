import { apiFetch } from "@/lib/api";
import { ChangePasswordRequest, UserBalance, UserProfile } from "@/types/user";
import { Transaction } from "@/types/transaction";

export async function getMyBalance(): Promise<UserBalance> {
  return apiFetch<UserBalance>("/api/users/me/balance");
}

export async function getMyProfile(): Promise<UserProfile> {
  return apiFetch<UserProfile>("/api/users/me/profile");
}

export async function changeMyPassword(
  payload: ChangePasswordRequest,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/api/users/me/password", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function getMyTransactions(): Promise<Transaction[]> {
  return apiFetch<Transaction[]>("/api/users/me/transactions");
}
