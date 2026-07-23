"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createAdminListing,
  getAdminCategories,
  updateAdminListing,
  updateAdminListingThumbnail,
  uploadListingImage,
} from "@/services/admin.service";
import { AdminListingPayload } from "@/types/admin";
import { Category } from "@/types/category";
import { ListingType } from "@/types/listing";
import { AdminListingDetail } from "@/types/admin-listing";
import { useNotify } from "@/components/shared/NotificationProvider";

interface Props {
  mode: "create" | "edit";
  listing?: AdminListingDetail;
}

const initialPayload: AdminListingPayload = {
  categoryId: 0,
  listingType: "ACCOUNT",
  gameName: "Ngọc Rồng Online",
  serverName: "",
  title: "",
  slug: "",
  description: "",
  price: 0,
  thumbnail: "",
  secretDataEncrypted: "",
};

const TYPE_DESCRIPTIONS: Record<string, string> = {
  ACCOUNT: "Bán tài khoản game. Khách mua sẽ nhận được thông tin đăng nhập.",
  ITEM: "Bán vật phẩm trong game. Không phải tài khoản.",
  SERVICE: "Cung cấp dịch vụ (cày thuê, săn đệ, up đệ...). Không phải mua bán acc.",
  RANDOM: "Acc ngẫu nhiên. Khách nhận acc ngẫu nhiên trong kho.",
};

export default function AdminListingForm({ mode, listing }: Props) {
  const router = useRouter();
  const { notify, confirmAction } = useNotify();

  const [categories, setCategories] = useState<Category[]>([]);
  const [payload, setPayload] = useState<AdminListingPayload>(initialPayload);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [existingGames, setExistingGames] = useState<string[]>([]);
  const [createNewGame, setCreateNewGame] = useState(false);

  useEffect(() => {
    void getAdminCategories()
      .then(setCategories)
      .catch(console.error);

    // Fetch existing game names from listings
    import("@/services/listing.service")
      .then((m) => m.getListings())
      .then((listings) => {
        const names = Array.from(
          new Set(listings.map((l) => l.gameName).filter(Boolean)),
        ) as string[];
        setExistingGames(names);
        // If current gameName is not in the list, switch to "Create New" mode
        if (mode === "edit" && listing?.gameName && !names.includes(listing.gameName)) {
          setCreateNewGame(true);
        }
      })
      .catch(() => {
        /* ignore */
      });
  }, []);

  useEffect(() => {
    if (!listing) return;

    setPayload({
      categoryId: listing.categoryId || 0,
      listingType: listing.listingType,
      gameName: listing.gameName,
      serverName: listing.serverName || "",
      title: listing.title,
      slug: listing.slug,
      description: listing.description || "",
      price: listing.price,
      thumbnail: listing.thumbnail || "",
      secretDataEncrypted: "",
    });
  }, [listing]);

  // Leaf categories: have parentId AND are not parents themselves
  const leafCategories = useMemo(() => {
    const parentIds = new Set(
      categories.filter((c) => c.parentId != null).map((c) => c.parentId),
    );
    return categories.filter(
      (c) => c.parentId != null && !parentIds.has(c.id),
    );
  }, [categories]);

  function updateField<K extends keyof AdminListingPayload>(
    key: K,
    value: AdminListingPayload[K],
  ) {
    setPayload((prev) => ({ ...prev, [key]: value }));
  }

  function autoSlug(title: string) {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function uploadThumbnailIfNeeded(listingId: number) {
    if (!thumbnailFile) return;
    try {
      const uploaded = await uploadListingImage(listingId, thumbnailFile);
      await updateAdminListingThumbnail(listingId, { thumbnail: uploaded.url });
    } catch {
      notify("warning", "Không upload được ảnh chính, bạn có thể cập nhật sau.");
    }
  }

  async function uploadGalleryIfNeeded(listingId: number) {
    if (galleryFiles.length === 0) return;
    for (const file of galleryFiles) {
      try {
        await uploadListingImage(listingId, file);
      } catch {
        notify("warning", `Không upload được ảnh: ${file.name}`);
      }
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const ok = await confirmAction(
      mode === "create" ? "Tạo sản phẩm mới?" : "Cập nhật sản phẩm này?",
    );

    if (!ok) return;

    try {
      setLoading(true);

      if (mode === "create") {
        const data = { ...payload };
        if (!data.secretDataEncrypted.trim()) {
          notify("error", "Thông tin tài khoản là bắt buộc");
          return;
        }
        const created = await createAdminListing(data);
        await uploadThumbnailIfNeeded(created.id);
        await uploadGalleryIfNeeded(created.id);
        notify("success", "Tạo sản phẩm thành công");
        router.push("/admin/listings");
        return;
      }

      if (mode === "edit") {
        if (!listing) return;
        await updateAdminListing(listing.id, payload);
        await uploadThumbnailIfNeeded(listing.id);
        await uploadGalleryIfNeeded(listing.id);
        notify("success", "Cập nhật sản phẩm thành công");
      }

      router.push("/admin/listings");
      router.refresh();
    } catch (error) {
      notify(
        "error",
        error instanceof Error ? error.message : "Lưu sản phẩm thất bại",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="card admin-form" onSubmit={handleSubmit}>
      <h1>{mode === "create" ? "Tạo sản phẩm" : "Sửa sản phẩm"}</h1>

      <div className="form-grid">
        {/* Listing Type */}
        <div>
          <label>Loại sản phẩm</label>
          <select
            className="input"
            value={payload.listingType}
            onChange={(e) =>
              updateField("listingType", e.target.value as ListingType)
            }
          >
            <option value="ACCOUNT">Tài khoản (Account)</option>
            <option value="ITEM">Vật phẩm (Item)</option>
            <option value="SERVICE">Dịch vụ (Service)</option>
            <option value="RANDOM">Ngẫu nhiên (Random)</option>
          </select>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--color-text-muted)" }}>
            {TYPE_DESCRIPTIONS[payload.listingType]}
          </p>
        </div>

        {/* Category (leaf only) */}
        <div>
          <label>Danh mục (chỉ chọn danh mục con)</label>
          <select
            className="input"
            value={payload.categoryId}
            onChange={(e) => updateField("categoryId", Number(e.target.value))}
          >
            <option value={0}>Chọn danh mục</option>
            {leafCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          {leafCategories.length === 0 && (
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--color-warning)" }}>
              Chưa có danh mục con. Vui lòng tạo danh mục con trước.
            </p>
          )}
        </div>

        {/* Game Name (dropdown + create new) */}
        <div>
          <label>Game</label>
          {!createNewGame && existingGames.length > 0 && (
            <div>
              <select
                className="input"
                value={payload.gameName}
                onChange={(e) => updateField("gameName", e.target.value)}
              >
                {existingGames.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn-secondary"
                style={{ marginTop: 6, fontSize: 12, padding: "5px 10px" }}
                onClick={() => setCreateNewGame(true)}
              >
                Tạo Game mới
              </button>
            </div>
          )}
          {(createNewGame || existingGames.length === 0) && (
            <div>
              <input
                className="input"
                value={payload.gameName}
                onChange={(e) => updateField("gameName", e.target.value)}
                placeholder="Nhập tên game mới..."
              />
              <div
                style={{
                  background: "#fef3c7",
                  border: "1px solid #f59e0b",
                  borderRadius: 8,
                  padding: "8px 12px",
                  marginTop: 6,
                  fontSize: 12,
                  color: "#92400e",
                  fontWeight: 700,
                }}
              >
                ⚠️ Game Name sẽ quyết định việc tạo một Kho Acc Game mới. Nếu nhập
                tên mới (hoặc sai chính tả), hệ thống sẽ tự động tạo thêm một kho
                mới ngoài ý muốn.
              </div>
              {existingGames.length > 0 && (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ marginTop: 6, fontSize: 12, padding: "5px 10px" }}
                  onClick={() => {
                    setCreateNewGame(false);
                    updateField("gameName", existingGames[0]);
                  }}
                >
                  ← Chọn game có sẵn
                </button>
              )}
            </div>
          )}
        </div>

        {/* Server */}
        <div>
          <label>
            {payload.listingType === "SERVICE"
              ? "Gói dịch vụ / Máy chủ"
              : "Máy chủ"}
          </label>
          <input
            className="input"
            value={payload.serverName}
            onChange={(e) => updateField("serverName", e.target.value)}
            placeholder={
              payload.listingType === "SERVICE" ? "Săn đệ / Up đệ" : "7"
            }
          />
        </div>

        {/* Title */}
        <div className="form-col-span-2">
          <label>Tiêu đề</label>
          <input
            className="input"
            value={payload.title}
            onChange={(e) => {
              updateField("title", e.target.value);
              if (mode === "create") {
                updateField("slug", autoSlug(e.target.value));
              }
            }}
          />
        </div>

        {/* Slug */}
        <div className="form-col-span-2">
          <label>Slug</label>
          <input
            className="input"
            value={payload.slug}
            onChange={(e) => updateField("slug", e.target.value)}
          />
        </div>

        {/* Price + Status */}
        <div>
          <label>Giá</label>
          <input
            className="input"
            type="number"
            value={payload.price}
            onChange={(e) => updateField("price", Number(e.target.value))}
          />
        </div>

        <div>
          <label>Trạng thái</label>
          <select
            className="input"
            value={payload.status || "PUBLISHED"}
            onChange={(e) =>
              updateField(
                "status" as keyof AdminListingPayload,
                e.target.value as never,
              )
            }
          >
            <option value="PUBLISHED">Đang bán</option>
            <option value="SOLD_OUT">Đã bán</option>
            <option value="DRAFT">Nháp</option>
          </select>
        </div>

        {/* Description */}
        <div className="form-col-span-2">
          <label>Mô tả</label>
          <textarea
            className="input textarea"
            value={payload.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>

        {/* Secret Data */}
        <div className="form-col-span-2">
          <label>
            Thông tin giao cho khách{" "}
            {mode === "edit" && "(để trống nếu không thay đổi)"}
          </label>
          <textarea
            className="input textarea"
            value={payload.secretDataEncrypted}
            onChange={(e) => updateField("secretDataEncrypted", e.target.value)}
            placeholder={
              payload.listingType === "SERVICE"
                ? "Liên hệ Zalo shop để cung cấp thông tin cần làm dịch vụ."
                : "Tài khoản: abc | Mật khẩu: 123456"
            }
          />
        </div>

        {/* Images */}
        <div>
          <label>Ảnh chính</label>
          <input
            className="input"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
          />
        </div>

        <div>
          <label>Ảnh phụ</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
            {galleryFiles.map((file, i) => (
              <div key={i} style={{ position: "relative", width: 80, height: 80, borderRadius: 10, overflow: "hidden", border: "1px solid var(--color-border)" }}>
                <img src={URL.createObjectURL(file)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <button type="button" onClick={() => setGalleryFiles((prev) => prev.filter((_, j) => j !== i))}
                  style={{ position: "absolute", top: 2, right: 2, width: 20, height: 20, borderRadius: "50%", background: "var(--color-danger)", color: "white", border: "none", cursor: "pointer", fontSize: 12, display: "grid", placeItems: "center", lineHeight: 1 }}>✕</button>
              </div>
            ))}
            <label style={{ width: 80, height: 80, borderRadius: 10, border: "2px dashed var(--color-border)", display: "grid", placeItems: "center", cursor: "pointer", color: "var(--color-text-muted)", fontSize: 24, transition: "border-color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--color-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--color-border)")}>
              +
              <input type="file" multiple accept="image/png,image/jpeg,image/webp,image/gif" style={{ display: "none" }}
                onChange={(e) => { if (e.target.files) setGalleryFiles((prev) => [...prev, ...Array.from(e.target.files!)]); }} />
            </label>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button
          className="btn-secondary"
          type="button"
          onClick={() => router.back()}
        >
          Quay lại
        </button>
        <button className="btn-primary" type="submit" disabled={loading}>
          {loading ? "Đang lưu..." : "Lưu sản phẩm"}
        </button>
      </div>
    </form>
  );
}
