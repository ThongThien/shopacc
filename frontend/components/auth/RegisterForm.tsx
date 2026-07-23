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
  const [termsOpen, setTermsOpen] = useState<"terms" | "privacy" | null>(null);

  function pwStrength(pw: string) {
    if (pw.length < 6)
      return { label: "Yếu", color: "var(--color-danger)", w: "25%" };
    if (pw.length < 8)
      return { label: "Trung bình", color: "var(--color-warning)", w: "50%" };
    if (/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(pw))
      return { label: "Mạnh", color: "var(--color-price)", w: "100%" };
    return { label: "Khá", color: "var(--color-primary)", w: "75%" };
  }
  const strength = password ? pwStrength(password) : null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!username.trim()) {
      notify("error", "Vui lòng nhập tên đăng nhập");
      return;
    }
    if (username.trim().length < 3) {
      notify("error", "Tên đăng nhập tối thiểu 3 ký tự");
      return;
    }
    if (!email.trim()) {
      notify("error", "Vui lòng nhập email");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      notify("error", "Email không hợp lệ");
      return;
    }
    if (!password) {
      notify("error", "Vui lòng nhập mật khẩu");
      return;
    }
    if (password.length < 6) {
      notify("error", "Mật khẩu tối thiểu 6 ký tự");
      return;
    }
    if (password !== confirmPassword) {
      notify("error", "Mật khẩu xác nhận không khớp");
      return;
    }
    if (!agreed) {
      notify("error", "Vui lòng đồng ý với điều khoản");
      return;
    }

    try {
      setLoading(true);
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      notify("success", "Đăng ký thành công!");
      router.push("/login");
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="auth-card card">
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <h1 style={{ margin: "0 0 4px", fontSize: 24, fontWeight: 700 }}>
            Đăng ký
          </h1>
          <p
            style={{
              margin: 0,
              color: "var(--color-text-muted)",
              fontSize: 14,
            }}
          >
            Tạo tài khoản để bắt đầu
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
            Tên đăng nhập
          </label>
          <input
            className="input"
            placeholder="Tối thiểu 3 ký tự"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
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
            Email
          </label>
          <input
            className="input"
            type="email"
            placeholder="email@example.com"
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
              placeholder="Tối thiểu 6 ký tự"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
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
          {strength && (
            <div style={{ marginTop: 6 }}>
              <div
                style={{
                  height: 4,
                  borderRadius: 2,
                  background: "var(--color-bg-hover)",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: strength.w,
                    background: strength.color,
                    borderRadius: 2,
                    transition: "width 0.2s",
                  }}
                />
              </div>
              <span
                style={{ fontSize: 11, color: strength.color, fontWeight: 600 }}
              >
                {strength.label}
              </span>
            </div>
          )}
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
            Xác nhận mật khẩu
          </label>
          <input
            className="input"
            type="password"
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--color-text-muted)",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            style={{ accentColor: "var(--color-primary)" }}
          />
          Tôi đồng ý với{" "}
          <button
            type="button"
            onClick={() => setTermsOpen("terms")}
            style={{
              color: "var(--color-primary)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Điều khoản
          </button>{" "}
          và{" "}
          <button
            type="button"
            onClick={() => setTermsOpen("privacy")}
            style={{
              color: "var(--color-primary)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Chính sách bảo mật
          </button>
        </label>

        <button
          className="btn-primary"
          type="submit"
          disabled={loading}
          style={{ width: "100%" }}
        >
          <UserPlus size={18} />
          {loading ? "Đang đăng ký..." : "Tạo tài khoản"}
        </button>

        <p
          style={{
            textAlign: "center",
            fontSize: 14,
            color: "var(--color-text-muted)",
            margin: 0,
          }}
        >
          Đã có tài khoản?{" "}
          <Link
            href="/login"
            style={{ color: "var(--color-primary)", fontWeight: 600 }}
          >
            Đăng nhập
          </Link>
        </p>
      </form>

      {/* Terms / Privacy Modal */}
      {termsOpen && (
        <div className="modal-overlay" onClick={() => setTermsOpen(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2>
              {termsOpen === "terms"
                ? "Điều khoản sử dụng"
                : "Chính sách bảo mật"}
            </h2>
            {termsOpen === "terms" ? (
              <div
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                <p>Bằng cách đăng ký tài khoản tại Shopacc, bạn đồng ý:</p>
                <ul style={{ paddingLeft: 20 }}>
                  <li>Cung cấp thông tin chính xác khi đăng ký.</li>
                  <li>Không sử dụng tài khoản cho mục đích gian lận, spam.</li>
                  <li>
                    Shopacc có quyền khóa tài khoản nếu phát hiện vi phạm.
                  </li>
                  <li>
                    Mọi giao dịch nạp tiền là cuối cùng và không hoàn lại.
                  </li>
                  <li>
                    Sau khi mua acc, bạn có trách nhiệm đổi mật khẩu ngay.
                  </li>
                </ul>
              </div>
            ) : (
              <div
                style={{
                  color: "var(--color-text-secondary)",
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                <p>Shopacc cam kết:</p>
                <ul style={{ paddingLeft: 20 }}>
                  <li>Không chia sẻ email, mật khẩu của bạn cho bên thứ ba.</li>
                  <li>Mật khẩu được mã hóa một chiều - không ai đọc được.</li>
                  <li>Bạn có thể yêu cầu xóa tài khoản bất kỳ lúc nào.</li>
                </ul>
              </div>
            )}
            <div className="modal-actions">
              <button
                className="btn-primary"
                type="button"
                onClick={() => setTermsOpen(null)}
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
