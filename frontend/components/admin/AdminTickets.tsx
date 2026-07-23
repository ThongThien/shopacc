"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Ticket, TicketMessage } from "@/types/ticket";
import { formatDateTime } from "@/lib/format";
import { useNotify } from "@/components/shared/NotificationProvider";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function AdminTickets() {
  const { notify } = useNotify();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch<Ticket[]>("/api/tickets/admin");
      setTickets(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load().catch(console.error);
  }, []);

  async function handleReply(ticketId: number) {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await apiFetch(`/api/tickets/${ticketId}/reply`, {
        method: "POST",
        body: JSON.stringify({ text: replyText.trim() }),
      });
      setReplyText("");
      await load();
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Gửi thất bại");
    } finally {
      setSending(false);
    }
  }

  async function handleToggleStatus(ticket: Ticket) {
    const action = ticket.status === "OPEN" ? "close" : "open";
    try {
      await apiFetch(`/api/tickets/${ticket.id}/${action}`, { method: "PATCH" });
      notify("success", ticket.status === "OPEN" ? "Đã đóng ticket" : "Đã mở lại ticket");
      await load();
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Thất bại");
    }
  }

  function parseMessages(messagesJson: string): TicketMessage[] {
    try {
      const parsed = JSON.parse(messagesJson);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Quản lý Ticket</h1>
          <p>Phản hồi và xử lý ticket hỗ trợ từ người dùng.</p>
        </div>
      </div>

      <div className="card table-card">
        {loading ? (
          <LoadingSpinner text="Đang tải..." />
        ) : tickets.length === 0 ? (
          <p className="empty-text">Chưa có ticket nào.</p>
        ) : (
          <div className="responsive-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User ID</th>
                  <th>Danh mục</th>
                  <th>Tiêu đề</th>
                  <th>Trạng thái</th>
                  <th>Phản hồi cuối</th>
                  <th>Cập nhật</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td>#{ticket.id}</td>
                    <td>{ticket.userId}</td>
                    <td>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: 999,
                          background: ticket.category === "DEPOSIT" ? "#fef3c7" : "#dbeafe",
                          color: ticket.category === "DEPOSIT" ? "#92400e" : "#1e40af",
                          fontWeight: 700,
                          fontSize: 12,
                        }}
                      >
                        {ticket.category === "ACCOUNT" ? "Tài khoản" : "Nạp tiền"}
                      </span>
                    </td>
                    <td style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {ticket.subject}
                    </td>
                    <td>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: 999,
                          background: ticket.status === "OPEN" ? "#dcfce7" : "#f3f4f6",
                          color: ticket.status === "OPEN" ? "#166534" : "#6b7280",
                          fontWeight: 800,
                          fontSize: 12,
                        }}
                      >
                        {ticket.status === "OPEN" ? "Mở" : "Đóng"}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {ticket.lastReplyByAdmin ? "Admin" : "User"}
                    </td>
                    <td>{formatDateTime(ticket.updatedAt)}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: "4px 10px", fontSize: 12 }}
                          type="button"
                          onClick={() =>
                            setExpandedId(expandedId === ticket.id ? null : ticket.id)
                          }
                        >
                          {expandedId === ticket.id ? "Thu gọn" : "Xem"}
                        </button>
                        <button
                          className="btn-secondary"
                          style={{ padding: "4px 10px", fontSize: 12 }}
                          type="button"
                          onClick={() => handleToggleStatus(ticket)}
                        >
                          {ticket.status === "OPEN" ? "Đóng" : "Mở lại"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Expanded thread */}
            {expandedId && (
              <div style={{ padding: "16px 0", borderTop: "2px solid var(--color-primary)" }}>
                {tickets
                  .filter((t) => t.id === expandedId)
                  .map((ticket) => {
                    const msgs = parseMessages(ticket.messages);
                    return (
                      <div key={ticket.id} style={{ padding: "0 16px" }}>
                        {msgs.map((msg, i) => (
                          <div
                            key={i}
                            style={{
                              marginBottom: 10,
                              padding: "10px 14px",
                              borderRadius: 10,
                              background: msg.isAdmin ? "#eef2ff" : "var(--color-bg-secondary)",
                              border: msg.isAdmin ? "1px solid #c7d2fe" : "1px solid var(--color-border)",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                              <b style={{ fontSize: 13 }}>
                                {msg.isAdmin ? "Admin" : msg.username}
                              </b>
                              <small style={{ color: "var(--color-text-muted)" }}>
                                {formatDateTime(msg.createdAt)}
                              </small>
                            </div>
                            <p style={{ margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                              {msg.text}
                            </p>
                          </div>
                        ))}

                        {ticket.status === "OPEN" && (
                          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                            <input
                              className="input"
                              placeholder="Nhập phản hồi..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                            />
                            <button
                              className="btn-primary"
                              type="button"
                              disabled={!replyText.trim() || sending}
                              onClick={() => void handleReply(ticket.id)}
                              style={{ whiteSpace: "nowrap" }}
                            >
                              {sending ? "..." : "Gửi"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
