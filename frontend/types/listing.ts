export type ListingType = "ACCOUNT" | "ITEM" | "SERVICE" | "RANDOM";

export type ListingStatus = "DRAFT" | "PUBLISHED" | "SOLD_OUT" | "HIDDEN";

export interface Listing {
  id: number;
  categoryId?: number;
  title: string;
  slug: string;
  description: string;
  price: number;
  thumbnail: string;
  gameName: string;
  serverName: string;
  listingType: ListingType;
  status: ListingStatus;
  categoryName: string;
  viewCount: number;
  createdAt?: string;
}

export interface ListingDetail extends Listing {
  images: string[];
  isFeatured: boolean;
}
