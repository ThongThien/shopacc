"use client";

import { useState } from "react";
import Link from "next/link";
import { register } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { useNotify } from "@/components/shared/NotificationProvider";
import { Eye, EyeOff, UserPlus } from "lucide-react";

export default function RegisterForm() {
  const router = useRouter();
  const { notify } = useNotify();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  function pwStrength(pw: string) {
    if (pw.length < 6) return { label: "Yếu", color: "var(--color-danger)", width: "25%" };
    if (pw.length < 8) return { label: "Trung bình", color: "var(--color-warning)", width: "50%" };
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pw)) return { label: "Mạnh", color: "var(--color-price)", width: "100%" };
    return { label: "Khá", color: "var(--color-primary)", width: "75%" };
  }
  const strength = password ? pwStrength(password) : null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirmPassword) { notify("error", "Mật khẩu xác nhận không khớp"); return; }
    if (!agreed) { notify("error", "Vui lòng đồng ý với điều khoản"); return; }
    try {
      setLoading(true);
      await register({ username, email, password });
      notify("success", "Đăng ký thành công!");
      router.push("/login");
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-card card">
      <div style={{ textAlign: "center", marginBottom: 8 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700 }}>Đăng ký</h1>
        <p style={{ margin: 0, color: "var(--color-text-muted)", fontSize: 14 }}>
          Tạo tài khoản để bắt đầu
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)" }}>Tên đăng nhập</label>
          <input className="input" placeholder="Username" value={username}
            onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)" }}>Email</label>
          <input className="input" type="email" placeholder="email@example.com" value={email}
            onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)" }}>Mật khẩu</label>
          <div style={{ position: "relative" }}>
            <input className="input" type={showPw ? "text" : "password"} placeholder="Tối thiểu 6 ký tự"
              value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
            <button type="button" onClick={() => setShowPw(!showPw)}
              style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--color-text-muted)", padding: 0 }}>
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {strength && (
            <div style={{ marginTop: 6 }}>
              <div style={{ height: 4, borderRadius: 2, background: "var(--color-bg-hover)" }}>
                <div style={{ height: "100%", width: strength.width, background: strength.color, borderRadius: 2, transition: "width 0.2s" }} />
              </div>
              <span style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}>{strength.label}</span>
            </div>
          )}
        </div>
        <div>
          <label style={{ display: "block", marginBottom: 6, fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)" }}>Xác nhận mật khẩu</label>
          <input className="input" type="password" placeholder="Nhập lại mật khẩu" value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" />
        </div>
      </div>

      <div style={{ background: "var(--color-bg-secondary)", borderRadius: 12, padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 48, height: 48, background: "var(--color-bg-hover)", borderRadius: 8, display: "grid", placeItems: "center", fontSize: 20, fontWeight: 700, color: "var(--color-text-muted)" }}>
          A7xK
        </div>
        <div>
          <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-secondary)" }}>Xác minh bạn là người</p>
          <input className="input" style={{ height: 40, marginTop: 6 }} placeholder="Nhập mã captcha" />
        </div>
      </div>

      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--color-text-muted)", cursor: "pointer" }}>
        <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
          style={{ accentColor: "var(--color-primary)" }} />
        Tôi đồng ý với{" "}
        <a href="#" style={{ color: "var(--color-primary)" }}>Điều khoản</a> và{" "}
        <a href="#" style={{ color: "var(--color-primary)" }}>Chính sách bảo mật</a>
      </label>

      <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%" }}>
        <UserPlus size={18} />
        {loading ? "Đang đăng ký..." : "Tạo tài khoản"}
      </button>

      <p style={{ textAlign: "center", fontSize: 14, color: "var(--color-text-muted)", margin: 0 }}>
        Đã có tài khoản?{" "}
        <Link href="/login" style={{ color: "var(--color-primary)", fontWeight: 600 }}>Đăng nhập</Link>
      </p>
    </form>
  );
}
