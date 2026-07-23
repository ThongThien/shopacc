"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { getAdminWebhookLogs } from "@/services/admin.service";
import { PaymentWebhookLog } from "@/types/webhook-log";
import { formatCurrency, formatDateTime } from "@/lib/format";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

const PAGE_SIZE = 20;

function statusBadge(status?: string) {
  const map: Record<string, { bg: string; color: string }> = {
    RECEIVED: { bg: "#dbeafe", color: "#1e40af" },
    PROCESSED: { bg: "#dcfce7", color: "#166534" },
    FAILED: { bg: "#fee2e2", color: "#991b1b" },
    IGNORED: { bg: "#f3f4f6", color: "#6b7280" },
    NEED_REVIEW: { bg: "#ffedd5", color: "#9a3412" },
  };

  const style = map[status || ""] || { bg: "#f3f4f6", color: "#374151" };

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
      {status || "-"}
    </span>
  );
}

function transferTypeLabel(type?: string) {
  if (type === "in") return "Tiền vào";
  if (type === "out") return "Tiền ra";
  return type || "-";
}

export default function AdminWebhookLogs() {
  const [logs, setLogs] = useState<PaymentWebhookLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getAdminWebhookLogs();
        setLogs(data);
      } finally {
        setLoading(false);
      }
    }

    void load().catch(console.error);
  }, []);

  const filteredLogs = useMemo(() => {
    const kw = keyword.toLowerCase().trim();

    return logs
      .filter((item) => {
        if (!kw) return true;
        return `${item.referenceCode || ""} ${item.content || ""} ${item.errorMessage || ""}`
          .toLowerCase()
          .includes(kw);
      })
      .filter((item) => {
        if (!status) return true;
        return item.status === status;
      });
  }, [logs, keyword, status]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE));
  const pagedLogs = filteredLogs.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Webhook Logs</h1>
          <p>Theo dõi callback từ cổng thanh toán SePay và các webhook khác.</p>
        </div>
      </div>

      <div className="card admin-toolbar">
        <input
          className="input"
          placeholder="Tìm mã tham chiếu, nội dung, lỗi..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
        />

        <select
          className="input"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="RECEIVED">Đã nhận</option>
          <option value="PROCESSED">Đã xử lý</option>
          <option value="FAILED">Thất bại</option>
          <option value="IGNORED">Bỏ qua</option>
          <option value="NEED_REVIEW">Cần kiểm tra</option>
        </select>
      </div>

      <div className="card table-card">
        {loading ? (
          <LoadingSpinner text="Đang tải webhook logs..." />
        ) : (
          <>
            <div className="responsive-table">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cổng</th>
                    <th>Mã tham chiếu</th>
                    <th>Loại</th>
                    <th>Số tiền</th>
                    <th>Trạng thái</th>
                    <th>Lỗi</th>
                    <th>Thời gian</th>
                    <th>Chi tiết</th>
                  </tr>
                </thead>

                <tbody>
                  {pagedLogs.map((log) => (
                    <Fragment key={log.id}>
                      <tr key={log.id}>
                        <td>{log.id}</td>
                        <td>{log.provider || "-"}</td>
                        <td
                          style={{ fontFamily: "monospace", fontSize: "13px" }}
                        >
                          {log.referenceCode || "-"}
                        </td>
                        <td>{transferTypeLabel(log.transferType)}</td>
                        <td>
                          {log.transferAmount != null
                            ? formatCurrency(log.transferAmount)
                            : "-"}
                        </td>
                        <td>{statusBadge(log.status)}</td>
                        <td
                          style={{
                            maxWidth: 180,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            color: "var(--color-danger)",
                            fontSize: "13px",
                          }}
                        >
                          {log.errorMessage || "-"}
                        </td>
                        <td>
                          {log.createdAt ? formatDateTime(log.createdAt) : "-"}
                        </td>
                        <td>
                          <button
                            className="btn-secondary"
                            style={{ padding: "4px 10px", fontSize: "12px" }}
                            type="button"
                            onClick={() =>
                              setExpandedId(
                                expandedId === log.id ? null : log.id,
                              )
                            }
                          >
                            {expandedId === log.id ? "Thu gọn" : "Xem"}
                          </button>
                        </td>
                      </tr>
                      {expandedId === log.id && (
                        <tr key={`${log.id}-detail`}>
                          <td colSpan={9}>
                            <div
                              style={{
                                padding: 14,
                                display: "grid",
                                gap: 12,
                              }}
                            >
                              <div>
                                <b
                                  style={{
                                    color: "var(--color-text-muted)",
                                    fontSize: "13px",
                                  }}
                                >
                                  Số tài khoản nhận:
                                </b>
                                <p style={{ margin: "4px 0 0" }}>
                                  {log.accountNumber || "-"}
                                </p>
                              </div>
                              <div>
                                <b
                                  style={{
                                    color: "var(--color-text-muted)",
                                    fontSize: "13px",
                                  }}
                                >
                                  Raw Body (JSON từ SePay):
                                </b>
                                <pre
                                  style={{
                                    whiteSpace: "pre-wrap",
                                    background: "#111827",
                                    color: "#e5e7eb",
                                    padding: 12,
                                    borderRadius: 8,
                                    margin: "4px 0 0",
                                    fontSize: "12px",
                                    maxHeight: 300,
                                    overflow: "auto",
                                  }}
                                >
                                  {log.rawBody
                                    ? (() => {
                                        try {
                                          return JSON.stringify(
                                            JSON.parse(log.rawBody),
                                            null,
                                            2,
                                          );
                                        } catch {
                                          return log.rawBody;
                                        }
                                      })()
                                    : "-"}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredLogs.length === 0 && (
              <p className="empty-text">Chưa có webhook log nào.</p>
            )}

            {filteredLogs.length > PAGE_SIZE && (
              <div className="admin-pagination">
                <p>
                  Hiển thị {(page - 1) * PAGE_SIZE + 1}–
                  {Math.min(page * PAGE_SIZE, filteredLogs.length)} /{" "}
                  {filteredLogs.length} log
                </p>
                <div>
                  <button
                    className="btn-secondary"
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Trước
                  </button>
                  <span style={{ fontWeight: 700 }}>
                    {page} / {totalPages}
                  </span>
                  <button
                    className="btn-secondary"
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
