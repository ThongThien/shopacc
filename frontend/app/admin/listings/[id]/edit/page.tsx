import AdminListingForm from "@/components/admin/AdminListingForm";
import { getAdminListing } from "@/services/admin.service";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;
  const listing = await getAdminListing(Number(id));

  return <AdminListingForm mode="edit" listing={listing} />;
}
