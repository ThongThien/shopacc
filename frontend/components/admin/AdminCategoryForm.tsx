"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createAdminCategory,
  getAdminCategories,
  updateAdminCategory,
} from "@/services/admin.service";
import { AdminCategoryPayload } from "@/types/admin";
import { Category } from "@/types/category";
import { useNotify } from "@/components/shared/NotificationProvider";

interface Props {
  mode: "create" | "edit";
  category?: Category;
}

const initialPayload: AdminCategoryPayload = {
  name: "",
  slug: "",
  description: "",
  parentId: null,
  sortOrder: 0,
  isActive: true,
};

export default function AdminCategoryForm({ mode, category }: Props) {
  const router = useRouter();
  const { notify, confirmAction } = useNotify();

  const [categories, setCategories] = useState<Category[]>([]);
  const [payload, setPayload] = useState<AdminCategoryPayload>(initialPayload);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void getAdminCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (!category) return;

    setPayload({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      parentId: category.parentId || null,
      sortOrder: category.sortOrder || 0,
      isActive: category.isActive,
    });
  }, [category]);

  function updateField<K extends keyof AdminCategoryPayload>(
    key: K,
    value: AdminCategoryPayload[K],
  ) {
    setPayload((prev) => ({ ...prev, [key]: value }));
  }

  function autoSlug(name: string) {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const ok = await confirmAction(
      mode === "create" ? "Tạo danh mục mới?" : "Cập nhật danh mục này?",
    );
    if (!ok) return;

    try {
      setLoading(true);

      if (mode === "create") {
        await createAdminCategory(payload);
        notify("success", "Tạo danh mục thành công");
      } else if (category) {
        await updateAdminCategory(category.id, payload);
        notify("success", "Cập nhật danh mục thành công");
      }

      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Lưu thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card admin-form" onSubmit={handleSubmit}>
      <h1>{mode === "create" ? "Tạo danh mục" : "Sửa danh mục"}</h1>

      <div className="form-grid">
        <div>
          <label>Tên danh mục</label>
          <input
            className="input"
            value={payload.name}
            onChange={(e) => {
              updateField("name", e.target.value);
              if (mode === "create")
                updateField("slug", autoSlug(e.target.value));
            }}
            placeholder="Acc sơ sinh / Dịch vụ Ngọc Rồng"
          />
        </div>

        <div>
          <label>Slug</label>
          <input
            className="input"
            value={payload.slug}
            onChange={(e) => updateField("slug", e.target.value)}
          />
        </div>

        <div>
          <label>Danh mục cha</label>
          <select
            className="input"
            value={payload.parentId || ""}
            onChange={(e) =>
              updateField(
                "parentId",
                e.target.value ? Number(e.target.value) : null,
              )
            }
          >
            <option value="">Không có</option>
            {categories
              .filter((item) => item.id !== category?.id)
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label>Thứ tự hiển thị</label>
          <input
            className="input"
            type="number"
            value={payload.sortOrder}
            onChange={(e) => updateField("sortOrder", Number(e.target.value))}
          />
        </div>

        <div className="form-col-span-2">
          <label>Mô tả</label>
          <textarea
            className="input textarea"
            value={payload.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={payload.isActive}
            onChange={(e) => updateField("isActive", e.target.checked)}
          />
          Đang hiển thị
        </label>
      </div>

      <div className="form-actions">
        <button
          className="btn-secondary"
          type="button"
          onClick={() => router.back()}
        >
          Quay lại
        </button>

        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Đang lưu..." : "Lưu danh mục"}
        </button>
      </div>
    </form>
  );
}
