"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getAdminOrders } from "@/services/admin.service";
import { Order } from "@/types/order";
import { formatCurrency, formatDateTime } from "@/lib/format";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

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

    void load().catch(console.error);
  }, []);

  const filteredOrders = useMemo(() => {
    const kw = keyword.toLowerCase().trim();

    return orders
      .filter((order) => {
        if (!kw) return true;

        const firstItem = order.items?.[0];

        return `${order.orderCode} ${order.username} ${firstItem?.listingTitle || ""}`
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
      });
  }, [orders, keyword, status, paymentStatus]);

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Quản lý Orders</h1>
          <p>
            Theo dõi đơn hàng, trạng thái thanh toán và chi tiết acc đã bán.
          </p>
        </div>
      </div>

      <div className="card admin-toolbar">
        <input
          className="input"
          placeholder="Tìm mã đơn, user, tên acc..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <select
          className="input"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">PENDING</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>

        <select
          className="input"
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
        >
          <option value="">Tất cả thanh toán</option>
          <option value="UNPAID">UNPAID</option>
          <option value="PAID">PAID</option>
          <option value="FAILED">FAILED</option>
        </select>
      </div>

      <div className="card table-card">
        {loading ? (
          <LoadingSpinner text="Đang tải orders..." />
        ) : (
          <div className="responsive-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>User</th>
                  <th>Sản phẩm</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th>Thanh toán</th>
                  <th>Ngày</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((order) => {
                  const firstItem = order.items?.[0];

                  return (
                    <tr key={order.id}>
                      <td>{order.orderCode}</td>
                      <td>{order.username}</td>
                      <td>{firstItem?.listingTitle || "-"}</td>
                      <td>{formatCurrency(order.totalPrice)}</td>
                      <td>{order.status}</td>
                      <td>{order.paymentStatus}</td>
                      <td>{formatDateTime(order.createdAt)}</td>
                      <td>
                        <Link
                          className="table-link"
                          href={`/admin/orders/${order.id}`}
                        >
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
