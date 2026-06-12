"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  deleteAdminListing,
  getAdminCategories,
  getAdminListings,
} from "@/services/admin.service";
import { Listing, ListingType } from "@/types/listing";
import AdminPagination from "@/components/admin/AdminPagination";
import { Category } from "@/types/category";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useNotify } from "@/components/shared/NotificationProvider";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { listingStatusLabel, listingTypeLabel } from "@/lib/admin-labels";

type SortKey = "price" | "createdAt" | "updatedAt" | "viewCount";
type SortDirection = "asc" | "desc";

const PAGE_SIZE = 10;

export default function AdminListings() {
  const { notify, confirmAction } = useNotify();

  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const [listingType, setListingType] = useState<ListingType | "">("");
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState("");
  const [activeGame, setActiveGame] = useState("all");

  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const [page, setPage] = useState(1);

  async function loadData() {
    setLoading(true);

    try {
      const [listingData, categoryData] = await Promise.all([
        getAdminListings(),
        getAdminCategories(),
      ]);

      setListings(listingData);
      setCategories(categoryData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData().catch(console.error);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [
    keyword,
    categoryId,
    status,
    listingType,
    activeGame,
    sortKey,
    sortDirection,
  ]);

  const games = useMemo(() => {
    return Array.from(
      new Set(listings.map((listing) => listing.gameName).filter(Boolean)),
    );
  }, [listings]);

  const filteredListings = useMemo(() => {
    const kw = keyword.toLowerCase().trim();

    return [...listings]
      .filter((item) => {
        if (activeGame === "all") return true;
        return item.gameName === activeGame;
      })
      .filter((item) => {
        if (!kw) return true;

        return `${item.title || ""} ${item.description || ""} ${item.serverName || ""}`
          .toLowerCase()
          .includes(kw);
      })
      .filter((item) => {
        if (!categoryId) return true;
        return String(item.categoryId) === categoryId;
      })
      .filter((item) => {
        if (!listingType) return true;
        return item.listingType === listingType;
      })
      .filter((item) => {
        if (!status) return true;
        return item.status === status;
      })
      .sort((a, b) => {
        let aValue = 0;
        let bValue = 0;

        if (sortKey === "price") {
          aValue = a.price;
          bValue = b.price;
        }

        if (sortKey === "viewCount") {
          aValue = a.viewCount || 0;
          bValue = b.viewCount || 0;
        }

        if (sortKey === "createdAt") {
          aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        }

        if (sortKey === "updatedAt") {
          aValue = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          bValue = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        }

        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      });
  }, [
    listings,
    keyword,
    categoryId,
    status,
    listingType,
    activeGame,
    sortKey,
    sortDirection,
  ]);

  const visibleListings = useMemo(() => {
    return filteredListings.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [filteredListings, page]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(key);
    setSortDirection("desc");
  }

  function sortLabel(key: SortKey) {
    if (sortKey !== key) return "";
    return sortDirection === "asc" ? " ↑" : " ↓";
  }

  async function handleDelete(id: number) {
    const ok = await confirmAction(
      "Nếu sản phẩm đã có đơn hàng hoàn tất thì hệ thống sẽ không cho xóa. Bạn chắc chắn muốn xóa?",
      "Xóa sản phẩm",
    );

    if (!ok) return;

    try {
      await deleteAdminListing(id);
      notify("success", "Đã xóa sản phẩm");
      await loadData();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Xóa thất bại");
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Quản lý sản phẩm</h1>
          <p>Quản lý acc, dịch vụ, vật phẩm và các sản phẩm số.</p>
        </div>

        <Link href="/admin/listings/create" className="btn-primary">
          Tạo sản phẩm
        </Link>
      </div>

      <div className="card admin-toolbar">
        <input
          className="input"
          placeholder="Tìm tiêu đề, mô tả, máy chủ..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <select
          className="input"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((category) => (
            <option key={category.id} value={String(category.id)}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          className="input"
          value={listingType}
          onChange={(e) => setListingType(e.target.value as ListingType | "")}
        >
          <option value="">TTất cả loại sản phẩm</option>
          <option value="ACCOUNT">Tài khoản</option>
          <option value="ITEM">Vật phẩm</option>
          <option value="SERVICE">Dịch vụ</option>
          <option value="RANDOM">Random</option>
        </select>

        <select
          className="input"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PUBLISHED">Đang bán</option>
          <option value="SOLD_OUT">Đã bán</option>
          <option value="DRAFT">Nháp</option>
        </select>

        <div className="admin-game-tabs">
          <button
            className={
              activeGame === "all" ? "btn btn-primary" : "btn btn-outline"
            }
            type="button"
            onClick={() => setActiveGame("all")}
          >
            Tất cả
          </button>

          {games.map((game) => (
            <button
              key={game}
              className={
                activeGame === game ? "btn btn-primary" : "btn btn-outline"
              }
              type="button"
              onClick={() => setActiveGame(game)}
            >
              {game}
            </button>
          ))}
        </div>
      </div>

      <div className="card table-card">
        {loading ? (
          <LoadingSpinner text="Đang tải sản phẩm..." />
        ) : (
          <>
            <div className="responsive-table">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tiêu đề</th>
                    <th>Loại</th>
                    <th>Game</th>
                    <th>Máy chủ</th>
                    <th onClick={() => toggleSort("viewCount")}>
                      Lượt xem{sortLabel("viewCount")}
                    </th>
                    <th onClick={() => toggleSort("price")}>
                      Giá{sortLabel("price")}
                    </th>
                    <th>Trạng thái</th>
                    <th onClick={() => toggleSort("createdAt")}>
                      Ngày tạo{sortLabel("createdAt")}
                    </th>
                    <th onClick={() => toggleSort("updatedAt")}>
                      Cập nhật lần cuối{sortLabel("updatedAt")}
                    </th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {visibleListings.map((listing) => (
                    <tr key={listing.id}>
                      <td>#{listing.id}</td>
                      <td>{listing.title}</td>
                      <td>{listingTypeLabel(listing.listingType)}</td>
                      <td>{listing.gameName}</td>
                      <td>{listing.serverName || "-"}</td>
                      <td>{listing.viewCount || 0}</td>
                      <td>{formatCurrency(listing.price)}</td>
                      <td>{listingStatusLabel(listing.status)}</td>
                      <td>{formatDateTime(listing.createdAt || "")}</td>
                      <td>{formatDateTime(listing.updatedAt || "")}</td>
                      <td className="admin-actions">
                        <Link href={`/admin/listings/${listing.id}`}>Xem</Link>

                        <Link href={`/admin/listings/${listing.id}/edit`}>
                          Sửa
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleDelete(listing.id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))}

                  {visibleListings.length === 0 && (
                    <tr>
                      <td colSpan={11} className="empty-cell">
                        Không có sản phẩm nào.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <AdminPagination
              page={page}
              totalItems={filteredListings.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </section>
  );
}
