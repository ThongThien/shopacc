"use client";

import { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import { formatCurrency } from "@/lib/format";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const { items, removeItem, clearCart, total, count } = useCart();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleToggle() {
      setOpen((prev) => !prev);
    }

    window.addEventListener("cart:toggle", handleToggle);
    return () => window.removeEventListener("cart:toggle", handleToggle);
  }, []);

  function goToCheckout() {
    setOpen(false);
    router.push("/checkout");
  }

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.45)",
            zIndex: 999,
          }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: 380,
          maxWidth: "100%",
          background: "white",
          boxShadow: "-8px 0 32px rgba(15,23,42,0.15)",
          zIndex: 1000,
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "18px 20px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: 19 }}>Giỏ hàng ({count})</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              border: "none",
              background: "transparent",
              fontSize: 22,
              cursor: "pointer",
              color: "var(--muted)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px" }}>
          {items.length === 0 ? (
            <p style={{ color: "var(--muted)", textAlign: "center", marginTop: 60 }}>
              Giỏ hàng trống
            </p>
          ) : (
            <div style={{ display: "grid", gap: 12 }}>
              {items.map((item) => (
                <div
                  key={item.listingId}
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: 10,
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--surface-soft)",
                  }}
                >
                  <img
                    src={item.thumbnail || "/placeholder.png"}
                    alt={item.title}
                    style={{
                      width: 64,
                      height: 48,
                      objectFit: "cover",
                      borderRadius: 8,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontWeight: 700,
                        fontSize: 14,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.title}
                    </p>
                    <p style={{ margin: "2px 0", color: "var(--muted)", fontSize: 12 }}>
                      {item.gameName}
                      {item.serverName ? ` · ${item.serverName}` : ""}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        color: "var(--accent)",
                        fontWeight: 900,
                        fontSize: 15,
                      }}
                    >
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void removeItem(item.listingId)}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "var(--danger)",
                      cursor: "pointer",
                      fontSize: 16,
                      alignSelf: "flex-start",
                      padding: "2px 6px",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            style={{
              borderTop: "1px solid var(--border)",
              padding: "16px 20px",
              display: "grid",
              gap: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <b>Tổng cộng:</b>
              <strong
                style={{ color: "var(--accent)", fontSize: 22, fontWeight: 900 }}
              >
                {formatCurrency(total)}
              </strong>
            </div>
            <button
              className="btn-primary"
              type="button"
              onClick={goToCheckout}
              style={{ width: "100%", padding: "13px" }}
            >
              Thanh toán ngay
            </button>
            <button
              type="button"
              onClick={() => void clearCart()}
              style={{
                border: "none",
                background: "transparent",
                color: "var(--muted)",
                cursor: "pointer",
                fontSize: 13,
                textAlign: "center",
              }}
            >
              Xóa tất cả
            </button>
          </div>
        )}
      </div>
    </>
  );
}
