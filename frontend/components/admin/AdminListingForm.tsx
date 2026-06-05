"use client";

import { useEffect, useState } from "react";
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

export default function AdminListingForm({ mode, listing }: Props) {
  const router = useRouter();
  const { notify, confirmAction } = useNotify();

  const [categories, setCategories] = useState<Category[]>([]);
  const [payload, setPayload] = useState<AdminListingPayload>(initialPayload);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void getAdminCategories().then(setCategories).catch(console.error);
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
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function uploadThumbnailIfNeeded(listingId: number) {
    if (!thumbnailFile) return;

    const uploaded = await uploadListingImage(listingId, thumbnailFile);

    await updateAdminListingThumbnail(listingId, {
      thumbnail: uploaded.url,
    });
  }

  async function uploadGalleryIfNeeded(listingId: number) {
    if (!galleryFile) return;

    await uploadListingImage(listingId, galleryFile);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const ok = await confirmAction(
      mode === "create" ? "Tạo listing mới?" : "Cập nhật listing này?",
      mode === "create" ? "Tạo listing" : "Cập nhật listing",
    );

    if (!ok) return;

    try {
      setLoading(true);

      if (mode === "create") {
        if (!payload.secretDataEncrypted.trim()) {
          notify("error", "Secret data là bắt buộc khi tạo listing");
          return;
        }

        const created = await createAdminListing(payload);

        await uploadThumbnailIfNeeded(created.id);
        await uploadGalleryIfNeeded(created.id);

        notify("success", "Tạo listing thành công");
      }

      if (mode === "edit") {
        if (!listing) return;

        await updateAdminListing(listing.id, payload);

        await uploadThumbnailIfNeeded(listing.id);
        await uploadGalleryIfNeeded(listing.id);

        notify("success", "Cập nhật listing thành công");
      }

      router.push("/admin/listings");
      router.refresh();
    } catch (error) {
      notify("error", error instanceof Error ? error.message : "Lưu thất bại");
    } finally {
      setLoading(false);
    }
  }

  const isService = payload.listingType === "SERVICE";

  return (
    <form className="card admin-form" onSubmit={handleSubmit}>
      <h1>{mode === "create" ? "Tạo listing" : "Sửa listing"}</h1>

      <div className="form-grid">
        <div>
          <label>Loại listing</label>
          <select
            className="input"
            value={payload.listingType}
            onChange={(e) =>
              updateField("listingType", e.target.value as ListingType)
            }
          >
            <option value="ACCOUNT">Tài khoản</option>
            <option value="SERVICE">Dịch vụ</option>
            <option value="ITEM">Vật phẩm</option>
            <option value="RANDOM">Random</option>
          </select>
        </div>

        <div>
          <label>Danh mục</label>
          <select
            className="input"
            value={payload.categoryId}
            onChange={(e) => updateField("categoryId", Number(e.target.value))}
          >
            <option value={0}>Chọn danh mục</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Game</label>
          <input
            className="input"
            value={payload.gameName}
            onChange={(e) => updateField("gameName", e.target.value)}
            placeholder="Ngọc Rồng Online"
          />
        </div>

        <div>
          <label>{isService ? "Gói dịch vụ / Server" : "Server"}</label>
          <input
            className="input"
            value={payload.serverName}
            onChange={(e) => updateField("serverName", e.target.value)}
            placeholder={isService ? "Săn đệ / Up đệ / Nhiệm vụ" : "7"}
          />
        </div>

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

        <div className="form-col-span-2">
          <label>Slug</label>
          <input
            className="input"
            value={payload.slug}
            onChange={(e) => updateField("slug", e.target.value)}
          />
        </div>

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

        <div className="form-col-span-2">
          <label>Mô tả</label>
          <textarea
            className="input textarea"
            value={payload.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>

        <div className="form-col-span-2">
          <label>
            Secret data {mode === "edit" && "(để trống nếu không đổi)"}
          </label>
          <textarea
            className="input textarea"
            value={payload.secretDataEncrypted}
            onChange={(e) => updateField("secretDataEncrypted", e.target.value)}
            placeholder={
              isService
                ? "Ví dụ: Sau khi mua, inbox Zalo shop để cung cấp thông tin acc cần làm dịch vụ."
                : "TK: abc | MK: 123456"
            }
          />
        </div>

        <div>
          <label>Upload thumbnail</label>
          <input
            className="input"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
          />
        </div>

        <div>
          <label>Upload ảnh phụ</label>
          <input
            className="input"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => setGalleryFile(e.target.files?.[0] || null)}
          />
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
          {loading ? "Đang lưu..." : "Lưu listing"}
        </button>
      </div>
    </form>
  );
}
