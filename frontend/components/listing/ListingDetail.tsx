"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import PurchaseConfirmModal from "@/components/order/PurchaseConfirmModal";
import { useNotify } from "@/components/shared/NotificationProvider";

import { getMyBalance } from "@/services/user.service";

import { ListingDetail as ListingDetailType } from "@/types/listing";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/components/cart/CartContext";
import Lightbox from "@/components/shared/Lightbox";

interface Props {
  listing: ListingDetailType;
}

export default function ListingDetail({ listing }: Props) {
  const router = useRouter();
  const { notify } = useNotify();
  const { addItem, items } = useCart();
  const inCart = items.some((i) => i.listingId === listing.id);

  const images = listing.images || [];
  const defaultImage = listing.thumbnail || images[0] || "/placeholder.png";

  const [selectedImage, setSelectedImage] = useState(defaultImage);
  const [open, setOpen] = useState(false);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

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
    if (!inCart) {
      try {
        await addItem({
          listingId: listing.id,
          title: listing.title || "",
          price: listing.price,
          thumbnail: listing.thumbnail,
          gameName: listing.gameName,
          serverName: listing.serverName,
        });
      } catch {
        // ignore — continue to checkout anyway
      }
    }

    setOpen(false);
    router.push("/checkout");
  }

  return (
    <>
      <section className="listing-detail">
        <div className="detail-left">
          <img
            src={selectedImage}
            alt={listing.title || "Listing detail"}
            className="detail-main-image"
            style={{ cursor: "pointer" }}
            onClick={() => setLightboxIdx(images.indexOf(selectedImage))}
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

          {listing.listingType && listing.listingType !== "ACCOUNT" && (
            <span
              style={{
                display: "inline-block",
                padding: "4px 12px",
                borderRadius: 999,
                background: listing.listingType === "SERVICE" ? "#f3e8ff" : "#fef3c7",
                color: listing.listingType === "SERVICE" ? "#6b21a8" : "#92400e",
                fontWeight: 800,
                fontSize: 13,
                marginBottom: 10,
              }}
            >
              {listing.listingType === "SERVICE" ? "Dịch vụ" : "Vật phẩm"}
            </span>
          )}

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

          <div style={{ display: "grid", gap: 10 }}>
            <button className="buy-button" onClick={handleBuyClick}>
              Mua ngay
            </button>
            <button
              type="button"
              className={inCart ? "btn-secondary" : "btn-primary"}
              style={{
                ...(inCart
                  ? {}
                  : { background: "white", color: "var(--color-primary)" }),
              }}
              disabled={inCart}
              onClick={async () => {
                if (inCart) return;
                try {
                  await addItem({
                    listingId: listing.id,
                    title: listing.title || "",
                    price: listing.price,
                    thumbnail: listing.thumbnail,
                    gameName: listing.gameName,
                    serverName: listing.serverName,
                  });
                  notify("success", "Đã thêm vào giỏ hàng");
                } catch (err) {
                  notify("error", err instanceof Error ? err.message : "Thêm vào giỏ thất bại");
                }
              }}
            >
              {inCart ? "Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}
            </button>
          </div>
        </div>
      </section>

      <PurchaseConfirmModal
        listing={listing}
        currentBalance={balance}
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirmPurchase}
      />

      {lightboxIdx != null && (
        <Lightbox
          images={images}
          currentIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onPrev={() =>
            setLightboxIdx((i) =>
              i != null ? (i - 1 + images.length) % images.length : 0,
            )
          }
          onNext={() =>
            setLightboxIdx((i) =>
              i != null ? (i + 1) % images.length : 0,
            )
          }
        />
      )}

      {loading && <div className="page-loading">Đang xử lý đơn hàng...</div>}
    </>
  );
}
