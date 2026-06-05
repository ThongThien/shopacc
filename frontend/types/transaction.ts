export interface Transaction {
  id: number;
  transactionCode: string;
  type?: string;
  amount: number;
  status: string;
  provider?: string;
  description?: string;
  createdAt: string;
}

export interface CreateDepositResponse {
  transactionCode: string;
  amount: number;
  status: string;
  transferContent: string;
}
