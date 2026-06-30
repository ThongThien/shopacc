"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import PurchaseConfirmModal from "@/components/order/PurchaseConfirmModal";
import { useNotify } from "@/components/shared/NotificationProvider";
import { showLoading, hideLoading } from "@/components/shared/LoadingOverlay";

import { purchaseListing } from "@/services/order.service";
import { getMyBalance } from "@/services/user.service";

import { ListingDetail as ListingDetailType } from "@/types/listing";
import { formatCurrency } from "@/lib/format";

interface Props {
  listing: ListingDetailType;
}

export default function ListingDetail({ listing }: Props) {
  const router = useRouter();
  const { notify } = useNotify();

  const images = listing.images || [];
  const defaultImage = listing.thumbnail || images[0] || "/placeholder.png";

  const [selectedImage, setSelectedImage] = useState(defaultImage);
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleBuyClick() {
    try {
      const info = await getMyBalance();

      setBalance(info.balance);
      setOpen(true);
    } catch {
      notify("error", "Vui lòng đăng nhập trước khi mua acc");
      router.push("/login");
    }
  }

  async function handleConfirmPurchase() {
    try {
      setLoading(true);
      showLoading("Đang xử lý thanh toán...");

      await purchaseListing(listing.id);

      notify("success", "Mua acc thành công. Vui lòng kiểm tra lịch sử mua.");

      window.dispatchEvent(new Event("balance-changed"));
      setOpen(false);
      router.push("/me/orders");
      router.refresh();
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Mua acc thất bại");
    } finally {
      setLoading(false);
      hideLoading();
    }
  }

  return (
    <>
      <section className="listing-detail">
        <div className="detail-left">
          <img
            src={selectedImage}
            alt={listing.title || "Listing detail"}
            className="detail-main-image"
          />

          {images.length > 1 && (
            <div className="detail-gallery">
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  className={
                    selectedImage === image
                      ? "gallery-thumb active"
                      : "gallery-thumb"
                  }
                  onClick={() => setSelectedImage(image)}
                  aria-label={`Xem ảnh ${index + 1}`}
                >
                  <img src={image} alt={`${listing.title} ${index + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="detail-right card">
          <h1>{listing.title}</h1>

          <p className="detail-price">{formatCurrency(listing.price)}</p>

          <div className="detail-info-list">
            <p>
              <b>Game:</b> {listing.gameName}
            </p>
            <p>
              <b>Server:</b> {listing.serverName || "Không có"}
            </p>
            <p>
              <b>Loại:</b> {listing.listingType}
            </p>
            <p>
              <b>Danh mục:</b> {listing.categoryName}
            </p>
            <p>
              <b>Lượt xem:</b> {listing.viewCount ?? 0}
            </p>
          </div>

          <p className="detail-description">{listing.description}</p>

          <button className="buy-button" onClick={handleBuyClick}>
            Mua ngay
          </button>
        </div>
      </section>

      <PurchaseConfirmModal
        listing={listing}
        currentBalance={balance}
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirmPurchase}
      />

      {loading && <div className="page-loading">Đang xử lý đơn hàng...</div>}
    </>
  );
}
