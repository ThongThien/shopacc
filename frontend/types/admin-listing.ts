import { ListingStatus, ListingType } from "@/types/listing";

export interface AdminListingDetail {
  id: number;
  categoryId: number | null;
  categoryName: string | null;
  listingType: ListingType;
  gameName: string;
  serverName: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  thumbnail: string;
  status: ListingStatus;
  isFeatured: boolean;
  viewCount: number;
  secretData: string;
  images: string[];
  sold: boolean;
  buyerUserId: number | null;
  buyerUsername: string | null;
  buyerEmail: string | null;
  orderId: number | null;
  orderCode: string | null;
  soldAt: string | null;
  createdAt: string;
  updatedAt: string;
}
