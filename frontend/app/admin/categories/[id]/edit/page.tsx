import AdminCategoryForm from "@/components/admin/AdminCategoryForm";
import { getAdminCategory } from "@/services/admin.service";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: Props) {
  const { id } = await params;
  const category = await getAdminCategory(Number(id));

  return <AdminCategoryForm mode="edit" category={category} />;
}
