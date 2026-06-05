"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  deleteAdminCategory,
  getAdminCategories,
} from "@/services/admin.service";
import { Category } from "@/types/category";
import { useNotify } from "@/components/shared/NotificationProvider";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function AdminCategories() {
  const { notify, confirmAction } = useNotify();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [parentOnly, setParentOnly] = useState("parents");

  async function loadCategories() {
    setLoading(true);

    try {
      const data = await getAdminCategories();
      setCategories(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadCategories().catch(console.error);
  }, []);

  const categoryMap = useMemo(() => {
    return new Map(categories.map((item) => [item.id, item]));
  }, [categories]);

  const filteredCategories = useMemo(() => {
    const kw = keyword.toLowerCase().trim();

    return categories
      .filter((item) => {
        if (parentOnly === "parents") return !item.parentId;
        if (parentOnly === "children") return Boolean(item.parentId);
        return true;
      })
      .filter((item) => {
        if (!kw) return true;
        return `${item.name} ${item.slug} ${item.description || ""}`
          .toLowerCase()
          .includes(kw);
      });
  }, [categories, keyword, parentOnly]);

  async function handleDelete(id: number) {
    const ok = await confirmAction(
      "Nếu category đang được listing sử dụng, backend có thể từ chối xóa. Bạn vẫn muốn xóa?",
      "Xóa category",
    );

    if (!ok) return;

    try {
      await deleteAdminCategory(id);
      notify("success", "Đã xóa category");
      await loadCategories();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Xóa thất bại");
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Quản lý Categories</h1>
          <p>Hiển thị danh mục cha trước, có thể lọc danh mục con.</p>
        </div>

        <Link href="/admin/categories/create" className="btn-primary">
          Tạo category
        </Link>
      </div>

      <div className="card admin-toolbar">
        <input
          className="input"
          placeholder="Tìm tên, slug, mô tả..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <select
          className="input"
          value={parentOnly}
          onChange={(e) => setParentOnly(e.target.value)}
        >
          <option value="parents">Chỉ danh mục cha</option>
          <option value="children">Chỉ danh mục con</option>
          <option value="all">Tất cả</option>
        </select>
      </div>

      <div className="card table-card">
        {loading ? (
          <LoadingSpinner text="Đang tải categories..." />
        ) : (
          <div className="responsive-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên</th>
                  <th>Slug</th>
                  <th>Danh mục cha</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td>#{category.id}</td>
                    <td>{category.name}</td>
                    <td>{category.slug}</td>
                    <td>
                      {category.parentId
                        ? categoryMap.get(category.parentId)?.name ||
                          `#${category.parentId}`
                        : "Danh mục cha"}
                    </td>
                    <td>{category.isActive ? "Active" : "Hidden"}</td>
                    <td className="admin-actions">
                      <Link href={`/admin/categories/${category.id}/edit`}>
                        Sửa
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleDelete(category.id)}
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
