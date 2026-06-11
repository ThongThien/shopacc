"use client";

import { useEffect, useState } from "react";
import AdminOrderDetail from "@/components/admin/AdminOrderDetail";
import { getAdminOrder } from "@/services/admin.service";
import { Order } from "@/types/order";

interface Props {
  id: number;
}

export default function AdminOrderDetailClient({ id }: Props) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getAdminOrder(id);
        setOrder(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Không tải được hóa đơn");
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [id]);

  if (loading) {
    return <section className="admin-page">Đang tải hóa đơn...</section>;
  }

  if (error) {
    return <section className="admin-page">{error}</section>;
  }

  if (!order) {
    return <section className="admin-page">Không tìm thấy hóa đơn.</section>;
  }

  return <AdminOrderDetail order={order} />;
}
