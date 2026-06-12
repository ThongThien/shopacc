"use client";

import { useEffect, useMemo, useState } from "react";
import { getAdminAuditLogs } from "@/services/admin.service";
import { AuditLog } from "@/types/audit-log";
import { auditActionLabel } from "@/lib/admin-labels";
import { formatDateTime } from "@/lib/format";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import AdminPagination from "@/components/admin/AdminPagination";

const PAGE_SIZE = 12;

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAdminAuditLogs();
        setLogs(data);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const filteredLogs = useMemo(() => {
    const kw = keyword.toLowerCase().trim();

    return logs.filter((log) => {
      if (!kw) return true;

      return `${log.username || ""} ${log.action} ${log.metadata || ""} ${log.ipAddress || ""}`
        .toLowerCase()
        .includes(kw);
    });
  }, [logs, keyword]);

  const visibleLogs = filteredLogs.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Nhật ký hệ thống</h1>
          <p>
            Theo dõi các thao tác quan trọng của quản trị viên và người dùng.
          </p>
        </div>
      </div>

      <div className="card admin-toolbar">
        <input
          className="input"
          placeholder="Tìm người thao tác, hành động, dữ liệu, IP..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="card table-card">
        {loading ? (
          <LoadingSpinner text="Đang tải nhật ký hệ thống..." />
        ) : (
          <>
            <div className="responsive-table">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Người thao tác</th>
                    <th>Hành động</th>
                    <th>Dữ liệu</th>
                    <th>IP</th>
                    <th>Thời gian</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleLogs.map((log) => (
                    <tr key={log.id}>
                      <td>#{log.id}</td>
                      <td>
                        {log.username || "-"}
                        {log.userId && (
                          <span className="muted-text"> #{log.userId}</span>
                        )}
                      </td>
                      <td>{auditActionLabel(log.action)}</td>
                      <td>{log.metadata || "-"}</td>
                      <td>{log.ipAddress || "-"}</td>
                      <td>{formatDateTime(log.createdAt)}</td>
                    </tr>
                  ))}

                  {visibleLogs.length === 0 && (
                    <tr>
                      <td colSpan={6}>
                        <p className="empty-text">
                          Không có nhật ký nào phù hợp.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <AdminPagination
              page={page}
              totalItems={filteredLogs.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </section>
  );
}
