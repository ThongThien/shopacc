"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, type CartItem } from "@/components/cart/CartContext";
import { getMyBalance } from "@/services/user.service";
import { purchaseListing } from "@/services/order.service";
import { formatCurrency } from "@/lib/format";
import { useNotify } from "@/components/shared/NotificationProvider";
import { showLoading, hideLoading } from "@/components/shared/LoadingOverlay";
import { apiFetch } from "@/lib/api";

interface DiscountResult {
  valid: boolean;
  message?: string;
  discountId?: number;
  code?: string;
  type?: string;
  value?: number;
  discountAmount?: number;
  originalTotal?: number;
  finalTotal?: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { notify } = useNotify();
  const { items, removeItem, clearCart } = useCart();

  const [balance, setBalance] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [discount, setDiscount] = useState<DiscountResult | null>(null);
  const [validating, setValidating] = useState(false);
  const [results, setResults] = useState<
    { item: CartItem; success: boolean; error?: string }[]
  >([]);

  useEffect(() => {
    getMyBalance()
      .then((b) => setBalance(b.balance))
      .catch(() => setBalance(0));

    if (items.length === 0) {
      router.replace("/me/orders");
    }
  }, [items, router]);

  const total = items.reduce((s, i) => s + i.price, 0);
  const discountedTotal = discount?.finalTotal ?? total;
  const discountAmount = discount?.discountAmount ?? 0;
  const remaining =
    balance != null ? balance - discountedTotal : -1;
  const canBuyAll = remaining >= 0;

  async function handleValidateDiscount() {
    if (!discountCode.trim()) return;
    setValidating(true);
    try {
      const result = await apiFetch<DiscountResult>(
        `/api/orders/validate-discount?code=${encodeURIComponent(discountCode.trim())}&total=${total}`,
      );
      setDiscount(result);
      if (result.valid) {
        notify("success", `Áp dụng mã "${result.code}": -${formatCurrency(result.discountAmount!)}`);
      } else {
        notify("error", result.message || "Mã không hợp lệ");
      }
    } catch {
      notify("error", "Không thể kiểm tra mã giảm giá");
    } finally {
      setValidating(false);
    }
  }

  async function handlePayAll() {
    setProcessing(true);
    showLoading("Đang thanh toán...");
    const res: typeof results = [];

    for (const item of items) {
      try {
        await purchaseListing(item.listingId, item.serviceInfo);
        res.push({ item, success: true });
      } catch (err) {
        res.push({
          item,
          success: false,
          error: err instanceof Error ? err.message : "Thất bại",
        });
        notify("error", `Mua "${item.title}" thất bại. Dừng lại.`);
        break;
      }
    }

    setResults(res);
    const successItems = res.filter((r) => r.success);
    if (successItems.length > 0) {
      // Only remove successfully purchased items from cart
      for (const r of successItems) {
        removeItem(r.item.listingId).catch(console.error);
      }
      window.dispatchEvent(new Event("balance-changed"));
      notify(
        "success",
        `Đã mua thành công ${successItems.length}/${items.length} acc. Xem trong lịch sử mua.`,
      );
    }

    setProcessing(false);
    hideLoading();
  }

  if (items.length === 0) return null;

  return (
    <section style={{ maxWidth: 720, margin: "0 auto", padding: "28px 16px" }}>
      <div className="card" style={{ padding: 24 }}>
        <h1 style={{ margin: "0 0 6px" }}>Thanh toán</h1>
        <p style={{ color: "var(--color-text-muted)", margin: "0 0 20px" }}>
          Xác nhận mua {items.length} acc
        </p>

        {/* Items */}
        <div style={{ display: "grid", gap: 10, marginBottom: 20 }}>
          {items.map((item) => (
            <div
              key={item.listingId}
              style={{
                display: "grid",
                gap: 10,
                padding: 10,
                borderRadius: 10,
                border: "1px solid var(--color-border)",
                background: "var(--color-bg-secondary)",
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <img
                src={item.thumbnail || "/placeholder.png"}
                alt={item.title}
                style={{
                  width: 72,
                  height: 54,
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <b
                  style={{
                    display: "block",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.title}
                </b>
                <small style={{ color: "var(--color-text-muted)" }}>
                  {item.gameName}
                  {item.serverName ? ` · SV ${item.serverName}` : ""}
                </small>
              </div>
              <b style={{ color: "var(--color-primary)", fontSize: 17, whiteSpace: "nowrap" }}>
                {formatCurrency(item.price)}
              </b>
            </div>

            {item.listingType === "SERVICE" && item.serviceInfo && (
              <div style={{ fontSize: 12, color: "var(--color-text-muted)",
                borderTop: "1px solid var(--color-border)", paddingTop: 8 }}>
                {(function () {
                  try {
                    const info = JSON.parse(item.serviceInfo);
                    return (
                      <span>TK: <b>{info.accountName}</b> · Server: <b>{info.server || "-"}</b>{info.note ? ` · ${info.note}` : ""}</span>
                    );
                  } catch { return null; }
                })()}
              </div>
            )}
          </div>
          ))}
        </div>

        {/* Discount Code */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <input
            className="input"
            placeholder="Nhập mã giảm giá (nếu có)"
            value={discountCode}
            onChange={(e) => {
              setDiscountCode(e.target.value);
              setDiscount(null);
            }}
            onKeyDown={(e) => { if (e.key === "Enter") handleValidateDiscount(); }}
          />
          <button
            className="btn-secondary"
            type="button"
            disabled={!discountCode.trim() || validating}
            onClick={handleValidateDiscount}
            style={{ whiteSpace: "nowrap" }}
          >
            {validating ? "..." : "Áp dụng"}
          </button>
        </div>

        {discount && discount.valid && (
          <div
            style={{
              background: "#dcfce7",
              border: "1px solid #bbf7d0",
              borderRadius: 10,
              padding: "10px 14px",
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontWeight: 700, color: "#166534" }}>
              Mã &quot;{discount.code}&quot;:{" "}
              {discount.type === "PERCENT" ? `-${discount.value}%` : `-${formatCurrency(discount.value!)}`}
            </span>
            <button
              type="button"
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: "#166534",
                fontWeight: 700,
              }}
              onClick={() => { setDiscount(null); setDiscountCode(""); }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Balance */}
        <div
          style={{
            background: "var(--color-bg-secondary)",
            borderRadius: 12,
            padding: 14,
            marginBottom: 16,
          }}
        >
          <div
            style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}
          >
            <span>Số dư hiện tại:</span>
            <b>{balance != null ? formatCurrency(balance) : "..."}</b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Tổng thanh toán:</span>
            <b style={{ color: "var(--color-primary)" }}>{formatCurrency(total)}</b>
          </div>
          {discount?.valid && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Giảm giá:</span>
              <b className="text-success">-{formatCurrency(discountAmount)}</b>
            </div>
          )}
          <hr style={{ border: "none", borderTop: "1px solid var(--color-border)", margin: "10px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Tổng cuối:</span>
            <b style={{ color: "var(--color-primary)", fontSize: 17 }}>
              {formatCurrency(discountedTotal)}
            </b>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Số dư còn lại:</span>
            <b className={canBuyAll ? "text-success" : "text-danger"}>
              {remaining >= 0 ? formatCurrency(remaining) : `Thiếu ${formatCurrency(-remaining)}`}
            </b>
          </div>
        </div>

        {!canBuyAll && (
          <div className="danger-box">
            Số dư không đủ. Vui lòng nạp thêm tiền trước khi thanh toán.
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => router.back()}
          >
            Quay lại
          </button>
          <button
            className="btn-primary"
            type="button"
            disabled={!canBuyAll || processing}
            onClick={handlePayAll}
          >
            {processing ? "Đang xử lý..." : `Thanh toán ${formatCurrency(discountedTotal)}`}
          </button>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div style={{ marginTop: 18 }}>
            {results.map((r) => (
              <p
                key={r.item.listingId}
                style={{
                  margin: "4px 0",
                  fontSize: 14,
                  color: r.success ? "var(--color-success)" : "var(--color-danger)",
                }}
              >
                {r.success ? "✅" : "❌"} {r.item.title}
                {r.error ? ` — ${r.error}` : " — Đã mua thành công"}
              </p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
