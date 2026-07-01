export interface DiscountCode {
  id: number;
  code: string;
  type: "PERCENT" | "FIXED";
  value: number;
  minOrderAmount?: number;
  maxUsage?: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
}
