"use client";

import Link from "next/link";
import { Listing } from "@/types/listing";
import { formatCurrency } from "@/lib/format";

interface Props {
  listing: Listing;
}

export default function ListingCard({ listing }: Props) {
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
      </div>
    </article>
  );
}
