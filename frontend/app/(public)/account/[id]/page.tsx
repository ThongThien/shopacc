import NoticeBox from "@/components/layout/NoticeBox";
import ListingDetail from "@/components/listing/ListingDetail";
import { getListingDetail } from "@/services/listing.service";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function AccountDetailPage({ params }: Props) {
  const { id } = await params;
  const listing = await getListingDetail(Number(id));

  return (
    <div className="page-container">
      <NoticeBox type="detail" />

      <ListingDetail listing={listing} />
    </div>
  );
}
