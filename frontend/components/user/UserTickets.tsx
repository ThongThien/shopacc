"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Ticket, TicketMessage } from "@/types/ticket";
import { formatDateTime } from "@/lib/format";
import { useNotify } from "@/components/shared/NotificationProvider";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function UserTickets() {
  const { notify, confirmAction } = useNotify();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);
  const [category, setCategory] = useState<"ACCOUNT" | "DEPOSIT">("ACCOUNT");
  const [subject, setSubject] = useState("");

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch<Ticket[]>("/api/tickets");
      setTickets(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load().catch(console.error);
  }, []);

  async function handleCreate() {
    if (!subject.trim()) return;
    try {
      await apiFetch("/api/tickets", {
        method: "POST",
        body: JSON.stringify({ subject: subject.trim(), category }),
      });
      notify("success", "Đã tạo ticket hỗ trợ");
      setShowCreate(false);
      setSubject("");
      await load();
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Tạo thất bại");
    }
  }

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

  function parseMessages(messagesJson: string): TicketMessage[] {
    try {
      const parsed = JSON.parse(messagesJson);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [];
    }
  }

  return (
    <section style={{ maxWidth: 800, margin: "0 auto", padding: "28px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
        <div>
          <h1 style={{ margin: 0 }}>Hỗ trợ</h1>
          <p style={{ margin: "4px 0 0", color: "var(--color-text-muted)" }}>
            Tạo ticket khi cần hỗ trợ về tài khoản hoặc nạp tiền.
          </p>
        </div>
        <button className="btn-primary" type="button" onClick={() => setShowCreate(true)}>
          Tạo ticket
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="card" style={{ padding: 20, marginBottom: 22 }}>
          <h2 style={{ marginTop: 0 }}>Tạo ticket mới</h2>
          <div style={{ display: "grid", gap: 12 }}>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 700, fontSize: 13, color: "var(--color-text-muted)" }}>
                Danh mục
              </label>
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value as "ACCOUNT" | "DEPOSIT")}>
                <option value="ACCOUNT">Tài khoản / Acc game</option>
                <option value="DEPOSIT">Nạp tiền</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 700, fontSize: 13, color: "var(--color-text-muted)" }}>
                Tiêu đề / Mô tả vấn đề
              </label>
              <textarea
                className="input"
                style={{ minHeight: 100 }}
                placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn-secondary" type="button" onClick={() => setShowCreate(false)}>
                Hủy
              </button>
              <button className="btn-primary" type="button" disabled={!subject.trim()} onClick={handleCreate}>
                Gửi ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket list */}
      {loading ? (
        <LoadingSpinner text="Đang tải..." />
      ) : tickets.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)", textAlign: "center", padding: 40 }}>
          Chưa có ticket hỗ trợ nào.
        </p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          {tickets.map((ticket) => {
            const msgs = parseMessages(ticket.messages);
            const isExpanded = expandedId === ticket.id;

            return (
              <div key={ticket.id} className="card" style={{ padding: 16 }}>
                <div
                  style={{ display: "flex", justifyContent: "space-between", cursor: "pointer" }}
                  onClick={() => setExpandedId(isExpanded ? null : ticket.id)}
                >
                  <div>
                    <b>
                      [{ticket.category === "ACCOUNT" ? "Tài khoản" : "Nạp tiền"}] {ticket.subject}
                    </b>
                    <p style={{ margin: "4px 0 0", color: "var(--color-text-muted)", fontSize: 13 }}>
                      {formatDateTime(ticket.updatedAt)}
                    </p>
                  </div>
                  <span
                    style={{
                      padding: "4px 10px",
                      borderRadius: 999,
                      background: ticket.status === "OPEN" ? "#dcfce7" : "#f3f4f6",
                      color: ticket.status === "OPEN" ? "#166534" : "#6b7280",
                      fontWeight: 800,
                      fontSize: 12,
                      height: "fit-content",
                    }}
                  >
                    {ticket.status === "OPEN" ? "Đang mở" : "Đã đóng"}
                  </span>
                </div>

                {isExpanded && (
                  <div style={{ marginTop: 14, borderTop: "1px solid var(--color-border)", paddingTop: 14 }}>
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
                          placeholder="Nhập tin nhắn..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              void handleReply(ticket.id);
                            }
                          }}
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
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
