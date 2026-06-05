"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getMyOrders } from "@/services/order.service";
import { Order } from "@/types/order";
import { formatCurrency, formatDateTime } from "@/lib/format";
import NoticeBox from "@/components/layout/NoticeBox";

export default function UserOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (error) {
        console.error(error);
      }
    }

    void fetchOrders();
  }, []);

  return (
    <section>
      <NoticeBox type="orders" />

      <div className="card table-card">
        <div className="table-heading">
          <div>
            <h1>Lịch sử mua acc</h1>
            <p>Danh sách tài khoản bạn đã mua trên shop.</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <p className="empty-text">Bạn chưa mua acc nào.</p>
        ) : (
          <div className="responsive-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Acc</th>
                  <th>Giá</th>
                  <th>Trạng thái</th>
                  <th>Ngày mua</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => {
                  const firstItem = order.items?.[0];

                  return (
                    <tr key={order.id}>
                      <td>{order.orderCode}</td>
                      <td>{firstItem?.listingTitle || "Không rõ"}</td>
                      <td>{formatCurrency(order.totalPrice)}</td>
                      <td>{order.status}</td>
                      <td>{formatDateTime(order.createdAt)}</td>
                      <td>
                        <Link
                          className="table-link"
                          href={`/me/orders/${order.id}`}
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
