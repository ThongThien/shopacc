export interface OrderItem {
  id: number;
  listingId: number;
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
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
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
