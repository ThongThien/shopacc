import { ReactNode } from "react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute role="ADMIN">
      <div className="admin-shell">
        <AdminSidebar />
        <main className="admin-content">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
