"use client";

import { useEffect, useMemo, useState } from "react";
import { getAdminUsers } from "@/services/admin.service";
import { User } from "@/types/user";
import { formatCurrency, formatDateTime } from "@/lib/format";
import LoadingSpinner from "@/components/shared/LoadingSpinner";

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);

      try {
        const data = await getAdminUsers();
        setUsers(data);
      } finally {
        setLoading(false);
      }
    }

    void load().catch(console.error);
  }, []);

  const filteredUsers = useMemo(() => {
    const kw = keyword.toLowerCase().trim();

    return users
      .filter((user) => {
        if (!kw) return true;
        return `${user.username} ${user.email}`.toLowerCase().includes(kw);
      })
      .filter((user) => {
        if (!role) return true;
        return user.role === role;
      })
      .filter((user) => {
        if (!status) return true;
        return user.status === status;
      });
  }, [users, keyword, role, status]);

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Quản lý Users</h1>
          <p>Tra cứu tài khoản, số dư, role và trạng thái người dùng.</p>
        </div>
      </div>

      <div className="card admin-toolbar">
        <input
          className="input"
          placeholder="Tìm username hoặc email..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <select
          className="input"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="">Tất cả role</option>
          <option value="USER">USER</option>
          <option value="ADMIN">ADMIN</option>
        </select>

        <select
          className="input"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="LOCKED">LOCKED</option>
        </select>
      </div>

      <div className="card table-card">
        {loading ? (
          <LoadingSpinner text="Đang tải users..." />
        ) : (
          <div className="responsive-table">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Số dư</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>#{user.id}</td>
                    <td>{user.username}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.status || "-"}</td>
                    <td>{formatCurrency(user.balance)}</td>
                    <td>{formatDateTime(user.createdAt)}</td>
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
