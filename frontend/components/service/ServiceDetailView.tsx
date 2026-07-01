"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ListingDetail } from "@/types/listing";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/components/cart/CartContext";
import { useNotify } from "@/components/shared/NotificationProvider";
import Lightbox from "@/components/shared/Lightbox";

interface Props {
  listing: ListingDetail;
}

export default function ServiceDetailView({ listing }: Props) {
  const router = useRouter();
  const { notify } = useNotify();
  const { addItem, items } = useCart();

  const inCart = items.some((i) => i.listingId === listing.id);
  const images = listing.images || [];
  const mainImage = listing.thumbnail || images[0] || "/placeholder.png";
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  async function handleOrder() {
    if (!inCart) {
      try {
        await addItem({
          listingId: listing.id,
          title: listing.title || "",
          price: listing.price,
          thumbnail: listing.thumbnail,
          gameName: listing.gameName,
          serverName: listing.serverName,
        });
      } catch {
        /* ignore */
      }
    }
    router.push("/checkout");
  }

  return (
    <div style={{ display: "grid", gap: 24 }}>
      {/* Hero */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Image */}
        <div
          className="card"
          style={{
            padding: 0,
            overflow: "hidden",
            cursor: "pointer",
            height: 360,
          }}
          onClick={() => setLightboxIdx(0)}
        >
          <img
            src={mainImage}
            alt={listing.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Info */}
        <div className="card" style={{ padding: 24, display: "grid", gap: 14, alignContent: "start" }}>
          <div>
            <span
              style={{
                background: "#f3e8ff",
                color: "#6b21a8",
                padding: "4px 12px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              Dịch vụ
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: 26 }}>{listing.title}</h1>
          <p style={{ margin: 0, color: "var(--muted)", lineHeight: 1.6 }}>
            {listing.description || "Chưa có mô tả"}
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <b style={{ fontSize: 32, color: "var(--accent)", fontWeight: 900 }}>
              {formatCurrency(listing.price)}
            </b>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <span style={{ background: "var(--surface-soft)", padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
              ⏱ {listing.serverName || "1-24h"}
            </span>
            <span style={{ background: "#dcfce7", color: "#166534", padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 700 }}>
              ✅ Bảo hành 7 ngày
            </span>
          </div>
          <button
            className="btn-primary"
            type="button"
            style={{ width: "100%", padding: "16px", fontSize: 17, marginTop: 8 }}
            disabled={inCart}
            onClick={handleOrder}
          >
            {inCart ? "Đã thêm vào giỏ" : "Đặt dịch vụ ngay"}
          </button>
        </div>
      </div>

      {/* Features + Requirements + Instructions + FAQ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ marginTop: 0 }}>Tính năng nổi bật</h2>
          <ul style={{ display: "grid", gap: 8, paddingLeft: 20 }}>
            <li>Tự động 24/7</li>
            <li>Không sử dụng phần mềm thứ ba</li>
            <li>An toàn, bảo mật tuyệt đối</li>
            <li>Uy tín — đã phục vụ 1000+ khách hàng</li>
            <li>Hỗ trợ 24/7 qua ticket</li>
          </ul>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ marginTop: 0 }}>Yêu cầu</h2>
          <ul style={{ display: "grid", gap: 8, paddingLeft: 20 }}>
            <li>Chuẩn bị tài khoản game sẵn sàng</li>
            <li>Đủ ngọc / vàng theo yêu cầu dịch vụ</li>
            <li>Tài khoản không bị khóa / hạn chế</li>
            <li>Điền đúng thông tin server, hành tinh</li>
          </ul>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ marginTop: 0 }}>Hướng dẫn</h2>
          <ol style={{ display: "grid", gap: 8, paddingLeft: 20 }}>
            <li>Thêm dịch vụ vào giỏ hàng</li>
            <li>Vào trang thanh toán, nhập thông tin tài khoản cần làm dịch vụ</li>
            <li>Thanh toán qua số dư</li>
            <li>Đợi admin xử lý (thời gian tùy dịch vụ)</li>
            <li>Kiểm tra kết quả trong lịch sử mua</li>
          </ol>
        </div>

        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ marginTop: 0 }}>FAQ</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {[
              { q: "Bao lâu hoàn thành?", a: "Tùy dịch vụ, thường từ 1-24h. Thông tin chi tiết có trong mô tả dịch vụ." },
              { q: "Có bảo hành không?", a: "Có bảo hành 7 ngày. Nếu có vấn đề, tạo ticket hỗ trợ." },
              { q: "Có an toàn không?", a: "Tuyệt đối an toàn. Chúng tôi không dùng phần mềm thứ ba." },
              { q: "Cần chuẩn bị gì?", a: "Chỉ cần tài khoản game và đủ ngọc/vàng theo yêu cầu." },
            ].map((faq, i) => (
              <div key={i}>
                <b style={{ fontSize: 14 }}>{faq.q}</b>
                <p style={{ margin: "2px 0 0", color: "var(--muted)", fontSize: 13 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIdx != null && (
        <Lightbox
          images={images.length > 0 ? images : [mainImage]}
          currentIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onPrev={() => setLightboxIdx((i) => (i != null ? (i - 1 + images.length) % images.length : 0))}
          onNext={() => setLightboxIdx((i) => (i != null ? (i + 1) % images.length : 0))}
        />
      )}
    </div>
  );
}
