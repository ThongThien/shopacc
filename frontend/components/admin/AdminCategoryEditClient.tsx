"use client";

import { useEffect, useState } from "react";
import AdminCategoryForm from "@/components/admin/AdminCategoryForm";
import { getAdminCategory } from "@/services/admin.service";
import { AdminCategoryDetail } from "@/types/category";

interface Props {
  id: number;
}

export default function AdminCategoryEditClient({ id }: Props) {
  const [category, setCategory] = useState<AdminCategoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        if (!Number.isFinite(id)) {
          setError("ID danh mục không hợp lệ");
          return;
        }

        const data = await getAdminCategory(id);
        setCategory(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Không tải được danh mục",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [id]);

  if (loading) {
    return <section className="admin-page">Đang tải...</section>;
  }

  if (error) {
    return <section className="admin-page">{error}</section>;
  }

  if (!category) {
    return <section className="admin-page">Không tìm thấy danh mục.</section>;
  }

  return <AdminCategoryForm mode="edit" category={category} />;
}
