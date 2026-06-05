"use client";

import { ListingDetail } from "@/types/listing";
import { formatCurrency } from "@/lib/format";

interface Props {
  listing: ListingDetail;
  currentBalance: number;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function PurchaseConfirmModal({
  listing,
  currentBalance,
  open,
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  const remaining = currentBalance - listing.price;
  const canBuy = remaining >= 0;

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <h2>Xác nhận mua acc</h2>

        <div className="purchase-preview">
          <img
            src={listing.thumbnail || "/placeholder.png"}
            alt={listing.title}
          />

          <div>
            <h3>{listing.title}</h3>
            <p>
              {listing.gameName} · Server {listing.serverName || "Không có"}
            </p>
          </div>
        </div>

        <div className="modal-info">
          <p>
            <b>Giá acc:</b> {formatCurrency(listing.price)}
          </p>

          <p>
            <b>Số dư hiện tại:</b> {formatCurrency(currentBalance)}
          </p>

          <p>
            <b>Số dư sau khi mua:</b>{" "}
            <span className={canBuy ? "text-success" : "text-danger"}>
              {formatCurrency(Math.max(remaining, 0))}
            </span>
          </p>
        </div>

        {!canBuy && (
          <div className="danger-box">
            Số dư không đủ để mua acc này. Vui lòng nạp thêm tiền.
          </div>
        )}

        <div className="modal-actions">
          <button className="btn-secondary" type="button" onClick={onClose}>
            Hủy
          </button>

          <button
            className="btn-primary"
            type="button"
            disabled={!canBuy}
            onClick={onConfirm}
          >
            Xác nhận mua
          </button>
        </div>
      </div>
    </div>
  );
}
