"use client";

import { useEffect, useRef, useState } from "react";
import { createDeposit, getMyDeposits } from "@/services/payment.service";
import { Transaction } from "@/types/transaction";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useNotify } from "@/components/shared/NotificationProvider";
import { showLoading, hideLoading } from "@/components/shared/LoadingOverlay";
import NoticeBox from "@/components/layout/NoticeBox";

function statusBadge(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    PENDING: { bg: "#fef3c7", color: "#92400e" },
    SUCCESS: { bg: "#dcfce7", color: "#166534" },
    FAILED: { bg: "#fee2e2", color: "#991b1b" },
    NEED_REVIEW: { bg: "#ffedd5", color: "#9a3412" },
    EXPIRED: { bg: "#f3f4f6", color: "#6b7280" },
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

export default function UserDeposits() {
  const { notify, confirmAction } = useNotify();

  const [activeTab, setActiveTab] = useState<"atm" | "card">("atm");
  const [amount, setAmount] = useState(10000);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const txsRef = useRef<Transaction[]>([]);

  // Giữ ref đồng bộ để polling không bị reset interval
  useEffect(() => {
    txsRef.current = transactions;
  }, [transactions]);
  const [depositContent, setDepositContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const PAGE_SIZE = 10;

  const [telco, setTelco] = useState("Viettel");
  const [cardValue, setCardValue] = useState("10000");
  const [cardSerial, setCardSerial] = useState("");
  const [cardCode, setCardCode] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [accountName, setAccountName] = useState("");

  async function loadDeposits() {
    const data = await getMyDeposits();
    setTransactions(data);
  }

  async function handleManualRefresh() {
    setRefreshing(true);
    try {
      await loadDeposits();
      window.dispatchEvent(new Event("balance-changed"));
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadDeposits().catch(console.error);

    function handleRefresh() {
      void loadDeposits().catch(console.error);
    }

    window.addEventListener("balance-changed", handleRefresh);

    // Auto-poll mỗi 30s khi có giao dịch PENDING
    const poll = setInterval(() => {
      if (txsRef.current.some((t) => t.status === "PENDING")) {
        void loadDeposits().catch(console.error);
        window.dispatchEvent(new Event("balance-changed"));
      }
    }, 30000);

    return () => {
      window.removeEventListener("balance-changed", handleRefresh);
      clearInterval(poll);
    };
  }, []);

  async function handleCreateAtmDeposit() {
    const ok = await confirmAction(
      `Bạn muốn tạo lệnh nạp ${formatCurrency(amount)} qua ATM?`,
    );

    if (!ok) return;

    try {
      setLoading(true);
      showLoading("Đang tạo lệnh nạp...");

      const response = await createDeposit(amount);
      setDepositContent(response.transferContent);
      setQrUrl(response.qrUrl);
      setBankName(response.bankName);
      setAccountName(response.accountName);
      setBankAccount(response.bankAccount);
      notify(
        "success",
        "Đã tạo lệnh nạp ATM. Vui lòng chuyển khoản đúng nội dung.",
      );

      window.dispatchEvent(new Event("balance-changed"));
      await loadDeposits();
    } catch (error) {
      notify(
        "error",
        error instanceof Error ? error.message : "Tạo lệnh nạp thất bại",
      );
    } finally {
      setLoading(false);
      hideLoading();
    }
  }

  function handleSubmitCard() {
    notify(
      "warning",
      "Nạp thẻ cào chưa được kích hoạt vì backend chưa có nhà cung cấp xử lý thẻ.",
    );
  }

  async function handleCopyContent() {
    if (!depositContent) return;

    await navigator.clipboard.writeText(depositContent);
    notify("success", "Đã copy nội dung chuyển khoản");
  }

  const pagedTxs = transactions.slice(
    (historyPage - 1) * PAGE_SIZE,
    historyPage * PAGE_SIZE,
  );
  const totalHistoryPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));

  return (
    <section>
      <NoticeBox type="deposit" />

      {/* ========== DEPOSIT FORM + QR ========== */}
      <div className="card" style={{ padding: 28, marginBottom: 22 }}>
        <div className="deposit-tabs">
          <button
            className={activeTab === "atm" ? "active" : ""}
            onClick={() => setActiveTab("atm")}
            type="button"
          >
            ATM / Chuyển khoản
          </button>
          <button
            className={activeTab === "card" ? "active" : ""}
            onClick={() => setActiveTab("card")}
            type="button"
          >
            Thẻ cào
          </button>
        </div>

        {activeTab === "atm" && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 28,
              alignItems: "start",
            }}
          >
            {/* Left: form */}
            <div style={{ display: "grid", gap: 12 }}>
              <h1 style={{ margin: 0 }}>Nạp tiền ATM</h1>
              <label>Số tiền cần nạp</label>
              <input
                className="input"
                type="number"
                min={1000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={{ fontSize: 20, fontWeight: 700, padding: "14px 16px" }}
              />
              <button
                className="btn-primary"
                type="button"
                onClick={handleCreateAtmDeposit}
                disabled={loading || amount < 1000}
                style={{ padding: "14px 24px", fontSize: 17 }}
              >
                {loading ? "Đang tạo..." : "Tạo lệnh nạp"}
              </button>

              {depositContent && (
                <div style={{ marginTop: 8 }}>
                  <p style={{ margin: "6px 0" }}>
                    <b>Ngân hàng:</b> {bankName}
                  </p>
                  <p style={{ margin: "6px 0" }}>
                    <b>Số tài khoản:</b> {bankAccount}
                  </p>
                  <p style={{ margin: "6px 0" }}>
                    <b>Chủ tài khoản:</b> {accountName}
                  </p>
                  <p
                    style={{
                      margin: "6px 0",
                      background: "#ecfdf5",
                      border: "1px solid #bbf7d0",
                      borderRadius: 8,
                      padding: "10px 12px",
                      color: "#065f46",
                      fontFamily: "monospace",
                      fontSize: 14,
                      wordBreak: "break-all",
                    }}
                  >
                    <b>Nội dung:</b>{" "}
                    <span style={{ fontSize: 15, fontWeight: 700 }}>
                      {depositContent}
                    </span>
                  </p>
                  <button
                    className="btn-secondary"
                    type="button"
                    onClick={handleCopyContent}
                    style={{ marginTop: 8, width: "100%" }}
                  >
                    Copy nội dung
                  </button>
                </div>
              )}
            </div>

            {/* Right: QR */}
            <div
              style={{
                display: "grid",
                placeItems: "center",
                background: depositContent ? "var(--surface-soft)" : "transparent",
                borderRadius: 16,
                padding: depositContent ? 20 : 0,
                border: depositContent ? "1px solid var(--border)" : "none",
                minHeight: depositContent ? 380 : 0,
              }}
            >
              {depositContent ? (
                <img
                  src={qrUrl}
                  alt="QR nạp tiền"
                  style={{
                    width: "100%",
                    maxWidth: 320,
                    borderRadius: 14,
                    background: "white",
                    padding: 12,
                    border: "1px solid var(--border)",
                  }}
                />
              ) : (
                <p style={{ color: "var(--muted)" }}>
                  Nhập số tiền và bấm &quot;Tạo lệnh nạp&quot; để hiện QR
                </p>
              )}
            </div>
          </div>
        )}

        {activeTab === "card" && (
          <div className="deposit-form">
            <h1>Nạp thẻ cào</h1>
            <label>Nhà mạng</label>
            <select
              className="input"
              value={telco}
              onChange={(e) => setTelco(e.target.value)}
            >
              <option>Viettel</option>
              <option>Mobifone</option>
              <option>Vinaphone</option>
            </select>
            <label>Mệnh giá</label>
            <select
              className="input"
              value={cardValue}
              onChange={(e) => setCardValue(e.target.value)}
            >
              <option value="10000">10.000đ</option>
              <option value="20000">20.000đ</option>
              <option value="50000">50.000đ</option>
              <option value="100000">100.000đ</option>
              <option value="200000">200.000đ</option>
              <option value="500000">500.000đ</option>
            </select>
            <label>Serial</label>
            <input
              className="input"
              value={cardSerial}
              onChange={(e) => setCardSerial(e.target.value)}
              placeholder="Nhập serial thẻ"
            />
            <label>Mã thẻ</label>
            <input
              className="input"
              value={cardCode}
              onChange={(e) => setCardCode(e.target.value)}
              placeholder="Nhập mã thẻ"
            />
            <button
              className="btn-primary"
              type="button"
              onClick={handleSubmitCard}
            >
              Gửi thẻ
            </button>
            <p className="muted-text">
              Nạp thẻ sẽ có chiết khấu theo nhà cung cấp. Chức năng này sẽ
              được bật sau khi backend tích hợp cổng thẻ.
            </p>
          </div>
        )}
      </div>

      {/* ========== HISTORY TABLE ========== */}
      <div className="card table-card" style={{ padding: 20 }}>
        <div className="table-heading">
          <div>
            <h1>Lịch sử nạp</h1>
            <p>Theo dõi trạng thái các lệnh nạp tiền của bạn.</p>
          </div>
          <button
            className="btn-secondary"
            type="button"
            disabled={refreshing}
            onClick={handleManualRefresh}
          >
            {refreshing ? "Đang làm mới..." : "Làm mới"}
          </button>
        </div>

        {transactions.length === 0 ? (
          <p className="empty-text">Chưa có giao dịch nạp tiền.</p>
        ) : (
          <>
            <div style={{ maxHeight: 420, overflowY: "auto" }}>
              <div className="responsive-table">
                <table className="data-table">
                  <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <tr>
                      <th>Mã giao dịch</th>
                      <th>Số tiền</th>
                      <th>Trạng thái</th>
                      <th>Thời gian</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedTxs.map((tx) => (
                      <tr key={tx.id}>
                        <td
                          style={{
                            fontFamily: "monospace",
                            fontSize: 13,
                            maxWidth: 240,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {tx.transactionCode}
                        </td>
                        <td>{formatCurrency(tx.amount)}</td>
                        <td>{statusBadge(tx.status)}</td>
                        <td>{formatDateTime(tx.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {transactions.length > PAGE_SIZE && (
              <div className="admin-pagination" style={{ marginTop: 14 }}>
                <p>
                  Hiển thị {(historyPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(historyPage * PAGE_SIZE, transactions.length)} /{" "}
                  {transactions.length} giao dịch
                </p>
                <div>
                  <button
                    className="btn-secondary"
                    type="button"
                    disabled={historyPage <= 1}
                    onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  >
                    Trước
                  </button>
                  <span style={{ fontWeight: 700 }}>
                    {historyPage} / {totalHistoryPages}
                  </span>
                  <button
                    className="btn-secondary"
                    type="button"
                    disabled={historyPage >= totalHistoryPages}
                    onClick={() =>
                      setHistoryPage((p) => Math.min(totalHistoryPages, p + 1))
                    }
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
