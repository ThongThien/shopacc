"use client";

import { useEffect, useState } from "react";
import { getOrderDetail, getOrderSecret } from "@/services/order.service";
import { Order } from "@/types/order";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useNotify } from "@/components/shared/NotificationProvider";
import NoticeBox from "@/components/layout/NoticeBox";

interface Props {
  orderId: number;
}

export default function OrderDetailView({ orderId }: Props) {
  const { notify } = useNotify();

  const [order, setOrder] = useState<Order | null>(null);
  const [loadingSecret, setLoadingSecret] = useState(false);
  const [secret, setSecret] = useState("");
  const [secretVisible, setSecretVisible] = useState(false);
  useEffect(() => {
    async function fetchOrder() {
      try {
        const data = await getOrderDetail(orderId);
        setOrder(data);
      } catch (error) {
        console.error(error);
        notify("error", "Không tải được chi tiết đơn hàng");
      }
    }

    void fetchOrder();
  }, [orderId, notify]);

  async function handleViewSecret() {
    try {
      setLoadingSecret(true);

      const response = await getOrderSecret(orderId);

      setSecret(response.secretData);
      setSecretVisible(true);

      notify("success", "Đã tải thông tin acc đã mua");
    } catch (error) {
      notify(
        "error",
        error instanceof Error ? error.message : "Không xem được thông tin acc",
      );
    } finally {
      setLoadingSecret(false);
    }
  }
  async function handleCopySecret() {
    if (!secret) return;

    await navigator.clipboard.writeText(secret);
    notify("success", "Đã copy thông tin acc");
  }

  if (!order) {
    return <p>Đang tải đơn hàng...</p>;
  }

  const firstItem = order.items?.[0];

  return (
    <section>
      <NoticeBox type="orders" />

      <div className="order-detail-layout">
        <div className="card order-detail-card">
          <h1>Chi tiết đơn hàng</h1>

          <div className="detail-info-list">
            <p>
              <b>Mã đơn:</b> {order.orderCode}
            </p>
            <p>
              <b>Ngày mua:</b> {formatDateTime(order.createdAt)}
            </p>
            <p>
              <b>Trạng thái:</b> {order.status}
            </p>
            <p>
              <b>Thanh toán:</b> {order.paymentStatus}
            </p>
            <p>
              <b>Tổng tiền:</b> {formatCurrency(order.totalPrice)}
            </p>
          </div>

          {firstItem && (
            <div className="purchase-preview">
              <img
                src={firstItem.listingThumbnail || "/placeholder.png"}
                alt={firstItem.listingTitle}
              />

              <div>
                <h3>{firstItem.listingTitle}</h3>
                <p>{formatCurrency(firstItem.price)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="card order-detail-card">
          <h2>Thông tin acc</h2>

          {!secretVisible ? (
            <div className="secret-locked-box">
              <p className="muted-text">
                Thông tin tài khoản được mã hóa. Bấm xem để giải mã thông tin
                acc đã mua.
              </p>

              <button
                className="btn-primary"
                type="button"
                onClick={handleViewSecret}
                disabled={loadingSecret}
              >
                {loadingSecret ? "Đang tải..." : "Xem thông tin tài khoản"}
              </button>
            </div>
          ) : (
            <>
              <pre className="secret-content">{secret}</pre>

              <button
                className="btn-secondary"
                type="button"
                onClick={handleCopySecret}
              >
                Copy tài khoản
              </button>

              <div
                style={{
                  marginTop: 14,
                  padding: "10px 14px",
                  background: "#fef3c7",
                  border: "1px solid #f59e0b",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "#92400e",
                  fontWeight: 700,
                }}
              >
                ⚠️ Sau khi nhận acc, hãy vào trang chủ game (ngocrongonline.com) để đổi mật khẩu ngay để bảo vệ tài khoản của bạn.
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
