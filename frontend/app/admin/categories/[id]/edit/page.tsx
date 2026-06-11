import AdminCategoryEditClient from "@/components/admin/AdminCategoryEditClient";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;

  return <AdminCategoryEditClient id={Number(id)} />;
}
