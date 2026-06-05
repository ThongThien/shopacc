import { Listing } from "@/types/listing";
import ListingCard from "./ListingCard";

interface Props {
  listings?: Listing[];
}

export default function ListingGrid({ listings = [] }: Props) {
  const safeListings = listings.filter(Boolean);

  if (safeListings.length === 0) {
    return <p className="empty-text">Chưa có acc nào.</p>;
  }

  return (
    <div className="listing-grid">
      {safeListings.map((listing) => (
        <ListingCard key={listing.id} listing={listing} />
      ))}
    </div>
  );
}
