"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getAdminOrders } from "@/services/admin.service";
import { Order } from "@/types/order";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/admin-labels";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import AdminPagination from "@/components/admin/AdminPagination";

const PAGE_SIZE = 10;

type SortKey = "createdAt" | "totalPrice" | "updatedAt";
type SortDirection = "asc" | "desc";

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [month, setMonth] = useState("");
  const [page, setPage] = useState(1);

  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const data = await getAdminOrders();
        setOrders(data);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const monthOptions = useMemo(() => {
    const set = new Set<string>();

    orders.forEach((order) => {
      if (!order.createdAt) return;

      const date = new Date(order.createdAt);
      const value = `${date.getMonth() + 1}/${date.getFullYear()}`;

      set.add(value);
    });

    return Array.from(set).sort((a, b) => {
      const [am, ay] = a.split("/").map(Number);
      const [bm, by] = b.split("/").map(Number);

      return by !== ay ? by - ay : bm - am;
    });
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const kw = keyword.toLowerCase().trim();

    return orders
      .filter((order) => {
        if (!kw) return true;

        const firstItem = order.items?.[0];

        return `${order.orderCode} ${order.username} ${order.userEmail || ""} ${firstItem?.listingTitle || ""}`
          .toLowerCase()
          .includes(kw);
      })
      .filter((order) => {
        if (!status) return true;
        return order.status === status;
      })
      .filter((order) => {
        if (!paymentStatus) return true;
        return order.paymentStatus === paymentStatus;
      })
      .filter((order) => {
        if (!month) return true;

        const date = new Date(order.createdAt);
        const value = `${date.getMonth() + 1}/${date.getFullYear()}`;

        return value === month;
      })
      .sort((a, b) => {
        let aValue = 0;
        let bValue = 0;

        if (sortKey === "totalPrice") {
          aValue = a.totalPrice;
          bValue = b.totalPrice;
        }

        if (sortKey === "createdAt") {
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
        }

        if (sortKey === "updatedAt") {
          aValue = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
          bValue = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
        }

        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      });
  }, [orders, keyword, status, paymentStatus, month, sortKey, sortDirection]);

  const visibleOrders = filteredOrders.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

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

  function resetPage() {
    setPage(1);
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Quản lý hóa đơn</h1>
          <p>Theo dõi hóa đơn mua acc, trạng thái đơn và thanh toán.</p>
        </div>
      </div>

      <div className="admin-summary-row">
        <span>Tổng đơn: {orders.length}</span>
        <span>Đã thanh toán: {orders.filter((o) => o.paymentStatus === "PAID").length}</span>
        <span>Chưa thanh toán: {orders.filter((o) => o.paymentStatus === "UNPAID").length}</span>
        <span>Hoàn tiền: {orders.filter((o) => o.paymentStatus === "REFUNDED").length}</span>
      </div>

      <div className="card admin-toolbar">
        <input
          className="input"
          placeholder="Tìm mã đơn, user, email, sản phẩm..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            resetPage();
          }}
        />

        <select
          className="input"
          value={month}
          onChange={(e) => {
            setMonth(e.target.value);
            resetPage();
          }}
        >
          <option value="">Tất cả tháng</option>
          {monthOptions.map((item) => (
            <option key={item} value={item}>
              Tháng {item}
            </option>
          ))}
        </select>

        <select
          className="input"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            resetPage();
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ xác nhận</option>
          <option value="COMPLETED">Hoàn tất</option>
          <option value="CANCELLED">Đã hủy</option>
        </select>

        <select
          className="input"
          value={paymentStatus}
          onChange={(e) => {
            setPaymentStatus(e.target.value);
            resetPage();
          }}
        >
          <option value="">Tất cả thanh toán</option>
          <option value="UNPAID">Chưa thanh toán</option>
          <option value="PAID">Đã thanh toán</option>
          <option value="REFUNDED">Đã hoàn tiền</option>
        </select>
      </div>

      <div className="card table-card">
        {loading ? (
          <LoadingSpinner text="Đang tải hóa đơn..." />
        ) : (
          <>
            <div className="responsive-table">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Người mua</th>
                    <th>Sản phẩm</th>
                    <th onClick={() => toggleSort("totalPrice")}>
                      Tổng tiền{sortLabel("totalPrice")}
                    </th>
                    <th>Trạng thái</th>
                    <th>Thanh toán</th>
                    <th>Phương thức</th>
                    <th onClick={() => toggleSort("createdAt")}>
                      Ngày tạo{sortLabel("createdAt")}
                    </th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {visibleOrders.map((order) => {
                    const firstItem = order.items?.[0];

                    return (
                      <tr key={order.id}>
                        <td>{order.orderCode}</td>
                        <td>
                          <b>{order.username}</b>
                          <br />
                          <span className="muted-text">
                            {order.userEmail || "-"}
                          </span>
                        </td>
                        <td>{firstItem?.listingTitle || "-"}</td>
                        <td>{formatCurrency(order.totalPrice)}</td>
                        <td>{orderStatusLabel(order.status)}</td>
                        <td>{paymentStatusLabel(order.paymentStatus)}</td>
                        <td>{order.paymentMethod || "-"}</td>
                        <td>{formatDateTime(order.createdAt)}</td>
                        <td>
                          <Link href={`/admin/orders/${order.id}`}
                            className="btn-secondary" style={{ padding: "4px 10px", fontSize: 12, height: 30, color: "var(--color-cyan)", borderColor: "var(--color-cyan)" }}>Xem chi tiết</Link>
                        </td>
                      </tr>
                    );
                  })}

                  {visibleOrders.length === 0 && (
                    <tr>
                      <td colSpan={10}>
                        <p className="empty-text">Không có hóa đơn phù hợp.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <AdminPagination
              page={page}
              totalItems={filteredOrders.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </section>
  );
}
