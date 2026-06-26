"use client";

import { useState } from "react";
import { register } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { useNotify } from "@/components/shared/NotificationProvider";

export default function RegisterForm() {
  const router = useRouter();
  const { notify } = useNotify();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (password !== confirmPassword) {
      notify("error", "Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);

      await register({
        username,
        email,
        password,
      });

      notify("success", "Đăng ký thành công");

      router.push("/login");
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-card card">
      <h1>Đăng ký</h1>

      <input
        className="input"
        placeholder="Tên đăng nhập"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
      />

      <input
        className="input"
        placeholder="Email"
        type="email"
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
        autoComplete="new-password"
      />

      <input
        className="input"
        placeholder="Xác nhận mật khẩu"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        autoComplete="new-password"
      />

      <button className="btn-primary" type="submit" disabled={loading}>
        {loading ? "Đang đăng ký..." : "Đăng ký"}
      </button>
    </form>
  );
}
