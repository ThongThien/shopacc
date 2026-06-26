"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthExpiredModal() {
  const router = useRouter();

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
    }

    window.addEventListener("auth-expired", handleAuthExpired);

    return () => {
      window.removeEventListener("auth-expired", handleAuthExpired);
    };
  }, []);

  if (!open) return null;

  return (
    <div className="auth-card card auth-expired-card">
      <div className="auth-card card">
        <h1>Thông báo</h1>

        <p className="auth-expired-message">{message}</p>

        <div className="auth-expired-actions">
          <button
            className="btn-secondary"
            type="button"
            onClick={() => {
              setOpen(false);
              router.push("/");
            }}
          >
            Về trang chủ
          </button>

          <button
            className="btn-primary"
            type="button"
            onClick={() => {
              setOpen(false);
              router.push("/");
            }}
          >
            Đăng nhập lại
          </button>
        </div>
      </div>
    </div>
  );
}
