"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formatCurrency, formatDateTime } from "@/lib/format";

interface BalanceLog {
  id: number;
  amountBefore: number;
  amountChange: number;
  amountAfter: number;
  type: string;
  description: string;
  createdAt: string;
}

export default function BalanceHistory() {
  const [logs, setLogs] = useState<BalanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<BalanceLog[]>("/api/users/me/balance-logs")
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;

  if (logs.length === 0) {
    return (
      <div className="card" style={{ padding: 20, marginTop: 18 }}>
        <h2 style={{ marginTop: 0 }}>Lịch sử biến động số dư</h2>
        <p style={{ color: "var(--muted)" }}>Chưa có biến động số dư.</p>
      </div>
    );
  }

  return (
    <div className="card table-card" style={{ padding: 20, marginTop: 18 }}>
      <h2 style={{ marginTop: 0 }}>Lịch sử biến động số dư</h2>
      <div style={{ maxHeight: 360, overflowY: "auto" }}>
        <div className="responsive-table">
          <table className="data-table">
            <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
              <tr>
                <th>Trước</th>
                <th>Thay đổi</th>
                <th>Sau</th>
                <th>Loại</th>
                <th>Mô tả</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{formatCurrency(log.amountBefore)}</td>
                  <td>
                    <span
                      style={{
                        color: log.amountChange >= 0 ? "var(--success)" : "var(--danger)",
                        fontWeight: 700,
                      }}
                    >
                      {log.amountChange >= 0 ? "+" : ""}
                      {formatCurrency(log.amountChange)}
                    </span>
                  </td>
                  <td>{formatCurrency(log.amountAfter)}</td>
                  <td>{log.type}</td>
                  <td
                    style={{
                      maxWidth: 200,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: 13,
                    }}
                  >
                    {log.description || "-"}
                  </td>
                  <td style={{ fontSize: 13 }}>{formatDateTime(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
