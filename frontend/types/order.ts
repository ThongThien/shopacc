export type OrderStatus = "PENDING" | "COMPLETED" | "CANCELLED";

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

export interface OrderItem {
  id: number;
  listingId: number | null;
  listingTitle: string;
  listingThumbnail: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  orderCode: string;
  userId: number;
  username: string;
  userEmail?: string;
  totalPrice: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  createdAt: string;
  updatedAt?: string;
  items: OrderItem[];
}

export interface PurchaseResponse {
  orderCode: string;
  orderId: number;
  listingTitle: string;
  message: string;
}

export interface OrderSecretResponse {
  orderId: number;
  orderCode: string;
  listingTitle: string;
  secretData: string;
}
