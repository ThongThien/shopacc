"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import { useNotify } from "@/components/shared/NotificationProvider";
import { showLoading, hideLoading } from "@/components/shared/LoadingOverlay";
import { getAccessToken } from "@/lib/auth";

interface ServiceItem {
  id: number;
  gameName: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  serverName?: string;
}

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export default function ServiceOrderView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { notify } = useNotify();

  const [svc, setSvc] = useState<ServiceItem | null>(null);
  const [accountName, setAccountName] = useState("");
  const [password, setPassword] = useState("");
  const [server, setServer] = useState("");
  const [note, setNote] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/services/${id}`)
      .then((r) => r.json())
      .then(setSvc)
      .catch(() => notify("error", "Không tải được dịch vụ"));
  }, [id]);

  async function handleOrder() {
    const token = getAccessToken();
    if (!token) {
      notify("error", "Vui lòng đăng nhập để đặt dịch vụ");
      router.push("/login");
      return;
    }

    if (!accountName.trim() || !password.trim()) {
      notify("error", "Vui lòng nhập tên tài khoản và mật khẩu game");
      return;
    }

    showLoading("Đang xử lý...");
    try {
      const res = await fetch(`${API}/api/services/${id}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ accountName, password, server, note }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: "Lỗi" }));
        throw new Error(err.message || "Đặt dịch vụ thất bại");
      }

      window.dispatchEvent(new Event("balance-changed"));
      notify("success", "Đặt dịch vụ thành công! Admin sẽ xử lý trong thời gian sớm nhất.");
      router.push("/me/service-orders");
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Thất bại");
    } finally {
      hideLoading();
    }
  }

  if (!svc) return <div className="page-container"><p>Đang tải...</p></div>;

  return (
    <div className="page-container" style={{ maxWidth: 900 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="card" style={{ padding: 0, overflow: "hidden", height: 320 }}>
          {svc.thumbnail ? (
            <img src={svc.thumbnail} alt={svc.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "grid", placeItems: "center", fontSize: 64, background: "#faf5ff" }}>🔧</div>
          )}
        </div>
        <div className="card" style={{ padding: 24 }}>
          <span style={{ background: "#f3e8ff", color: "#6b21a8", padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 800 }}>
            Dịch vụ · {svc.gameName}
          </span>
          <h1 style={{ margin: "10px 0", fontSize: 24 }}>{svc.title}</h1>
          <p style={{ color: "var(--color-text-muted)", lineHeight: 1.6 }}>{svc.description || "Chưa có mô tả"}</p>
          <b style={{ fontSize: 28, color: "var(--color-primary)", display: "block", margin: "12px 0" }}>{formatCurrency(svc.price)}</b>
          {svc.serverName && <span style={{ background: "var(--color-bg-secondary)", padding: "6px 12px", borderRadius: 8, fontSize: 13 }}>⏱ {svc.serverName}</span>}

          {!showForm ? (
            <button className="btn-primary" type="button" style={{ width: "100%", marginTop: 16, padding: 14, fontSize: 16 }}
              onClick={() => setShowForm(true)}>
              Đặt dịch vụ ngay
            </button>
          ) : (
            <div className="card" style={{ padding: 14, marginTop: 14, background: "var(--color-bg-secondary)" }}>
              <h4 style={{ margin: "0 0 8px" }}>Thông tin tài khoản</h4>
              <p style={{ fontSize: 12, color: "var(--color-text-muted)", marginBottom: 10 }}>Mã hóa AES-256, chỉ admin xem được</p>
              <div style={{ display: "grid", gap: 8 }}>
                <input className="input" placeholder="Tên tài khoản game *" value={accountName} onChange={(e) => setAccountName(e.target.value)} />
                <input className="input" type="password" placeholder="Mật khẩu *" value={password} onChange={(e) => setPassword(e.target.value)} />
                <input className="input" placeholder="Máy chủ / Hành tinh" value={server} onChange={(e) => setServer(e.target.value)} />
                <textarea className="input" style={{ minHeight: 50 }} placeholder="Ghi chú thêm..." value={note} onChange={(e) => setNote(e.target.value)} />
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-secondary" type="button" onClick={() => setShowForm(false)}>Hủy</button>
                  <button className="btn-primary" type="button" onClick={handleOrder} style={{ flex: 1 }}>Xác nhận đặt ({formatCurrency(svc.price)})</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
