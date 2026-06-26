"use client";

import Link from "next/link";
import { AdminUserDetail as AdminUserDetailType } from "@/types/user";
import { formatCurrency, formatDateTime } from "@/lib/format";
import {
  orderStatusLabel,
  paymentStatusLabel,
  userRoleLabel,
  userStatusLabel,
} from "@/lib/admin-labels";

interface Props {
  user: AdminUserDetailType;
}

export default function AdminUserDetail({ user }: Props) {
  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Chi tiết người dùng</h1>
          <p>Thông tin tài khoản và lịch sử đơn hàng.</p>
        </div>

        <Link href="/admin/users" className="btn-secondary">
          Quay lại
        </Link>
      </div>

      <div className="admin-detail-grid">
        <div className="card admin-detail-card">
          <h2>Thông tin tài khoản</h2>

          <div className="admin-info-list">
            <p>
              <b>ID:</b> #{user.id}
            </p>
            <p>
              <b>Username:</b> {user.username}
            </p>
            <p>
              <b>Email:</b> {user.email}
            </p>
            <p>
              <b>Quyền:</b> {userRoleLabel(user.role)}
            </p>
            <p>
              <b>Trạng thái:</b> {userStatusLabel(user.status)}
            </p>
            <p>
              <b>Số dư:</b> {formatCurrency(user.balance)}
            </p>
            <p>
              <b>Ngày tạo:</b> {formatDateTime(user.createdAt)}
            </p>
            <p>
              <b>Cập nhật:</b>{" "}
              {user.updatedAt ? formatDateTime(user.updatedAt) : "-"}
            </p>
          </div>
        </div>

        <div className="card admin-detail-card">
          <h2>Thống kê nhanh</h2>

          <div className="admin-info-list">
            <p>
              <b>Tổng đơn:</b> {user.orders.length}
            </p>
            <p>
              <b>Đơn hoàn tất:</b>{" "}
              {
                user.orders.filter((order) => order.status === "COMPLETED")
                  .length
              }
            </p>
            <p>
              <b>Tổng đã mua:</b>{" "}
              {formatCurrency(
                user.orders
                  .filter((order) => order.status === "COMPLETED")
                  .reduce((sum, order) => sum + order.totalPrice, 0),
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="card table-card admin-section-gap">
        <div className="table-heading">
          <div>
            <h2>Lịch sử đơn hàng</h2>
            <p>Các hóa đơn đã tạo bởi người dùng này.</p>
          </div>
        </div>

        <div className="responsive-table">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Thanh toán</th>
                <th>Ngày tạo</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {user.orders.map((order) => {
                const firstItem = order.items?.[0];

                return (
                  <tr key={order.id}>
                    <td>{order.orderCode}</td>
                    <td>{firstItem?.listingTitle || "-"}</td>
                    <td>{formatCurrency(order.totalPrice)}</td>
                    <td>{orderStatusLabel(order.status)}</td>
                    <td>{paymentStatusLabel(order.paymentStatus)}</td>
                    <td>{formatDateTime(order.createdAt)}</td>
                    <td>
                      <Link
                        className="table-link"
                        href={`/admin/orders/${order.id}`}
                      >
                        Xem hóa đơn
                      </Link>
                    </td>
                  </tr>
                );
              })}

              {user.orders.length === 0 && (
                <tr>
                  <td colSpan={7}>
                    <p className="empty-text">User chưa có đơn hàng.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
