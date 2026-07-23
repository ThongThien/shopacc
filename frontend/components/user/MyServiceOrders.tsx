"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { apiFetch } from "@/lib/api";

interface ServiceOrderItem {
  id: number;
  serviceId: number;
  serviceTitle: string;
  price: number;
  server?: string;
  note?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

function statusBadge(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    PENDING: { bg: "#fef3c7", color: "#92400e" },
    PROCESSING: { bg: "#dbeafe", color: "#1e40af" },
    COMPLETED: { bg: "#dcfce7", color: "#166534" },
    CANCELLED: { bg: "#fee2e2", color: "#991b1b" },
  };
  const s = map[status] || { bg: "#f3f4f6", color: "#374151" };
  return (
    <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 999, background: s.bg, color: s.color, fontWeight: 800, fontSize: 13 }}>
      {status === "PENDING" ? "Chờ xử lý" : status === "PROCESSING" ? "Đang xử lý" : status === "COMPLETED" ? "Hoàn thành" : "Đã hủy"}
    </span>
  );
}

export default function MyServiceOrders() {
  const [orders, setOrders] = useState<ServiceOrderItem[]>([]);

  useEffect(() => {
    apiFetch<ServiceOrderItem[]>("/api/services/my-orders")
      .then(setOrders)
      .catch(() => {});
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "28px 16px" }}>
      <h1>Đơn dịch vụ của tôi</h1>
      <p style={{ color: "var(--color-text-muted)" }}>Theo dõi trạng thái các đơn dịch vụ đã đặt.</p>

      {orders.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)", textAlign: "center", padding: 40 }}>Chưa có đơn dịch vụ nào.</p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {orders.map((o) => (
            <div key={o.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                <div>
                  <b>{o.serviceTitle}</b>
                  <p style={{ margin: "4px 0", color: "var(--color-text-muted)", fontSize: 13 }}>
                    #{o.id} · {formatDateTime(o.createdAt)}
                  </p>
                </div>
                <div style={{ textAlign: "right" }}>
                  {statusBadge(o.status)}
                  <p style={{ margin: "4px 0 0", fontWeight: 900, color: "var(--color-primary)", fontSize: 17 }}>
                    {formatCurrency(o.price)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
