"use client";

import { useEffect, useState } from "react";
import { DiscountCode } from "@/types/discount";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { useNotify } from "@/components/shared/NotificationProvider";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import { apiFetch } from "@/lib/api";

function discountLabel(d: DiscountCode) {
  if (d.type === "PERCENT") return `Giảm ${d.value}%`;
  return `Giảm ${formatCurrency(d.value)}`;
}

export default function AdminDiscounts() {
  const { notify, confirmAction } = useNotify();
  const [discounts, setDiscounts] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENT" | "FIXED">("PERCENT");
  const [value, setValue] = useState(5);
  const [minOrder, setMinOrder] = useState(0);
  const [maxUsage, setMaxUsage] = useState<number | string>("");

  async function load() {
    setLoading(true);
    try {
      const data = await apiFetch<DiscountCode[]>("/api/admin/discounts");
      setDiscounts(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load().catch(console.error);
  }, []);

  function resetForm() {
    setCode("");
    setType("PERCENT");
    setValue(5);
    setMinOrder(0);
    setMaxUsage("");
    setEditId(null);
    setShowForm(false);
  }

  async function handleSubmit() {
    const payload = {
      code,
      type,
      value,
      minOrderAmount: minOrder > 0 ? minOrder : null,
      maxUsage: maxUsage !== "" ? Number(maxUsage) : null,
      isActive: true,
    };

    try {
      if (editId) {
        await apiFetch(`/api/admin/discounts/${editId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        notify("success", "Đã cập nhật mã giảm giá");
      } else {
        await apiFetch("/api/admin/discounts", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        notify("success", "Đã tạo mã giảm giá");
      }

      resetForm();
      await load();
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Thất bại");
    }
  }

  async function handleToggle(id: number, current: boolean) {
    const ok = await confirmAction(
      current ? "Tắt mã giảm giá này?" : "Bật mã giảm giá này?",
    );
    if (!ok) return;

    await apiFetch(`/api/admin/discounts/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ isActive: !current }),
    });
    await load();
    notify("success", current ? "Đã tắt mã" : "Đã bật mã");
  }

  async function handleDelete(id: number) {
    const ok = await confirmAction("Xóa mã giảm giá này?");
    if (!ok) return;

    await apiFetch(`/api/admin/discounts/${id}`, { method: "DELETE" });
    await load();
    notify("success", "Đã xóa mã giảm giá");
  }

  function openEdit(d: DiscountCode) {
    setEditId(d.id);
    setCode(d.code);
    setType(d.type);
    setValue(d.value);
    setMinOrder(d.minOrderAmount || 0);
    setMaxUsage(d.maxUsage || "");
    setShowForm(true);
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Mã giảm giá</h1>
          <p>Tạo và quản lý mã giảm giá cho khách hàng.</p>
        </div>
        <button
          className="btn-primary"
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          Tạo mã mới
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h2 style={{ marginTop: 0 }}>
            {editId ? "Sửa mã giảm giá" : "Tạo mã giảm giá"}
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 700, fontSize: 13, color: "var(--color-text-muted)" }}>
                Mã code
              </label>
              <input
                className="input"
                placeholder="VD: SUMMER2026"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 700, fontSize: 13, color: "var(--color-text-muted)" }}>
                Loại
              </label>
              <select className="input" value={type} onChange={(e) => setType(e.target.value as "PERCENT" | "FIXED")}>
                <option value="PERCENT">Phần trăm (%)</option>
                <option value="FIXED">Số tiền cố định</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 700, fontSize: 13, color: "var(--color-text-muted)" }}>
                Giá trị
              </label>
              <input
                className="input"
                type="number"
                min={0}
                placeholder={type === "PERCENT" ? "VD: 5" : "VD: 10000"}
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 700, fontSize: 13, color: "var(--color-text-muted)" }}>
                Đơn tối thiểu (để trống = không giới hạn)
              </label>
              <input
                className="input"
                type="number"
                min={0}
                value={minOrder}
                onChange={(e) => setMinOrder(Number(e.target.value))}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4, fontWeight: 700, fontSize: 13, color: "var(--color-text-muted)" }}>
                Số lần dùng tối đa (để trống = không giới hạn)
              </label>
              <input
                className="input"
                type="number"
                min={0}
                value={maxUsage}
                onChange={(e) => setMaxUsage(e.target.value)}
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 14 }}>
            <button className="btn-secondary" type="button" onClick={resetForm}>
              Hủy
            </button>
            <button
              className="btn-primary"
              type="button"
              disabled={!code.trim() || value <= 0}
              onClick={handleSubmit}
            >
              {editId ? "Cập nhật" : "Tạo"}
            </button>
          </div>
        </div>
      )}

      <div className="card table-card">
        {loading ? (
          <LoadingSpinner text="Đang tải..." />
        ) : (
          <div className="responsive-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Giảm</th>
                  <th>Đơn tối thiểu</th>
                  <th>Đã dùng / Giới hạn</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontFamily: "monospace", fontWeight: 700 }}>
                      {d.code}
                    </td>
                    <td>{discountLabel(d)}</td>
                    <td>
                      {d.minOrderAmount ? formatCurrency(d.minOrderAmount) : "-"}
                    </td>
                    <td>
                      {d.usedCount}
                      {d.maxUsage ? ` / ${d.maxUsage}` : ""}
                    </td>
                    <td>
                      <span
                        style={{
                          padding: "3px 8px",
                          borderRadius: 999,
                          background: d.isActive ? "#dcfce7" : "#f3f4f6",
                          color: d.isActive ? "#166534" : "#6b7280",
                          fontWeight: 800,
                          fontSize: 12,
                        }}
                      >
                        {d.isActive ? "Hoạt động" : "Tắt"}
                      </span>
                    </td>
                    <td>{d.createdAt ? formatDateTime(d.createdAt) : "-"}</td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: "4px 10px", fontSize: 12 }}
                          type="button"
                          onClick={() => openEdit(d)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn-secondary"
                          style={{ padding: "4px 10px", fontSize: 12 }}
                          type="button"
                          onClick={() => handleToggle(d.id, d.isActive)}
                        >
                          {d.isActive ? "Tắt" : "Bật"}
                        </button>
                        <button
                          className="btn-secondary"
                          style={{
                            padding: "4px 10px",
                            fontSize: 12,
                            color: "var(--color-danger)",
                          }}
                          type="button"
                          onClick={() => handleDelete(d.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
