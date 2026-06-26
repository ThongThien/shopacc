import AdminUserDetailClient from "@/components/admin/AdminUserDetailClient";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminUserDetailPage({ params }: Props) {
  const { id } = await params;

  return <AdminUserDetailClient id={Number(id)} />;
}
