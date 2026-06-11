import AdminCategoryDetailClient from "@/components/admin/AdminCategoryDetailClient";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminCategoryDetailPage({ params }: Props) {
  const { id } = await params;

  return <AdminCategoryDetailClient id={Number(id)} />;
}
