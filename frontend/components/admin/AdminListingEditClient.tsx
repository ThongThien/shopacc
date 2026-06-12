"use client";

import { useEffect, useState } from "react";
import AdminListingForm from "@/components/admin/AdminListingForm";
import { getAdminListing } from "@/services/admin.service";
import { AdminListingDetail } from "@/types/admin-listing";

interface Props {
  id: number;
}

export default function AdminListingEditClient({ id }: Props) {
  const [listing, setListing] = useState<AdminListingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAdminListing(id);
        setListing(data);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  if (loading) return <section className="admin-page">Đang tải...</section>;

  if (!listing) {
    return (
      <section className="admin-page">Không tìm thấy sản phẩm nào.</section>
    );
  }

  return <AdminListingForm mode="edit" listing={listing} />;
}
