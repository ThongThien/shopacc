export interface PaymentWebhookLog {
  id: number;
  provider?: string;
  referenceCode?: string;
  accountNumber?: string;
  transferType?: string;
  transferAmount?: number;
  content?: string;
  rawBody?: string;
  status?: string;
  errorMessage?: string;
  createdAt?: string;
}
