"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getAdminDashboard } from "@/services/admin.service";
import { AdminDashboard as AdminDashboardType } from "@/types/admin-dashboard";
import { formatCurrency, formatDateTime } from "@/lib/format";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState<AdminDashboardType | null>(null);

  useEffect(() => {
    void getAdminDashboard().then(setDashboard).catch(console.error);
  }, []);

  if (!dashboard) {
    return <p>Đang tải bảng điều khiển...</p>;
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Bảng điều khiển quản trị</h1>
          <p>Tổng quan shop, doanh thu, đơn hàng và tài khoản.</p>
        </div>
      </div>

      <div className="admin-stat-grid">
        <Link href="/me" className="card admin-stat-card">
          <span>Số dư admin</span>
          <b>{formatCurrency(dashboard.adminBalance)}</b>
        </Link>

        <Link href="/admin/orders" className="card admin-stat-card">
          <span>Thu nhập tháng này</span>
          <b>{formatCurrency(dashboard.revenueThisMonth)}</b>
        </Link>

        <Link href="/admin/orders" className="card admin-stat-card">
          <span>Tổng thu nhập</span>
          <b>{formatCurrency(dashboard.revenueAllTime)}</b>
        </Link>

        <Link href="/admin/users" className="card admin-stat-card">
          <span>Tổng người dùng</span>
          <b>{dashboard.totalUsers}</b>
        </Link>

        <Link href="/admin/listings" className="card admin-stat-card">
          <span>Sản phẩm đang bán</span>
          <b>{dashboard.publishedListings}</b>
        </Link>

        <Link href="/admin/listings" className="card admin-stat-card">
          <span>Sản phẩm đã bán</span>
          <b>{dashboard.soldListings}</b>
        </Link>

        <Link href="/admin/orders" className="card admin-stat-card">
          <span>Hóa đơn tháng này</span>
          <b>{dashboard.ordersThisMonth}</b>
        </Link>

        <Link href="/admin/orders" className="card admin-stat-card">
          <span>Tổng đơn hàng</span>
          <b>{dashboard.totalOrders}</b>
        </Link>
      </div>

      <div className="card table-card admin-dashboard-table">
        <div className="table-heading">
          <div>
            <h2>Đơn hàng giá trị cao</h2>
            <p>Các đơn hàng có tổng giá trị cao nhất.</p>
          </div>

          <Link href="/admin/orders" className="table-link">
            Xem tất cả
          </Link>
        </div>

        <div className="responsive-table">
          <table className="data-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Người mua</th>
                <th>Tổng tiền</th>
                <th>Thời gian</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {dashboard.topOrders.map((order) => (
                <tr key={order.orderId}>
                  <td>{order.orderCode}</td>
                  <td>{order.username}</td>
                  <td>{formatCurrency(order.totalPrice)}</td>
                  <td>{formatDateTime(order.createdAt)}</td>
                  <td>
                    <Link
                      className="table-link"
                      href={`/admin/orders/${order.orderId}`}
                    >
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
