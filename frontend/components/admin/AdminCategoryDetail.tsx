"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AdminCategoryDetail as AdminCategoryDetailType } from "@/types/category";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { listingStatusLabel, listingTypeLabel } from "@/lib/admin-labels";

interface Props {
  category: AdminCategoryDetailType;
}

const PAGE_SIZE = 8;

export default function AdminCategoryDetail({ category }: Props) {
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  const filteredListings = useMemo(() => {
    const kw = keyword.toLowerCase().trim();

    return category.listings.filter((listing) => {
      if (!kw) return true;

      return `${listing.title} ${listing.description} ${listing.serverName}`
        .toLowerCase()
        .includes(kw);
    });
  }, [category.listings, keyword]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredListings.length / PAGE_SIZE),
  );

  const visibleListings = filteredListings.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );
  console.log("category detail:", category);
  console.log("listings:", category.listings);
  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Chi tiết danh mục</h1>
          <p>Xem thông tin danh mục và toàn bộ listing thuộc danh mục này.</p>
        </div>

        <div className="admin-actions">
          <Link href="/admin/categories" className="btn-secondary">
            Quay lại
          </Link>

          <Link
            href={`/admin/categories/${category.id}/edit`}
            className="btn-primary"
          >
            Sửa danh mục
          </Link>
        </div>
      </div>

      <div className="admin-detail-grid">
        <div className="card admin-detail-card">
          <h2>Thông tin danh mục</h2>

          <div className="admin-info-list">
            <p>
              <b>ID:</b> #{category.id}
            </p>
            <p>
              <b>Tên:</b> {category.name}
            </p>
            <p>
              <b>Slug:</b> {category.slug}
            </p>
            <p>
              <b>Mô tả:</b> {category.description || "-"}
            </p>
            <p>
              <b>Thuộc nhóm game:</b> {category.parentName || "-"}
            </p>
            <p>
              <b>Số listing:</b> {category.listingCount ?? 0}
            </p>
            <p>
              <b>Trạng thái:</b>{" "}
              {category.isActive ? "Đang hoạt động" : "Đã tắt"}
            </p>
            <p>
              <b>Ngày tạo:</b>{" "}
              {category.createdAt ? formatDateTime(category.createdAt) : "-"}
            </p>
            <p>
              <b>Cập nhật:</b>{" "}
              {category.updatedAt ? formatDateTime(category.updatedAt) : "-"}
            </p>
          </div>
        </div>

        <div className="card admin-detail-card">
          <h2>Ghi chú logic</h2>
          <p className="admin-description">
            Listing luôn nên thuộc một danh mục cụ thể. Nếu muốn chuyển listing
            sang danh mục khác, hãy vào trang sửa listing và đổi danh mục.
          </p>
        </div>
      </div>

      <div className="card table-card admin-section-gap">
        <div className="table-heading">
          <div>
            <h2>Listings thuộc danh mục</h2>
            <p>Danh sách sản phẩm đang được gắn vào danh mục này.</p>
          </div>

          <input
            className="input admin-table-search"
            placeholder="Tìm listing trong danh mục..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
          />
        </div>

        <div className="responsive-table">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tiêu đề</th>
                <th>Loại</th>
                <th>Server</th>
                <th>Giá</th>
                <th>Trạng thái</th>
                <th>Lượt xem</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {visibleListings.map((listing) => (
                <tr key={listing.id}>
                  <td>#{listing.id}</td>
                  <td>{listing.title}</td>
                  <td>{listingTypeLabel(listing.listingType)}</td>
                  <td>{listing.serverName || "-"}</td>
                  <td>{formatCurrency(listing.price)}</td>
                  <td>{listingStatusLabel(listing.status)}</td>
                  <td>{listing.viewCount || 0}</td>
                  <td className="admin-actions">
                    <Link href={`/admin/listings/${listing.id}`}>Xem</Link>
                    <Link href={`/admin/listings/${listing.id}/edit`}>Sửa</Link>
                  </td>
                </tr>
              ))}

              {visibleListings.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <p className="empty-text">Danh mục này chưa có listing.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <button
            className="btn-secondary"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            Trước
          </button>

          <span>
            Trang {page}/{totalPages}
          </span>

          <button
            className="btn-secondary"
            disabled={page >= totalPages}
            onClick={() => setPage((current) => current + 1)}
          >
            Sau
          </button>
        </div>
      </div>
    </section>
  );
}
