import { getListingDetail } from "@/services/listing.service";
import ServiceDetailView from "@/components/service/ServiceDetailView";

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingDetail(Number(id));

  return (
    <div className="page-container" style={{ maxWidth: 1040 }}>
      <ServiceDetailView listing={listing} />
    </div>
  );
}
