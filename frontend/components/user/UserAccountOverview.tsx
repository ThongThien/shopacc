"use client";

import { useEffect, useState } from "react";
import { getMyBalance } from "@/services/user.service";
import { UserBalance } from "@/types/user";
import { formatCurrency } from "@/lib/format";

export default function UserAccountOverview() {
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyBalance()
      .then(setBalance)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Không tải được số dư");
      });
  }, []);

  return (
    <section className="card user-card">
      <h1>Tài khoản của tôi</h1>

      {error && <p className="form-error">{error}</p>}

      <p>Xin chào, {balance?.username || "khách hàng"}</p>

      <div className="balance-box">
        <span>Số dư</span>
        <strong>{formatCurrency(balance?.balance || 0)}</strong>
      </div>
    </section>
  );
}
