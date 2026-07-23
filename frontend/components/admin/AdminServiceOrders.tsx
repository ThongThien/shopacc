"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useNotify } from "@/components/shared/NotificationProvider";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

interface SOrder {
  id: number; userId: number; serviceId: number; serviceTitle: string; price: number;
  accountName?: string; password?: string; server?: string; note?: string;
  status: string; createdAt: string; updatedAt: string;
}

function statusBadge(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    PENDING: { bg: "#fef3c7", color: "#92400e" },
    PROCESSING: { bg: "#dbeafe", color: "#1e40af" },
    COMPLETED: { bg: "#dcfce7", color: "#166534" },
    CANCELLED: { bg: "#fee2e2", color: "#991b1b" },
  };
  const s = map[status] || { bg: "#f3f4f6", color: "#374151" };
  return <span style={{ display: "inline-block", padding: "4px 10px", borderRadius: 999, background: s.bg, color: s.color, fontWeight: 800, fontSize: 13 }}>{status}</span>;
}

export default function AdminServiceOrders() {
  const { notify, confirmAction } = useNotify();
  const [orders, setOrders] = useState<SOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try { setOrders(await apiFetch<SOrder[]>("/api/services/admin/orders")); } finally { setLoading(false); }
  }

  useEffect(() => { void load().catch(console.error); }, []);

  async function handleAction(id: number, action: string) {
    try {
      await apiFetch(`/api/services/admin/orders/${id}/${action}`, { method: "PATCH" });
      notify("success", action === "process" ? "Đang xử lý" : action === "complete" ? "Hoàn thành" : "Đã hủy + hoàn tiền");
      await load();
    } catch (err) { notify("error", err instanceof Error ? err.message : "Thất bại"); }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header"><div><h1>Đơn Dịch vụ</h1><p>Xử lý đơn dịch vụ từ người dùng.</p></div></div>
      <div className="card table-card">
        {loading ? <LoadingSpinner /> : (
          <div className="responsive-table">
            <table className="data-table">
              <thead><tr><th>ID</th><th>User</th><th>Dịch vụ</th><th>Giá</th><th>Trạng thái</th><th>Thời gian</th><th>Hành động</th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>#{o.id}</td><td>#{o.userId}</td><td>{o.serviceTitle}</td><td>{formatCurrency(o.price)}</td>
                    <td>{statusBadge(o.status)}</td><td>{formatDateTime(o.createdAt)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button className="btn-secondary" style={{ padding: "4px 8px", fontSize: 11 }} type="button" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                          {expanded === o.id ? "Ẩn" : "Xem"}
                        </button>
                        {o.status === "PENDING" && (
                          <button className="btn-primary" style={{ padding: "4px 8px", fontSize: 11 }} type="button" onClick={() => handleAction(o.id, "process")}>Xử lý</button>
                        )}
                        {o.status === "PROCESSING" && (
                          <button className="btn-primary" style={{ padding: "4px 8px", fontSize: 11 }} type="button" onClick={() => handleAction(o.id, "complete")}>Done</button>
                        )}
                        {o.status !== "COMPLETED" && o.status !== "CANCELLED" && (
                          <button className="btn-secondary" style={{ padding: "4px 8px", fontSize: 11, color: "var(--color-danger)" }} type="button" onClick={() => handleAction(o.id, "cancel")}>Hủy</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {expanded && (
              <div style={{ padding: 14, borderTop: "2px solid var(--color-primary)" }}>
                {orders.filter((o) => o.id === expanded).map((o) => (
                  <div key={o.id} style={{ display: "grid", gap: 8 }}>
                    <p><b>TK game:</b> {o.accountName || "-"}</p>
                    <p><b>MK:</b> {o.password || "-"}</p>
                    <p><b>Server:</b> {o.server || "-"}</p>
                    <p><b>Ghi chú:</b> {o.note || "-"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
