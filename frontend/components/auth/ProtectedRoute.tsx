"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, getUserRole } from "@/lib/auth";
import { useNotify } from "@/components/shared/NotificationProvider";

interface Props {
  children: ReactNode;
  role?: "ADMIN" | "USER";
}

export default function ProtectedRoute({ children, role }: Props) {
  const router = useRouter();
  const { notify } = useNotify();

  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = getAccessToken();

    if (!token) {
      notify("warning", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      router.replace("/login");
      return;
    }

    const currentRole = getUserRole();

    if (role && currentRole !== role) {
      notify("error", "Bạn không có quyền truy cập trang này.");
      router.replace("/");
      return;
    }

    setAllowed(true);
  }, [router, notify, role]);

  if (!allowed) {
    return (
      <section className="page-container">Đang kiểm tra đăng nhập...</section>
    );
  }

  return children;
}
