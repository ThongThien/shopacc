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
import AdminPagination from "@/components/admin/AdminPagination";

const PAGE_SIZE = 10;

export default function AdminCategories() {
  const { notify, confirmAction } = useNotify();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [page, setPage] = useState(1);

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

  useEffect(() => {
    setPage(1);
  }, [keyword, selectedCategoryId]);

  const childCategories = useMemo(() => {
    return categories.filter((category) => category.parentId);
  }, [categories]);

  const filteredCategories = useMemo(() => {
    const kw = keyword.toLowerCase().trim();

    return childCategories
      .filter((category) => {
        if (!selectedCategoryId) return true;
        return String(category.id) === selectedCategoryId;
      })
      .filter((category) => {
        if (!kw) return true;

        return `${category.name} ${category.slug} ${category.description || ""} ${category.parentName || ""}`
          .toLowerCase()
          .includes(kw);
      });
  }, [childCategories, keyword, selectedCategoryId]);

  const visibleCategories = useMemo(() => {
    return filteredCategories.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [filteredCategories, page]);

  async function handleDelete(category: Category) {
    const ok = await confirmAction(
      `Bạn chắc chắn muốn xóa danh mục "${category.name}"? Nếu danh mục này đang có sản phẩm, hệ thống sẽ không cho xóa.`,
      "Xóa danh mục",
    );

    if (!ok) return;

    try {
      await deleteAdminCategory(category.id);
      notify("success", "Đã xóa danh mục");
      await loadCategories();
    } catch (error) {
      notify(
        "error",
        error instanceof Error ? error.message : "Xóa danh mục thất bại",
      );
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Quản lý danh mục</h1>
          <p>
            Quản lý các danh mục bán hàng như acc sơ sinh, acc bông tai, dịch vụ
            săn đệ.
          </p>
        </div>

        <Link href="/admin/categories/create" className="btn-primary">
          Tạo danh mục
        </Link>
      </div>

      <div className="admin-summary-row">
        <span>Tổng danh mục: {categories.length}</span>
        <span>Đang hiển thị: {categories.filter((c) => c.isActive).length}</span>
        <span>Đã ẩn: {categories.filter((c) => !c.isActive).length}</span>
      </div>

      <div className="card admin-toolbar">
        <input
          className="input"
          placeholder="Tìm tên, slug, mô tả danh mục..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <select
          className="input"
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
        >
          <option value="">Tất cả danh mục bán hàng</option>

          {childCategories.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.name}{" "}
              {category.parentName ? `(${category.parentName})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="card table-card">
        {loading ? (
          <LoadingSpinner text="Đang tải danh mục..." />
        ) : (
          <>
            <div className="responsive-table">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên danh mục</th>
                    <th>Slug</th>
                    <th>Nhóm game</th>
                    <th>Số sản phẩm</th>
                    <th>Trạng thái</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {visibleCategories.map((category) => (
                    <tr key={category.id}>
                      <td>#{category.id}</td>
                      <td>{category.name}</td>
                      <td>{category.slug}</td>
                      <td>{category.parentName || "-"}</td>
                      <td>{category.listingCount ?? 0}</td>
                      <td>{category.isActive ? "Đang hiển thị" : "Đã ẩn"}</td>
                      <td>
                        <div style={{ display: "flex", gap: 6, whiteSpace: "nowrap" }}>
                          <Link href={`/admin/categories/${Number(category.id)}`}
                            className="btn-secondary" style={{ padding: "4px 10px", fontSize: 12, height: 30, color: "var(--color-cyan)", borderColor: "var(--color-cyan)" }}>Xem</Link>
                          <Link href={`/admin/categories/${category.id}/edit`}
                            className="btn-secondary" style={{ padding: "4px 10px", fontSize: 12, height: 30, color: "var(--color-primary)", borderColor: "var(--color-primary)" }}>Sửa</Link>
                          <button type="button" onClick={() => handleDelete(category)}
                            className="btn-secondary" style={{ padding: "4px 10px", fontSize: 12, height: 30, color: "var(--color-danger)", borderColor: "var(--color-danger)" }}>Xóa</button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {visibleCategories.length === 0 && (
                    <tr>
                      <td colSpan={7}>
                        <p className="empty-text">Không có danh mục phù hợp.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <AdminPagination
              page={page}
              totalItems={filteredCategories.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </section>
  );
}
