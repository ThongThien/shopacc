import NoticeBox from "@/components/layout/NoticeBox";
import ListingBrowser from "@/components/listing/ListingBrowser";
import { getListings } from "@/services/listing.service";

interface Props {
  params: Promise<{
    categorySlug: string;
  }>;
}

export default async function CategoryAccountsPage({ params }: Props) {
  const { categorySlug } = await params;
  const listings = await getListings();

  return (
    <div className="page-container">
      <NoticeBox type="accounts" />

      <section className="page-heading">
        <h1>Danh sách acc</h1>
        <p>Danh sách acc thuộc danh mục: {categorySlug}</p>
      </section>

      <ListingBrowser listings={listings} categorySlug={categorySlug} />
    </div>
  );
}
