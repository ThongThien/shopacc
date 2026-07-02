"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  adjustAdminUserBalance,
  getAdminUsers,
  resetAdminUserPassword,
  updateAdminUserStatus,
} from "@/services/admin.service";
import { User, UserStatus } from "@/types/user";
import { formatCurrency, formatDateTime } from "@/lib/format";
import LoadingSpinner from "@/components/shared/LoadingSpinner";
import AdminPagination from "@/components/admin/AdminPagination";
import { useNotify } from "@/components/shared/NotificationProvider";
import { userRoleLabel, userStatusLabel } from "@/lib/admin-labels";

const PAGE_SIZE = 10;

export default function AdminUsers() {
  const { notify, confirmAction } = useNotify();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const [balanceUser, setBalanceUser] = useState<User | null>(null);
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceNote, setBalanceNote] = useState("");

  const [resetPassword, setResetPassword] = useState("");

  async function loadUsers() {
    setLoading(true);

    try {
      const data = await getAdminUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers().catch(console.error);
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

  const visibleUsers = filteredUsers.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  async function handleChangeStatus(user: User) {
    const nextStatus: UserStatus =
      user.status === "BANNED" ? "ACTIVE" : "BANNED";

    const ok = await confirmAction(
      nextStatus === "BANNED"
        ? `Bạn chắc chắn muốn khóa tài khoản "${user.username}"? User này sẽ không đăng nhập được.`
        : `Bạn chắc chắn muốn mở khóa tài khoản "${user.username}"?`,
      nextStatus === "BANNED" ? "Khóa tài khoản" : "Mở khóa tài khoản",
    );

    if (!ok) return;

    try {
      await updateAdminUserStatus(user.id, { status: nextStatus });

      notify(
        "success",
        nextStatus === "BANNED" ? "Đã khóa tài khoản" : "Đã mở khóa tài khoản",
      );

      await loadUsers();
    } catch (error) {
      notify(
        "error",
        error instanceof Error ? error.message : "Cập nhật trạng thái thất bại",
      );
    }
  }

  async function handleResetPassword(user: User) {
    const ok = await confirmAction(
      `Reset mật khẩu cho tài khoản "${user.username}"? Mật khẩu mới sẽ được tạo tự động.`,
      "Reset mật khẩu",
    );

    if (!ok) return;

    try {
      const data = await resetAdminUserPassword(user.id);
      setResetPassword(data.newPassword);
      notify("success", "Reset mật khẩu thành công");
    } catch (error) {
      notify(
        "error",
        error instanceof Error ? error.message : "Reset mật khẩu thất bại",
      );
    }
  }

  async function handleAdjustBalance(event: React.FormEvent) {
    event.preventDefault();

    if (!balanceUser) return;

    const newBalance = Number(balanceAmount);

    if (!Number.isFinite(newBalance) || newBalance < 0) {
      notify("error", "Số dư phải >= 0");
      return;
    }

    const delta = newBalance - balanceUser.balance;
    if (delta === 0) {
      notify("error", "Số dư không thay đổi");
      return;
    }

    const ok = await confirmAction(
      `Đặt số dư "${balanceUser.username}" từ ${formatCurrency(balanceUser.balance)} → ${formatCurrency(newBalance)} (${delta > 0 ? "+" : ""}${formatCurrency(delta)})?`,
      "Điều chỉnh số dư",
    );

    if (!ok) return;

    try {
      await adjustAdminUserBalance(balanceUser.id, {
        amount: delta,
        note: balanceNote,
      });

      notify("success", "Đã cập nhật số dư");

      setBalanceUser(null);
      setBalanceAmount("");
      setBalanceNote("");

      await loadUsers();
    } catch (error) {
      notify(
        "error",
        error instanceof Error ? error.message : "Điều chỉnh số dư thất bại",
      );
    }
  }

  return (
    <section className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1>Quản lý người dùng</h1>
          <p>Tra cứu tài khoản, số dư, quyền hạn và trạng thái người dùng.</p>
        </div>
      </div>

      <div className="card admin-toolbar">
        <input
          className="input"
          placeholder="Tìm tên đăng nhập hoặc email..."
          value={keyword}
          onChange={(e) => {
            setKeyword(e.target.value);
            setPage(1);
          }}
        />

        <select
          className="input"
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tất cả quyền</option>
          <option value="USER">Người dùng</option>
          <option value="ADMIN">Quản trị viên</option>
        </select>

        <select
          className="input"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">Đang hoạt động</option>
          <option value="BANNED">Đã khóa</option>
        </select>
      </div>

      <div className="admin-summary-row">
        <span>Tổng: {users.length}</span>
        <span>
          Đang hoạt động:{" "}
          {users.filter((user) => user.status === "ACTIVE").length}
        </span>
        <span>
          Đã khóa: {users.filter((user) => user.status === "BANNED").length}
        </span>
      </div>

      <div className="card table-card">
        {loading ? (
          <LoadingSpinner text="Đang tải người dùng..." />
        ) : (
          <>
            <div className="responsive-table">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tên đăng nhập</th>
                    <th>Email</th>
                    <th>Quyền</th>
                    <th>Trạng thái</th>
                    <th>Số dư</th>
                    <th>Ngày tạo</th>
                    <th></th>
                  </tr>
                </thead>

                <tbody>
                  {visibleUsers.map((user) => (
                    <tr key={user.id}>
                      <td>#{user.id}</td>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{userRoleLabel(user.role)}</td>
                      <td>{userStatusLabel(user.status)}</td>
                      <td>{formatCurrency(user.balance)}</td>
                      <td>{formatDateTime(user.createdAt)}</td>
                      <td className="admin-actions">
                        <Link href={`/admin/users/${user.id}`}>Xem</Link>

                        <button
                          type="button"
                          onClick={() => {
                            setBalanceUser(user);
                            setBalanceAmount(String(user.balance));
                          }}
                        >
                          Sửa tiền
                        </button>

                        <button
                          type="button"
                          onClick={() => handleResetPassword(user)}
                        >
                          Reset MK
                        </button>

                        <button
                          type="button"
                          onClick={() => handleChangeStatus(user)}
                        >
                          {user.status === "BANNED" ? "Mở khóa" : "Khóa"}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {visibleUsers.length === 0 && (
                    <tr>
                      <td colSpan={8}>
                        <p className="empty-text">
                          Không có người dùng phù hợp.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <AdminPagination
              page={page}
              totalItems={filteredUsers.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {balanceUser && (
        <div className="modal-overlay">
          <form className="modal-card" onSubmit={handleAdjustBalance}>
            <h2>Đặt lại số dư</h2>

            <p className="muted-text">
              User: <b>{balanceUser.username}</b> — Số dư hiện tại:{" "}
              <b>{formatCurrency(balanceUser.balance)}</b>
            </p>

            <input
              className="input"
              type="number"
              min={0}
              placeholder="Nhập số dư mong muốn"
              value={balanceAmount}
              onChange={(e) => setBalanceAmount(e.target.value)}
            />

            <textarea
              className="input textarea"
              placeholder="Ghi chú"
              value={balanceNote}
              onChange={(e) => setBalanceNote(e.target.value)}
            />

            <div className="modal-actions">
              <button
                className="btn-secondary"
                type="button"
                onClick={() => setBalanceUser(null)}
              >
                Hủy
              </button>

              <button className="btn-primary" type="submit">
                Xác nhận
              </button>
            </div>
          </form>
        </div>
      )}

      {resetPassword && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>Mật khẩu mới</h2>

            <p className="muted-text">
              Hãy copy mật khẩu này gửi cho người dùng. Hệ thống sẽ không hiển
              thị lại sau khi đóng.
            </p>

            <pre className="secret-content">{resetPassword}</pre>

            <div className="modal-actions">
              <button
                className="btn-primary"
                type="button"
                onClick={() => setResetPassword("")}
              >
                Đã copy
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
