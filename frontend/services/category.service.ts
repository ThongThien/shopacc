import { apiFetch } from "@/lib/api";
import { Category } from "@/types/category";

export async function getAdminCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/api/admin/categories");
}
