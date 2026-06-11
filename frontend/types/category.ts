import { Listing } from "@/types/listing";

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  sortOrder?: number;
  parentId: number | null;
  parentName: string | null;
  createdAt?: string;
  updatedAt?: string;
  listingCount?: number;
}

export interface AdminCategoryDetail extends Category {
  listings: Listing[];
}

export interface CategorySummary {
  id: number;
  name: string;
  slug: string;
  thumbnail?: string;
  soldCount: number;
  availableCount: number;
}

export interface HomeGameSection {
  gameName: string;
  categories: CategorySummary[];
}
