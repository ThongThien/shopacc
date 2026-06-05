"use client";

import Link from "next/link";
import { AdminListingDetail as AdminListingDetailType } from "@/types/admin-listing";
import { formatCurrency, formatDateTime } from "@/lib/format";
import {
  booleanSoldLabel,
  listingStatusLabel,
  listingTypeLabel,
} from "@/lib/admin-labels";

interface Props {
  listing: AdminListingDetailType;
}

export default function AdminListingDetail({ listing }: Props) {
  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Xem chi tiết listing</h1>
          <p>Thông tin đầy đủ của listing, chỉ đọc, không chỉnh sửa.</p>
        </div>

        <div className="admin-actions">
          <Link href="/admin/listings" className="btn-secondary">
            Quay lại
          </Link>

          <Link
            href={`/admin/listings/${listing.id}/edit`}
            className="btn-primary"
          >
            Sửa listing
          </Link>
        </div>
      </div>

      <div className="admin-detail-grid">
        <div className="card admin-detail-card">
          <h2>Thông tin listing</h2>

          <img
            className="admin-detail-image"
            src={listing.thumbnail || "/placeholder.png"}
            alt={listing.title}
          />

          <div className="admin-info-list">
            <p>
              <b>ID:</b> #{listing.id}
            </p>
            <p>
              <b>Tiêu đề:</b> {listing.title}
            </p>
            <p>
              <b>Slug:</b> {listing.slug}
            </p>
            <p>
              <b>Loại:</b> {listingTypeLabel(listing.listingType)}
            </p>
            <p>
              <b>Game:</b> {listing.gameName}
            </p>
            <p>
              <b>Server:</b> {listing.serverName || "-"}
            </p>
            <p>
              <b>Danh mục:</b> {listing.categoryName || "-"}
            </p>
            <p>
              <b>Giá:</b> {formatCurrency(listing.price)}
            </p>
            <p>
              <b>Trạng thái:</b> {listingStatusLabel(listing.status)}
            </p>
            <p>
              <b>Lượt xem:</b> {listing.viewCount || 0}
            </p>
            <p>
              <b>Ngày tạo:</b> {formatDateTime(listing.createdAt)}
            </p>
            <p>
              <b>Cập nhật:</b> {formatDateTime(listing.updatedAt)}
            </p>
          </div>
        </div>

        <div className="card admin-detail-card">
          <h2>Tình trạng bán</h2>

          <div className="admin-info-list">
            <p>
              <b>Tình trạng:</b> {booleanSoldLabel(listing.sold)}
            </p>

            {listing.sold ? (
              <>
                <p>
                  <b>User ID:</b> #{listing.buyerUserId}
                </p>
                <p>
                  <b>Người mua:</b> {listing.buyerUsername}
                </p>
                <p>
                  <b>Email:</b> {listing.buyerEmail}
                </p>
                <p>
                  <b>Order ID:</b> #{listing.orderId}
                </p>
                <p>
                  <b>Mã đơn:</b> {listing.orderCode}
                </p>
                <p>
                  <b>Ngày bán:</b>{" "}
                  {listing.soldAt ? formatDateTime(listing.soldAt) : "-"}
                </p>

                {listing.orderId && (
                  <Link
                    className="btn-secondary"
                    href={`/admin/orders/${listing.orderId}`}
                  >
                    Xem đơn hàng
                  </Link>
                )}
              </>
            ) : (
              <p className="muted-text">Listing này chưa có đơn hoàn tất.</p>
            )}
          </div>
        </div>

        <div className="card admin-detail-card">
          <h2>Mô tả</h2>
          <p className="admin-description">{listing.description || "-"}</p>
        </div>

        <div className="card admin-detail-card">
          <h2>Secret data</h2>
          <pre className="secret-content">{listing.secretData || "-"}</pre>
        </div>

        <div className="card admin-detail-card admin-detail-gallery-card">
          <h2>Ảnh listing</h2>

          {listing.images.length === 0 ? (
            <p className="muted-text">Chưa có ảnh phụ.</p>
          ) : (
            <div className="admin-detail-gallery">
              {listing.images.map((image, index) => (
                <img
                  key={`${image}-${index}`}
                  src={image}
                  alt={`${listing.title} ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
