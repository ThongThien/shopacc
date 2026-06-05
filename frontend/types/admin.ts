import { ListingStatus, ListingType } from "@/types/listing";

export interface AdminListingPayload {
  categoryId: number;
  listingType: ListingType;
  gameName: string;
  serverName: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  thumbnail: string;
  secretDataEncrypted: string;
  status?: ListingStatus;
}

export interface AdminCategoryPayload {
  name: string;
  slug: string;
  description: string;
  parentId: number | null;
  sortOrder: number;
  isActive: boolean;
}

export interface UpdateListingStatusRequest {
  status: ListingStatus;
}

export interface UpdateUserBalanceRequest {
  amount: number;
  description: string;
}
