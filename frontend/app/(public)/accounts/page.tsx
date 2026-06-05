import NoticeBox from "@/components/layout/NoticeBox";
import ListingBrowser from "@/components/listing/ListingBrowser";
import { getListings } from "@/services/listing.service";

interface Props {
  searchParams?: Promise<{
    game?: string;
  }>;
}

export default async function AccountsPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : {};
  const gameName = params.game ? decodeURIComponent(params.game) : undefined;
  const listings = await getListings();

  return (
    <div className="page-container">
      <NoticeBox type="accounts" />

      <section className="page-heading">
        <h1>{gameName ? `Kho acc ${gameName}` : "Kho acc"}</h1>
        <p>Tìm acc theo tên, mô tả, server, mức giá và sắp xếp theo nhu cầu.</p>
      </section>

      <ListingBrowser listings={listings} gameName={gameName} />
    </div>
  );
}
