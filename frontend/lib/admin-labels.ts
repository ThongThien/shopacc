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
    RANDOM: "May mắn",
  };

  return labels[type] || type;
}

export function orderStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Chờ xác nhận",
    COMPLETED: "Hoàn tất",
    CANCELLED: "Đã hủy",
  };

  return labels[status] || status;
}

export function paymentStatusLabel(status: string) {
  const labels: Record<string, string> = {
    UNPAID: "Chưa thanh toán",
    PAID: "Đã thanh toán",
  };

  return labels[status] || status;
}
export function booleanSoldLabel(sold: boolean) {
  return sold ? "Đã bán" : "Chưa bán";
}

export function auditActionLabel(action: string) {
  const labels: Record<string, string> = {
    USER_LOGIN: "User đăng nhập",
    USER_REGISTER: "User đăng ký",
    USER_PURCHASE: "User mua hàng",
    USER_VIEW_SECRET: "User xem thông tin acc",

    ADMIN_CREATE_LISTING: "Admin tạo listing",
    ADMIN_UPDATE_LISTING: "Admin sửa listing",
    ADMIN_DELETE_LISTING: "Admin xóa listing",
    ADMIN_UPLOAD_LISTING_IMAGE: "Admin upload ảnh listing",
    ADMIN_DELETE_LISTING_IMAGE: "Admin xóa ảnh listing",

    ADMIN_CREATE_CATEGORY: "Admin tạo danh mục",
    ADMIN_UPDATE_CATEGORY: "Admin sửa danh mục",
    ADMIN_DELETE_CATEGORY: "Admin xóa danh mục",

    ADMIN_ADJUST_BALANCE: "Admin chỉnh số dư",
    ADMIN_APPROVE_TRANSACTION: "Admin duyệt giao dịch",
    ADMIN_REJECT_TRANSACTION: "Admin từ chối giao dịch",

    ADMIN_VIEW_ORDER_DETAIL: "Admin xem chi tiết hóa đơn",
    ADMIN_REFUND_ORDER: "Admin hoàn tiền hóa đơn",
    ADMIN_CANCEL_EXPIRED_ORDERS: "Hệ thống hủy đơn quá hạn",
  };

  return labels[action] || action;
}

export function paymentMethodLabel(method?: string) {
  const labels: Record<string, string> = {
    BALANCE: "Ví tài khoản",
    SEPAY: "SePay",
    CARD: "Thẻ cào",
  };

  return method ? labels[method] || method : "-";
}
