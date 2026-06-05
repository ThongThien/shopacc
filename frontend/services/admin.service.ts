import { apiFetch } from "@/lib/api";
import {
  AdminCategoryPayload,
  AdminListingPayload,
  UpdateListingStatusRequest,
  UpdateUserBalanceRequest,
} from "@/types/admin";
import { AdminDashboard } from "@/types/admin-dashboard";

import { Category } from "@/types/category";
import { Listing } from "@/types/listing";
import { Order } from "@/types/order";
import { Transaction } from "@/types/transaction";
import { User } from "@/types/user";

export async function getAdminListings(): Promise<Listing[]> {
  return apiFetch<Listing[]>("/api/admin/listings");
}

export async function getAdminListing(id: number): Promise<Listing> {
  return apiFetch<Listing>(`/api/admin/listings/${id}`);
}

export async function createAdminListing(
  payload: AdminListingPayload,
): Promise<Listing> {
  return apiFetch<Listing>("/api/admin/listings", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminListing(
  id: number,
  payload: AdminListingPayload,
): Promise<Listing> {
  return apiFetch<Listing>(`/api/admin/listings/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminListing(
  id: number,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/admin/listings/${id}`, {
    method: "DELETE",
  });
}

export async function updateAdminListingStatus(
  id: number,
  payload: UpdateListingStatusRequest,
): Promise<Listing> {
  return apiFetch<Listing>(`/api/admin/listings/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function uploadListingImage(
  listingId: number,
  file: File,
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  return apiFetch<{ url: string }>(`/api/listings/${listingId}/images`, {
    method: "POST",
    body: formData,
  });
}

export async function getAdminCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/api/admin/categories");
}

export async function getAdminCategory(id: number): Promise<Category> {
  return apiFetch<Category>(`/api/admin/categories/${id}`);
}

export async function createAdminCategory(
  payload: AdminCategoryPayload,
): Promise<Category> {
  return apiFetch<Category>("/api/admin/categories", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateAdminCategory(
  id: number,
  payload: AdminCategoryPayload,
): Promise<Category> {
  return apiFetch<Category>(`/api/admin/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteAdminCategory(
  id: number,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(`/api/admin/categories/${id}`, {
    method: "DELETE",
  });
}

export async function getAdminOrders(): Promise<Order[]> {
  return apiFetch<Order[]>("/api/admin/orders");
}

export async function getAdminOrder(id: number): Promise<Order> {
  return apiFetch<Order>(`/api/admin/orders/${id}`);
}

export async function getAdminUsers(): Promise<User[]> {
  return apiFetch<User[]>("/api/admin/users");
}

export async function updateAdminUserBalance(
  id: number,
  payload: UpdateUserBalanceRequest,
): Promise<User> {
  return apiFetch<User>(`/api/admin/users/${id}/balance`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export async function getAdminTransactions(): Promise<Transaction[]> {
  return apiFetch<Transaction[]>("/api/admin/transactions");
}

export async function getAdminDashboard(): Promise<AdminDashboard> {
  return apiFetch<AdminDashboard>("/api/admin/dashboard");
}
