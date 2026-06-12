"use client";

import Link from "next/link";
import { useState } from "react";
import { Order } from "@/types/order";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/admin-labels";
import { refundAdminOrder } from "@/services/admin.service";
import { useNotify } from "@/components/shared/NotificationProvider";

interface Props {
  order: Order;
}

export default function AdminOrderDetail({ order: initialOrder }: Props) {
  const { notify, confirmAction } = useNotify();

  const [order, setOrder] = useState(initialOrder);
  const [loading, setLoading] = useState(false);

  async function handleRefund() {
    const ok = await confirmAction(
      "Bạn chắc chắn muốn hoàn tiền hóa đơn này? Tiền sẽ được cộng lại vào ví người dùng.",
      "Hoàn tiền hóa đơn",
    );

    if (!ok) return;

    try {
      setLoading(true);

      const refunded = await refundAdminOrder(order.id);
      setOrder(refunded);

      notify("success", "Hoàn tiền thành công");
    } catch (error) {
      notify(
        "error",
        error instanceof Error ? error.message : "Hoàn tiền thất bại",
      );
    } finally {
      setLoading(false);
    }
  }

  const canRefund =
    order.status === "COMPLETED" && order.paymentStatus === "PAID";

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Chi tiết hóa đơn</h1>
          <p>Hóa đơn #{order.orderCode}</p>
        </div>

        <div className="admin-actions">
          <Link href="/admin/orders" className="btn-secondary">
            Quay lại
          </Link>

          {canRefund && (
            <button
              className="btn-primary"
              type="button"
              disabled={loading}
              onClick={handleRefund}
            >
              {loading ? "Đang hoàn..." : "Hoàn tiền"}
            </button>
          )}
        </div>
      </div>

      <div className="bill-card card">
        <div className="bill-header">
          <div>
            <h2>Hóa đơn bán hàng</h2>
            <p>{order.orderCode}</p>
          </div>

          <div className="bill-status">
            <span>{orderStatusLabel(order.status)}</span>
            <b>{paymentStatusLabel(order.paymentStatus)}</b>
          </div>
        </div>

        <div className="bill-grid">
          <div>
            <h3>Thông tin hóa đơn</h3>
            <p>
              <b>Mã đơn:</b> {order.orderCode}
            </p>
            <p>
              <b>Ngày tạo:</b> {formatDateTime(order.createdAt)}
            </p>
            <p>
              <b>Cập nhật:</b>{" "}
              {order.updatedAt ? formatDateTime(order.updatedAt) : "-"}
            </p>
            <p>
              <b>Trạng thái:</b> {orderStatusLabel(order.status)}
            </p>
            <p>
              <b>Thanh toán:</b> {paymentStatusLabel(order.paymentStatus)}
            </p>
            <p>
              <b>Phương thức:</b> {order.paymentMethod || "Ví tài khoản"}
            </p>
          </div>

          <div>
            <h3>Người mua</h3>
            <p>
              <b>ID người mua:</b> #{order.userId}
            </p>
            <p>
              <b>Username:</b> {order.username}
            </p>
            <p>
              <b>Email:</b> {order.userEmail || "-"}
            </p>

            <Link className="table-link" href={`/admin/users/${order.userId}`}>
              Xem user
            </Link>
          </div>
        </div>

        <div className="bill-items">
          <h3>Sản phẩm</h3>

          <div className="responsive-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Giá</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <img
                        className="bill-item-image"
                        src={item.listingThumbnail || "/placeholder.png"}
                        alt={item.listingTitle}
                      />
                    </td>
                    <td>{item.listingTitle}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.price)}</td>
                    <td>
                      {item.listingId && (
                        <Link
                          className="table-link"
                          href={`/admin/listings/${item.listingId}`}
                        >
                          Xem sản phẩm
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bill-total">
          <span>Tổng thanh toán</span>
          <strong>{formatCurrency(order.totalPrice)}</strong>
        </div>
      </div>
    </section>
  );
}
