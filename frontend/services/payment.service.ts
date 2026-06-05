import { apiFetch } from "@/lib/api";
import { CreateDepositResponse, Transaction } from "@/types/transaction";

export async function createDeposit(
  amount: number,
): Promise<CreateDepositResponse> {
  return apiFetch<CreateDepositResponse>("/api/payments/deposits", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export async function getMyDeposits(): Promise<Transaction[]> {
  return apiFetch<Transaction[]>("/api/payments/deposits");
}
