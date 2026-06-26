"use client";

import { useEffect, useState } from "react";
import AdminUserDetail from "@/components/admin/AdminUserDetail";
import { getAdminUser } from "@/services/admin.service";
import { AdminUserDetail as AdminUserDetailType } from "@/types/user";

interface Props {
  id: number;
}

export default function AdminUserDetailClient({ id }: Props) {
  const [user, setUser] = useState<AdminUserDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAdminUser(id);
        setUser(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không tải được user");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [id]);

  if (loading) {
    return <section className="admin-page">Đang tải user...</section>;
  }

  if (error) {
    return <section className="admin-page">{error}</section>;
  }

  if (!user) {
    return <section className="admin-page">Không tìm thấy user.</section>;
  }

  return <AdminUserDetail user={user} />;
}
