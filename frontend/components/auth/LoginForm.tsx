"use client";

import { useState } from "react";
import { login } from "@/services/auth.service";
import { saveAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useNotify } from "@/components/shared/NotificationProvider";

export default function LoginForm() {
  const router = useRouter();
  const { notify } = useNotify();

  const [email, setEmail] = useState("c1@gmail.com");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);

      const response = await login({
        email,
        password,
      });

      saveAuth(response);

      notify("success", "Đăng nhập thành công. Chào mừng bạn quay lại!");

      if (response.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }

      router.refresh();
    } catch (err) {
      notify(
        "error",
        err instanceof Error ? err.message : "Đăng nhập thất bại",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-card card">
      <h1>Đăng nhập</h1>

      <p className="auth-subtitle">
        Đăng nhập để mua acc, xem lịch sử mua và quản lý số dư.
      </p>

      <input
        className="input"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />

      <input
        className="input"
        placeholder="Mật khẩu"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />

      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>
    </form>
  );
}
