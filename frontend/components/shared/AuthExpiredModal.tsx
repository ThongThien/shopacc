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
    <div className="modal-backdrop">
      <div className="modal-card">
        <h2>Phiên đăng nhập đã hết hạn</h2>

        <p>{message}</p>

        <button
          className="btn-primary"
          type="button"
          onClick={() => {
            setOpen(false);
            router.push("/login");
          }}
        >
          Đăng nhập lại
        </button>
      </div>
    </div>
  );
}
