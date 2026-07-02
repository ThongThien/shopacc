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
  const [thumb, setThumb] = useState("");
  const [srv, setSrv] = useState("");

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
    setThumb("");
    setSrv("");
  }

  async function handleSubmit() {
    const payload = {
      gameName,
      title,
      slug,
      description: desc,
      price,
      thumbnail: thumb,
      serverName: srv,
      isActive: true,
    };
    try {
      if (editId) {
        await apiFetch(`/api/services/${editId}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        notify("success", "Cập nhật dịch vụ");
      } else {
        await apiFetch("/api/services", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        notify("success", "Tạo dịch vụ mới");
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
                  color: "var(--muted)",
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
                  color: "var(--warning)",
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
                  color: "var(--muted)",
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
                  color: "var(--muted)",
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
                  color: "var(--muted)",
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
                  color: "var(--muted)",
                }}
              >
                Thumbnail URL
              </label>
              <input
                className="input"
                value={thumb}
                onChange={(e) => setThumb(e.target.value)}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 4,
                  fontWeight: 700,
                  fontSize: 13,
                  color: "var(--muted)",
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
                  color: "var(--muted)",
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
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: "4px 10px", fontSize: 12 }}
                          type="button"
                          onClick={() => {
                            setEditId(s.id);
                            setGameName(s.gameName);
                            setTitle(s.title);
                            setSlug(s.slug);
                            setPrice(s.price);
                            setDesc("");
                            setThumb("");
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
                            color: "var(--danger)",
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
