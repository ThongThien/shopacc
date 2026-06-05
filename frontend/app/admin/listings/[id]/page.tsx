import AdminListingDetailClient from "@/components/admin/AdminListingDetailClient";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminListingDetailPage({ params }: Props) {
  const { id } = await params;

  return <AdminListingDetailClient id={Number(id)} />;
}
