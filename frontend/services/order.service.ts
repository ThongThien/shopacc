import { apiFetch } from "@/lib/api";
import { Order, OrderSecretResponse, PurchaseResponse } from "@/types/order";

export async function purchaseListing(
  listingId: number,
): Promise<PurchaseResponse> {
  return apiFetch<PurchaseResponse>(`/api/orders/purchase/${listingId}`, {
    method: "POST",
  });
}

export async function getMyOrders(): Promise<Order[]> {
  return apiFetch<Order[]>("/api/orders/my");
}

export async function getOrderDetail(orderId: number): Promise<Order> {
  return apiFetch<Order>(`/api/orders/${orderId}`);
}

export async function getOrderSecret(
  orderId: number,
): Promise<OrderSecretResponse> {
  return apiFetch<OrderSecretResponse>(`/api/orders/${orderId}/secret`);
}
