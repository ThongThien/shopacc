"use client";

import { useEffect, useMemo, useState } from "react";
import { getAdminTransactions } from "@/services/admin.service";
import { Transaction } from "@/types/transaction";
import { formatCurrency, formatDateTime } from "@/lib/format";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const data = await getAdminTransactions();
        setTransactions(data);
      } finally {
        setLoading(false);
      }
    }

    void load().catch(console.error);
  }, []);

  const filteredTransactions = useMemo(() => {
    const kw = keyword.toLowerCase().trim();

    return transactions
      .filter((item) => {
        if (!kw) return true;

        return `${item.transactionCode} ${item.description || ""} ${item.provider || ""}`
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

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Quản lý giao dịch</h1>
          <p>Theo dõi nạp tiền, mua hàng và các biến động giao dịch.</p>
        </div>
      </div>

      <div className="card admin-toolbar">
        <input
          className="input"
          placeholder="Tìm mã giao dịch, mô tả, cổng thanh toán..."
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
        </select>
      </div>

      <div className="card table-card">
        {loading ? (
          <LoadingSpinner text="Đang tải giao dịch......" />
        ) : (
          <div className="responsive-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Loại</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Cổng thanh toán</th>
                  <th>Mô tả</th>
                  <th>Thời gian</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.transactionCode}</td>
                    <td>{transaction.type || "-"}</td>
                    <td>{formatCurrency(transaction.amount)}</td>
                    <td>{transaction.status}</td>
                    <td>{transaction.provider || "-"}</td>
                    <td>{transaction.description || "-"}</td>
                    <td>{formatDateTime(transaction.createdAt)}</td>
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
