"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useNotify } from "@/components/shared/NotificationProvider";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

interface Svc {
  id: number;
  gameName: string;
  title: string;
  slug: string;
  price: number;
  serverName?: string;
  isActive: boolean;
}

export default function AdminServices() {
  const { notify, confirmAction } = useNotify();
  const [services, setServices] = useState<Svc[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [gameName, setGameName] = useState("");
  const [games, setGames] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [price, setPrice] = useState(0);
  const [desc, setDesc] = useState("");
  const [srv, setSrv] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);

  async function load() {
    setLoading(true);
    try {
      const [svcs, gms] = await Promise.all([
        apiFetch<Svc[]>("/api/services"),
        apiFetch<string[]>("/api/services/games"),
      ]);
      setServices(svcs);
      setGames(gms);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load().catch(console.error);
  }, []);

  function resetForm() {
    setShowForm(false);
    setEditId(null);
    setGameName("");
    setTitle("");
    setSlug("");
    setPrice(0);
    setDesc("");
    setSrv("");
    setThumbnailFile(null);
  }

  async function handleSubmit() {
    const payload = {
      gameName,
      title,
      slug,
      description: desc,
      price,
      serverName: srv,
      isActive: true,
    };
    try {
      let svcId = editId;
      if (editId) {
        await apiFetch(`/api/services/${editId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        notify("success", "Cập nhật dịch vụ");
      } else {
        const created = await apiFetch<{ id: number }>("/api/services", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        svcId = created.id;
        notify("success", "Tạo dịch vụ mới");
      }

      // Upload thumbnail if file selected
      if (thumbnailFile && svcId) {
        const formData = new FormData();
        formData.append("file", thumbnailFile);
        await fetch(`${window.location.origin}/api/services/${svcId}/upload-image`, {
          method: "POST",
          body: formData,
          headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
        });
      }

      resetForm();
      await load();
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Thất bại");
    }
  }

  async function handleDelete(id: number) {
    if (!(await confirmAction("Xóa dịch vụ này?"))) return;
    await apiFetch(`/api/services/${id}`, { method: "DELETE" });
    notify("success", "Đã xóa");
    await load();
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Quản lý Dịch vụ</h1>
          <p>Tạo và quản lý các dịch vụ game.</p>
        </div>
        <button
          className="btn-primary"
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          Tạo dịch vụ
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h2 style={{ marginTop: 0 }}>{editId ? "Sửa" : "Tạo"} dịch vụ</h2>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 4,
                  fontWeight: 700,
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                }}
              >
                Game
              </label>
              {games.length > 0 ? (
                <select
                  className="input"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                >
                  <option value="">Chọn game</option>
                  {games.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  className="input"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  placeholder="Nhập tên game"
                />
              )}
              <p
                style={{
                  fontSize: 11,
                  color: "var(--color-warning)",
                  margin: "4px 0 0",
                }}
              >
                ⚠️ Nếu nhập game mới, sẽ tạo thêm 1 nhóm dịch vụ mới.
              </p>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 4,
                  fontWeight: 700,
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                }}
              >
                Tiêu đề
              </label>
              <input
                className="input"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 4,
                  fontWeight: 700,
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                }}
              >
                Slug
              </label>
              <input
                className="input"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 4,
                  fontWeight: 700,
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                }}
              >
                Giá
              </label>
              <input
                className="input"
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 4,
                  fontWeight: 700,
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                }}
              >
                Ảnh thumbnail
              </label>
              <input
                className="input"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 4,
                  fontWeight: 700,
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                }}
              >
                Thời gian / Server
              </label>
              <input
                className="input"
                value={srv}
                onChange={(e) => setSrv(e.target.value)}
                placeholder="VD: 1-24h"
              />
            </div>
            <div className="form-col-span-2">
              <label
                style={{
                  display: "block",
                  marginBottom: 4,
                  fontWeight: 700,
                  fontSize: 13,
                  color: "var(--color-text-muted)",
                }}
              >
                Mô tả
              </label>
              <textarea
                className="input"
                style={{ minHeight: 60 }}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "flex-end",
              marginTop: 14,
            }}
          >
            <button className="btn-secondary" type="button" onClick={resetForm}>
              Hủy
            </button>
            <button
              className="btn-primary"
              type="button"
              disabled={!gameName || !title}
              onClick={handleSubmit}
            >
              {editId ? "Cập nhật" : "Tạo"}
            </button>
          </div>
        </div>
      )}

      <div className="admin-summary-row">
        <span>Tổng dịch vụ: {services.length}</span>
        <span>Đang hoạt động: {services.filter((s) => s.isActive).length}</span>
        <span>Đã tắt: {services.filter((s) => !s.isActive).length}</span>
      </div>
      <div className="card table-card">
        {loading ? (
          <LoadingSpinner text="Đang tải..." />
        ) : (
          <div className="responsive-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Game</th>
                  <th>Tiêu đề</th>
                  <th>Giá</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id}>
                    <td>#{s.id}</td>
                    <td>{s.gameName}</td>
                    <td>{s.title}</td>
                    <td>{formatCurrency(s.price)}</td>

                    <td>
                      <div style={{ display: "flex", gap: 6, whiteSpace: "nowrap" }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: "4px 10px", fontSize: 12, height: 30, color: "var(--color-primary)", borderColor: "var(--color-primary)" }}
                          type="button"
                          onClick={() => {
                            setEditId(s.id);
                            setGameName(s.gameName);
                            setTitle(s.title);
                            setSlug(s.slug);
                            setPrice(s.price);
                            setDesc("");
                            setThumbnailFile(null);
                            setSrv(s.serverName || "");
                            setShowForm(true);
                          }}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn-secondary"
                          style={{
                            padding: "4px 10px",
                            fontSize: 12,
                            color: "var(--color-danger)",
                          }}
                          type="button"
                          onClick={() => handleDelete(s.id)}
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
