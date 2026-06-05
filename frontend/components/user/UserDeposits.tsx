"use client";

import { useEffect, useState } from "react";
import { createDeposit, getMyDeposits } from "@/services/payment.service";
import { Transaction } from "@/types/transaction";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useNotify } from "@/components/shared/NotificationProvider";
import NoticeBox from "@/components/layout/NoticeBox";

const BANK_NAME = "MB Bank";
const BANK_ACCOUNT = "0772438318";
const BANK_OWNER = "THIEN NGOC RONG SHOP";

export default function UserDeposits() {
  const { notify, confirmAction } = useNotify();

  const [activeTab, setActiveTab] = useState<"atm" | "card">("atm");
  const [amount, setAmount] = useState(10000);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositContent, setDepositContent] = useState("");
  const [loading, setLoading] = useState(false);

  const [telco, setTelco] = useState("Viettel");
  const [cardValue, setCardValue] = useState("10000");
  const [cardSerial, setCardSerial] = useState("");
  const [cardCode, setCardCode] = useState("");

  async function loadDeposits() {
    const data = await getMyDeposits();
    setTransactions(data);
  }

  useEffect(() => {
    void loadDeposits().catch(console.error);
  }, []);

  async function handleCreateAtmDeposit() {
    const ok = await confirmAction(
      `Bạn muốn tạo lệnh nạp ${formatCurrency(amount)} qua ATM?`,
    );

    if (!ok) return;

    try {
      setLoading(true);

      const response = await createDeposit(amount);
      setDepositContent(response.transferContent);

      notify(
        "success",
        "Đã tạo lệnh nạp ATM. Vui lòng chuyển khoản đúng nội dung.",
      );

      await loadDeposits();
    } catch (error) {
      notify(
        "error",
        error instanceof Error ? error.message : "Tạo lệnh nạp thất bại",
      );
    } finally {
      setLoading(false);
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

  const qrUrl =
    depositContent && amount
      ? `https://img.vietqr.io/image/MB-${BANK_ACCOUNT}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(
          depositContent,
        )}&accountName=${encodeURIComponent(BANK_OWNER)}`
      : "";

  return (
    <section>
      <NoticeBox type="deposit" />

      <div className="deposit-layout">
        <div className="card deposit-panel">
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
            <div className="deposit-form">
              <h1>Nạp tiền ATM</h1>

              <label>Số tiền cần nạp</label>
              <input
                className="input"
                type="number"
                min={1000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
              />

              <button
                className="btn-primary"
                type="button"
                onClick={handleCreateAtmDeposit}
                disabled={loading || amount < 1000}
              >
                {loading ? "Đang tạo..." : "Tạo lệnh nạp"}
              </button>

              {depositContent && (
                <div className="qr-box">
                  <img src={qrUrl} alt="QR nạp tiền" />

                  <div>
                    <p>
                      <b>Ngân hàng:</b> {BANK_NAME}
                    </p>
                    <p>
                      <b>Số tài khoản:</b> {BANK_ACCOUNT}
                    </p>
                    <p>
                      <b>Chủ tài khoản:</b> {BANK_OWNER}
                    </p>
                    <p>
                      <b>Nội dung:</b> {depositContent}
                    </p>

                    <button
                      className="btn-secondary"
                      type="button"
                      onClick={handleCopyContent}
                    >
                      Copy nội dung
                    </button>
                  </div>
                </div>
              )}
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

        <div className="card table-card">
          <div className="table-heading">
            <div>
              <h1>Lịch sử nạp</h1>
              <p>Theo dõi trạng thái các lệnh nạp tiền của bạn.</p>
            </div>
          </div>

          {transactions.length === 0 ? (
            <p className="empty-text">Chưa có giao dịch nạp tiền.</p>
          ) : (
            <div className="responsive-table">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã giao dịch</th>
                    <th>Số tiền</th>
                    <th>Trạng thái</th>
                    <th>Thời gian</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{transaction.transactionCode}</td>
                      <td>{formatCurrency(transaction.amount)}</td>
                      <td>{transaction.status}</td>
                      <td>{formatDateTime(transaction.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
