"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  deleteAdminListing,
  getAdminListings,
  updateAdminListingStatus,
} from "@/services/admin.service";
import { Listing, ListingStatus } from "@/types/listing";
import { formatCurrency } from "@/lib/format";
import { useNotify } from "@/components/shared/NotificationProvider";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function AdminListings() {
  const { notify, confirmAction } = useNotify();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [listingType, setListingType] = useState("");
  const [gameName, setGameName] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  async function loadListings() {
    setLoading(true);

    try {
      const data = await getAdminListings();
      setListings(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadListings().catch(console.error);
  }, []);

  const filteredListings = useMemo(() => {
    const kw = keyword.toLowerCase().trim();

    return listings
      .filter((item) => {
        if (!kw) return true;

        return `${item.title} ${item.description} ${item.gameName} ${item.serverName}`
          .toLowerCase()
          .includes(kw);
      })
      .filter((item) => {
        if (!status) return true;
        return item.status === status;
      })
      .filter((item) => {
        if (!listingType) return true;
        return item.listingType === listingType;
      })
      .filter((item) => {
        if (!gameName) return true;
        return item.gameName.toLowerCase().includes(gameName.toLowerCase());
      })
      .sort((a, b) => {
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "price-asc") return a.price - b.price;

        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : a.id;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : b.id;

        if (sortBy === "oldest") return aDate - bDate;

        return bDate - aDate;
      });
  }, [listings, keyword, status, listingType, gameName, sortBy]);

  async function handleDelete(id: number) {
    const ok = await confirmAction(
      "Listing bị xóa sẽ không thể hiển thị lại. Bạn chắc chắn muốn xóa?",
      "Xóa listing",
    );

    if (!ok) return;

    try {
      await deleteAdminListing(id);
      notify("success", "Đã xóa listing");
      await loadListings();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Xóa thất bại");
    }
  }

  async function handleStatus(id: number, nextStatus: ListingStatus) {
    try {
      await updateAdminListingStatus(id, { status: nextStatus });
      notify("success", "Đã cập nhật trạng thái listing");
      await loadListings();
    } catch (error) {
      notify(
        "error",
        error instanceof Error ? error.message : "Cập nhật thất bại",
      );
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Quản lý Listings</h1>
          <p>Quản lý acc, dịch vụ, vật phẩm, vàng/ngọc trong shop.</p>
        </div>

        <Link href="/admin/listings/create" className="btn-primary">
          Tạo listing
        </Link>
      </div>

      <div className="card admin-toolbar">
        <input
          className="input"
          placeholder="Tìm title, mô tả, game, server..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <input
          className="input"
          placeholder="Game name"
          value={gameName}
          onChange={(e) => setGameName(e.target.value)}
        />

        <select
          className="input"
          value={listingType}
          onChange={(e) => setListingType(e.target.value)}
        >
          <option value="">Tất cả loại</option>
          <option value="ACCOUNT">ACCOUNT</option>
          <option value="SERVICE">SERVICE</option>
          <option value="ITEM">ITEM</option>
          <option value="RANDOM">RANDOM</option>
        </select>

        <select
          className="input"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PUBLISHED">PUBLISHED</option>
          <option value="HIDDEN">HIDDEN</option>
          <option value="SOLD_OUT">SOLD_OUT</option>
          <option value="DRAFT">DRAFT</option>
        </select>

        <select
          className="input"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="price-desc">Giá cao đến thấp</option>
          <option value="price-asc">Giá thấp đến cao</option>
        </select>
      </div>

      <div className="card table-card">
        {loading ? (
          <LoadingSpinner text="Đang tải listings..." />
        ) : (
          <div className="responsive-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tiêu đề</th>
                  <th>Loại</th>
                  <th>Game</th>
                  <th>Server</th>
                  <th>Lượt xem</th>
                  <th>Giá</th>
                  <th>Trạng thái</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredListings.map((listing) => (
                  <tr key={listing.id}>
                    <td>#{listing.id}</td>
                    <td>{listing.title}</td>
                    <td>{listing.listingType}</td>
                    <td>{listing.gameName}</td>
                    <td>{listing.serverName || "-"}</td>
                    <td>{listing.viewCount ?? 0}</td>
                    <td>{formatCurrency(listing.price)}</td>
                    <td>{listing.status}</td>
                    <td className="admin-actions">
                      <Link href={`/admin/listings/${listing.id}/edit`}>
                        Sửa
                      </Link>

                      {listing.status !== "HIDDEN" && (
                        <button
                          type="button"
                          onClick={() => handleStatus(listing.id, "HIDDEN")}
                        >
                          Ẩn
                        </button>
                      )}

                      {listing.status === "HIDDEN" && (
                        <button
                          type="button"
                          onClick={() => handleStatus(listing.id, "PUBLISHED")}
                        >
                          Hiện
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(listing.id)}
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
