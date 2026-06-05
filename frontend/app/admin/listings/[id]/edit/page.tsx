import AdminListingEditClient from "@/components/admin/AdminListingEditClient";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;

  return <AdminListingEditClient id={Number(id)} />;
}
