"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { login } from "@/services/auth.service";
import { saveAuth } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useNotify } from "@/components/shared/NotificationProvider";
import { Eye, EyeOff, LogIn, RefreshCw } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const { notify } = useNotify();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captchaId, setCaptchaId] = useState("");
  const [captchaImg, setCaptchaImg] = useState("");
  const [captchaCode, setCaptchaCode] = useState("");

  useEffect(() => {
    refreshCaptcha();
  }, []);

  async function refreshCaptcha() {
    setCaptchaCode("");
    try {
      const res = await apiFetch<{ captchaId: string; imageBase64: string }>(
        "/api/auth/captcha",
        { auth: false },
      );
      setCaptchaId(res.captchaId);
      setCaptchaImg(res.imageBase64);
    } catch {
      setCaptchaImg("");
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!email.trim()) {
      notify("error", "Vui lòng nhập email");
      return;
    }
    if (!password) {
      notify("error", "Vui lòng nhập mật khẩu");
      return;
    }
    if (!captchaCode.trim()) {
      notify("error", "Vui lòng nhập mã xác nhận");
      return;
    }

    try {
      setLoading(true);
      const response = await login({
        email: email.trim(),
        password,
        captchaId,
        captchaCode: captchaCode.trim(),
      });
      saveAuth(response);
      notify("success", "Đăng nhập thành công!");
      if (response.role === "ADMIN") router.push("/admin");
      else router.push("/");
      router.refresh();
    } catch (err) {
      notify(
        "error",
        err instanceof Error ? err.message : "Đăng nhập thất bại",
      );
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="auth-card card">
      <div style={{ textAlign: "center", marginBottom: 4 }}>
        <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700 }}>
          Đăng nhập
        </h1>
        <p
          style={{ margin: 0, color: "var(--color-text-muted)", fontSize: 14 }}
        >
          Chào mừng trở lại
        </p>
      </div>

      <div>
        <label
          style={{
            display: "block",
            marginBottom: 6,
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-text-secondary)",
          }}
        >
          Email
        </label>
        <input
          className="input"
          placeholder="Nhập email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
      </div>

      <div>
        <label
          style={{
            display: "block",
            marginBottom: 6,
            fontSize: 13,
            fontWeight: 600,
            color: "var(--color-text-secondary)",
          }}
        >
          Mật khẩu
        </label>
        <div style={{ position: "relative" }}>
          <input
            className="input"
            type={showPw ? "text" : "password"}
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            style={{
              position: "absolute",
              right: 14,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              padding: 0,
            }}
          >
            {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Captcha */}
      <div
        style={{
          background: "var(--color-bg-secondary)",
          borderRadius: 12,
          padding: 14,
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 13,
            color: "var(--color-text-secondary)",
          }}
        >
          Xác minh: nhập mã trong ảnh
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 8,
          }}
        >
          {captchaImg ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={`data:image/png;base64,${captchaImg}`}
              alt="Mã xác nhận"
              title="Bấm để đổi mã khác"
              onClick={refreshCaptcha}
              style={{
                height: 44,
                borderRadius: 8,
                cursor: "pointer",
                border: "1px solid var(--color-border)",
              }}
            />
          ) : (
            <div
              style={{
                height: 44,
                width: 170,
                borderRadius: 8,
                background: "rgba(0, 0, 0, 0.06)",
              }}
            />
          )}
          <button
            type="button"
            onClick={refreshCaptcha}
            title="Đổi mã khác"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              padding: 0,
            }}
          >
            <RefreshCw size={16} />
          </button>
        </div>
        <input
          className="input"
          style={{ height: 40 }}
          placeholder="Nhập mã xác nhận *"
          value={captchaCode}
          maxLength={5}
          autoComplete="off"
          onChange={(e) =>
            setCaptchaCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
          }
        />
      </div>

      <button
        className="btn-primary"
        type="submit"
        disabled={loading}
        style={{ width: "100%" }}
      >
        <LogIn size={18} />
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </button>

      <p
        style={{
          textAlign: "center",
          fontSize: 14,
          color: "var(--color-text-muted)",
          margin: 0,
        }}
      >
        Chưa có tài khoản?{" "}
        <Link
          href="/register"
          style={{ color: "var(--color-primary)", fontWeight: 600 }}
        >
          Đăng ký
        </Link>
      </p>
    </form>
  );
}
