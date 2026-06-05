"use client";

import { useEffect, useState } from "react";
import AdminListingDetail from "@/components/admin/AdminListingDetail";
import { getAdminListing } from "@/services/admin.service";
import { AdminListingDetail as AdminListingDetailType } from "@/types/admin-listing";

interface Props {
  id: number;
}

export default function AdminListingDetailClient({ id }: Props) {
  const [listing, setListing] = useState<AdminListingDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAdminListing(id);
        setListing(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không tải được listing");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  if (loading) {
    return <section className="admin-page">Đang tải...</section>;
  }

  if (error) {
    return <section className="admin-page">{error}</section>;
  }

  if (!listing) {
    return <section className="admin-page">Không tìm thấy listing.</section>;
  }

  return <AdminListingDetail listing={listing} />;
}
