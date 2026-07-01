"use client";

import Link from "next/link";
import { Listing } from "@/types/listing";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/components/cart/CartContext";
import { useNotify } from "@/components/shared/NotificationProvider";

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
          <span>{listing.gameName}</span>
          {listing.serverName && <span>SV {listing.serverName}</span>}
        </div>

        <div className="listing-card-footer">
          <strong>{formatCurrency(listing.price)}</strong>

          <Link href={`/account/${listing.id}`} className="listing-detail-btn">
            Xem chi tiết
          </Link>
        </div>

        <button
          type="button"
          className={inCart ? "btn-secondary" : "btn-primary"}
          style={{ marginTop: 10, width: "100%", padding: "8px 12px", fontSize: 13 }}
          disabled={inCart}
          onClick={handleAddToCart}
        >
          {inCart ? "Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}
        </button>
      </div>
    </article>
  );
}
