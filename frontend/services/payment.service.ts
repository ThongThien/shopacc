import { apiFetch } from "@/lib/api";
import { Transaction } from "@/types/transaction";
export interface DepositResponse {
  transactionCode: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED";

  transferContent: string;
  qrUrl: string;

  bankName: string;
  bankAccount: string;
  accountName: string;
}

export async function createDeposit(amount: number): Promise<DepositResponse> {
  return apiFetch<DepositResponse>("/api/payments/deposits", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export async function getDepositStatus(transactionCode: string) {
  return apiFetch(`/api/payments/deposits/${transactionCode}`);
}

export async function getMyDeposits(): Promise<Transaction[]> {
  return apiFetch<Transaction[]>("/api/payments/deposits");
}
