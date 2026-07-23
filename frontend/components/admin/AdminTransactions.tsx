"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getAdminTransactions,
  approveAdminTransaction,
  rejectAdminTransaction,
} from "@/services/admin.service";
import { Transaction } from "@/types/transaction";
import { formatCurrency, formatDateTime } from "@/lib/format";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { useNotify } from "@/components/shared/NotificationProvider";

function statusBadge(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    PENDING: { bg: "#fef3c7", color: "#92400e" },
    SUCCESS: { bg: "#dcfce7", color: "#166534" },
    FAILED: { bg: "#fee2e2", color: "#991b1b" },
    NEED_REVIEW: { bg: "#ffedd5", color: "#9a3412" },
    EXPIRED: { bg: "#f3f4f6", color: "#6b7280" },
    CANCELLED: { bg: "#f3f4f6", color: "#6b7280" },
  };

  const style = map[status] || { bg: "#f3f4f6", color: "#374151" };

  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: "999px",
        background: style.bg,
        color: style.color,
        fontWeight: 800,
        fontSize: "13px",
      }}
    >
      {status}
    </span>
  );
}

function typeLabel(type?: string) {
  if (type === "DEPOSIT") return "Nạp tiền";
  if (type === "PURCHASE") return "Mua hàng";
  if (type === "REFUND") return "Hoàn tiền";
  return type || "-";
}

export default function AdminTransactions() {
  const { notify, confirmAction } = useNotify();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await getAdminTransactions();
      setTransactions(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load().catch(console.error);
  }, []);

  const filteredTransactions = useMemo(() => {
    const kw = keyword.toLowerCase().trim();

    return transactions
      .filter((item) => {
        if (!kw) return true;
        return `${item.transactionCode} ${item.description || ""} ${item.provider || ""} ${item.username || ""} ${item.email || ""}`
          .toLowerCase()
          .includes(kw);
      })
      .filter((item) => {
        if (!type) return true;
        return item.type === type;
      })
      .filter((item) => {
        if (!status) return true;
        return item.status === status;
      });
  }, [transactions, keyword, type, status]);

  async function handleApprove(id: number) {
    const ok = await confirmAction(
      "Xác nhận duyệt giao dịch này? Tiền sẽ được cộng vào tài khoản người dùng.",
    );
    if (!ok) return;

    setActionLoading(id);
    try {
      await approveAdminTransaction(id);
      notify("success", "Đã duyệt giao dịch thành công");
      await load();
    } catch (error) {
      notify(
        "error",
        error instanceof Error ? error.message : "Duyệt thất bại",
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id: number) {
    const ok = await confirmAction(
      "Xác nhận từ chối giao dịch này? Hành động này không thể hoàn tác.",
    );
    if (!ok) return;

    setActionLoading(id);
    try {
      await rejectAdminTransaction(id);
      notify("success", "Đã từ chối giao dịch");
      await load();
    } catch (error) {
      notify(
        "error",
        error instanceof Error ? error.message : "Từ chối thất bại",
      );
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Quản lý giao dịch</h1>
          <p>Theo dõi nạp tiền, mua hàng và các biến động giao dịch.</p>
        </div>
      </div>

      <div className="admin-summary-row">
        <span>Tổng: {transactions.length}</span>
        <span>
          Thành công:{" "}
          {transactions.filter((t) => t.status === "SUCCESS").length}
        </span>
        <span>
          Đang chờ: {transactions.filter((t) => t.status === "PENDING").length}
        </span>
        <span>
          Hết hạn: {transactions.filter((t) => t.status === "EXPIRED").length}
        </span>
      </div>

      <div className="card admin-toolbar">
        <input
          className="input"
          placeholder="Tìm mã giao dịch, người dùng, mô tả..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <select
          className="input"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="">Tất cả loại</option>
          <option value="DEPOSIT">Nạp tiền</option>
          <option value="PURCHASE">Mua hàng</option>
          <option value="REFUND">Hoàn tiền</option>
        </select>

        <select
          className="input"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Đang chờ</option>
          <option value="SUCCESS">Thành công</option>
          <option value="FAILED">Thất bại</option>
          <option value="NEED_REVIEW">Cần kiểm tra</option>
          <option value="EXPIRED">Hết hạn</option>
        </select>
      </div>

      <div className="card table-card">
        {loading ? (
          <LoadingSpinner text="Đang tải giao dịch..." />
        ) : (
          <div className="responsive-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Loại</th>
                  <th>Người dùng</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Cổng</th>
                  <th>Mô tả</th>
                  <th>Thời gian</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td style={{ fontFamily: "monospace", fontSize: "13px" }}>
                      {tx.transactionCode.length > 30
                        ? tx.transactionCode.slice(0, 30) + "..."
                        : tx.transactionCode}
                    </td>
                    <td>{typeLabel(tx.type)}</td>
                    <td>
                      {tx.username ? (
                        <>
                          <div style={{ fontWeight: 700 }}>{tx.username}</div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--color-text-muted)",
                            }}
                          >
                            {tx.email}
                          </div>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{formatCurrency(tx.amount)}</td>
                    <td>{statusBadge(tx.status)}</td>
                    <td>{tx.provider || "-"}</td>
                    <td
                      style={{
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {tx.description || "-"}
                    </td>
                    <td>{formatDateTime(tx.createdAt)}</td>
                    <td>
                      {tx.status === "NEED_REVIEW" && tx.type === "DEPOSIT" && (
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            className="btn-primary"
                            style={{ padding: "6px 12px", fontSize: "13px" }}
                            type="button"
                            disabled={actionLoading === tx.id}
                            onClick={() => handleApprove(tx.id)}
                          >
                            {actionLoading === tx.id ? "..." : "Duyệt"}
                          </button>
                          <button
                            className="btn-secondary"
                            style={{ padding: "6px 12px", fontSize: "13px" }}
                            type="button"
                            disabled={actionLoading === tx.id}
                            onClick={() => handleReject(tx.id)}
                          >
                            {actionLoading === tx.id ? "..." : "Từ chối"}
                          </button>
                        </div>
                      )}
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
