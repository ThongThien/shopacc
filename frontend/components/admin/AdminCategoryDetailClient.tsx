"use client";

import { useEffect, useState } from "react";
import AdminCategoryDetail from "@/components/admin/AdminCategoryDetail";
import { getAdminCategory } from "@/services/admin.service";
import { AdminCategoryDetail as AdminCategoryDetailType } from "@/types/category";

interface Props {
  id: number;
}

export default function AdminCategoryDetailClient({ id }: Props) {
  const [category, setCategory] = useState<AdminCategoryDetailType | null>(
    null,
  );
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
        console.log("CATEGORY DETAIL DATA:", data);
        console.log("CATEGORY LISTINGS:", data.listings);
        console.log("CATEGORY LISTINGS LENGTH:", data.listings?.length);
        setCategory({
          ...data,
          listings: data.listings || [],
        });
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

  return <AdminCategoryDetail category={category} />;
}
