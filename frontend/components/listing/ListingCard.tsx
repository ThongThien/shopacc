"use client";

import Link from "next/link";
import { Listing } from "@/types/listing";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/components/cart/CartContext";
import { useNotify } from "@/components/shared/NotificationProvider";

const TYPE_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  ACCOUNT: { label: "Tài khoản", bg: "#dbeafe", color: "#1e40af" },
  ITEM: { label: "Vật phẩm", bg: "#fef3c7", color: "#92400e" },
  SERVICE: { label: "Dịch vụ", bg: "#f3e8ff", color: "#6b21a8" },
  RANDOM: { label: "Ngẫu nhiên", bg: "#f3f4f6", color: "#374151" },
};

interface Props {
  listing: Listing;
}

export default function ListingCard({ listing }: Props) {
  const { addItem, items } = useCart();
  const { notify } = useNotify();
  const inCart = items.some((i) => i.listingId === listing.id);

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
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
  }

  return (
    <article className="listing-card">
      <div className="listing-image-wrap">
        <img
          src={listing.thumbnail || "/placeholder.png"}
          alt={listing.title || "Listing"}
          className="listing-image"
        />

        <span className="listing-code">MS: #{listing.id}</span>
      </div>

      <div className="listing-card-body">
        <h3>{listing.title}</h3>

        <div className="listing-tags">
          {listing.listingType && TYPE_CONFIG[listing.listingType] && (
            <span
              style={{
                background: TYPE_CONFIG[listing.listingType].bg,
                color: TYPE_CONFIG[listing.listingType].color,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: 700,
                borderRadius: 8,
              }}
            >
              {TYPE_CONFIG[listing.listingType].label}
            </span>
          )}
          <span style={{ background: "rgba(255,255,255,0.06)", color: "var(--color-text-secondary)", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
            {listing.gameName}
          </span>
          {listing.serverName && <span style={{ background: "rgba(255,255,255,0.06)", color: "var(--color-text-muted)", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 500 }}>SV {listing.serverName}</span>}
        </div>

        <div className="listing-card-footer">
          <strong>{formatCurrency(listing.price)}</strong>
          <Link href={`/account/${listing.id}`} style={{ color: "var(--color-text-muted)", fontSize: 13 }}>
            Chi tiết →
          </Link>
        </div>

        <button
          type="button"
          className={inCart ? "btn-secondary" : "btn-primary"}
          style={{ width: "100%", height: 44, fontSize: 14 }}
          disabled={inCart}
          onClick={handleAddToCart}
        >
          {inCart ? "Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}
        </button>
      </div>
    </article>
  );
}
