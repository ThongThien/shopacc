"use client";

import { ReactNode, useEffect, useState } from "react";
import { getAccessToken, getUserRole } from "@/lib/auth";

interface Props {
  children: ReactNode;
  role?: "ADMIN" | "USER";
}

export default function ProtectedRoute({ children, role }: Props) {
  console.log("ProtectedRoute render", role);
  const [message, setMessage] = useState("Đang xác thực quyền truy cập...");
  const [countdown, setCountdown] = useState<number | null>(null);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    console.log("ProtectedRoute useEffect run", role);
    setAllowed(false);
    setCountdown(null);
    setMessage("Đang xác thực quyền truy cập...");

    const token = getAccessToken();

    let redirectPath = "";
    let redirectMessage = "";

    if (!token) {
      redirectPath = "/login";
      redirectMessage =
        "Phiên đăng nhập đã hết hạn. Tự chuyển về trang đăng nhập sau";
    } else {
      const currentRole = getUserRole();

      if (role && currentRole !== role) {
        redirectPath = "/login";
        redirectMessage =
          "Bạn không có quyền truy cập. Tự chuyển về trang chủ sau";
      }
    }

    if (redirectPath) {
      setMessage(redirectMessage);
      setCountdown(2);

      window.dispatchEvent(
        new CustomEvent("auth-expired", {
          detail: {
            message: redirectMessage,
          },
        }),
      );

      const intervalId = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            window.clearInterval(intervalId);
            window.location.href = redirectPath;
            return 0;
          }

          return prev - 1;
        });
      }, 1000);

      return () => {
        window.clearInterval(intervalId);
      };
    }

    setAllowed(true);
  }, [role]);

  if (!allowed) {
    return (
      <section className="page-container">
        {message}
        {countdown !== null ? ` ${countdown}s...` : ""}
      </section>
    );
  }

  return children;
}
