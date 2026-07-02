"use client";

import { useEffect, useState } from "react";
import { clearAuth } from "@/lib/auth";

export default function AuthExpiredModal() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState(
    "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  );

  useEffect(() => {
    function handleAuthExpired(event: Event) {
      const customEvent = event as CustomEvent<{ message?: string }>;

      setMessage(
        customEvent.detail?.message ||
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
      );

      setOpen(true);

      // Auto-redirect sau 2s
      const timer = setTimeout(() => {
        window.location.href = "/login";
      }, 2000);

      return () => clearTimeout(timer);
    }

    window.addEventListener("auth-expired", handleAuthExpired);

    return () => {
      window.removeEventListener("auth-expired", handleAuthExpired);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>Phiên đăng nhập hết hạn</h2>

        <p style={{ color: "var(--muted)", margin: "12px 0" }}>{message}</p>
        <p style={{ fontSize: 13, color: "var(--muted)" }}>
          Tự động chuyển về trang đăng nhập sau 2 giây...
        </p>

        <div className="modal-actions" style={{ marginTop: 16 }}>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => {
              clearAuth();
              window.location.replace("/");
            }}
          >
            Về trang chủ
          </button>

          <button
            className="btn-primary"
            type="button"
            onClick={() => {
              clearAuth();
              setTimeout(() => {
                window.location.replace("/login");
              }, 100);
            }}
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    </div>
  );
}
