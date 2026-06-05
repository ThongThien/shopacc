import { ListingStatus, ListingType } from "@/types/listing";

export function listingStatusLabel(status: ListingStatus | string) {
  const labels: Record<string, string> = {
    DRAFT: "Nháp",
    PUBLISHED: "Đang bán",
    SOLD_OUT: "Đã bán",
    HIDDEN: "Đã ẩn",
  };

  return labels[status] || status;
}

export function listingTypeLabel(type: ListingType | string) {
  const labels: Record<string, string> = {
    ACCOUNT: "Tài khoản",
    SERVICE: "Dịch vụ",
    ITEM: "Vật phẩm",
    RANDOM: "Random",
  };

  return labels[type] || type;
}

export function booleanSoldLabel(sold: boolean) {
  return sold ? "Đã bán" : "Chưa bán";
}