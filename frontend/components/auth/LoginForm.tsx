"use client";

import { useState } from "react";
import Link from "next/link";
import { login } from "@/services/auth.service";
import { saveAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useNotify } from "@/components/shared/NotificationProvider";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const { notify } = useNotify();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    try {
      setLoading(true);
      const response = await login({ email, password });
      saveAuth(response);
      notify("success", "Đăng nhập thành công!");
      if (response.role === "ADMIN") { router.push("/admin"); }
      else { router.push("/"); }
      router.refresh();
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-card card">
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700 }}>Đăng nhập</h1>
        <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: 14 }}>
          Chào mừng trở lại
        </p>
      </div>

      <div>
        <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)" }}>Email</label>
        <input className="input" placeholder="Nhập email" value={email}
          onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </div>

      <div>
        <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)" }}>Mật khẩu</label>
        <div style={{ position: "relative" }}>
          <input className="input" type={showPw ? "text" : "password"} placeholder="Nhập mật khẩu"
            value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          <button type="button" onClick={() => setShowPw(!showPw)}
            style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 0 }}>
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--color-text-muted)", cursor: "pointer" }}>
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
            style={{ accentColor: "var(--color-primary)" }} />
          Ghi nhớ
        </label>
        <a href="#" style={{ color: "var(--color-primary)" }}>Quên mật khẩu?</a>
      </div>

      <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
        <LogIn size={18} />
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <p style={{ textAlign: "center", fontSize: 14, color: "var(--color-text-muted)", margin: 0 }}>
        Chưa có tài khoản?{" "}
        <Link href="/register" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Đăng ký</Link>
      </p>
    </form>
  );
}
