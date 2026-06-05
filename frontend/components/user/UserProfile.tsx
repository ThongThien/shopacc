"use client";

import { useEffect, useState } from "react";
import { clearAuth } from "@/lib/auth";
import { useNotify } from "@/components/shared/NotificationProvider";
import { useRouter } from "next/navigation";
import { changeMyPassword, getMyProfile } from "@/services/user.service";
import { UserProfile as UserProfileType } from "@/types/user";
import { formatCurrency, formatDateTime } from "@/lib/format";

export default function UserProfile() {
  const router = useRouter();
  const { notify, confirmAction } = useNotify();

  const [profile, setProfile] = useState<UserProfileType | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changing, setChanging] = useState(false);

  useEffect(() => {
    void getMyProfile().then(setProfile).catch(console.error);
  }, []);

  async function handleChangePassword(event: React.FormEvent) {
    event.preventDefault();

    const ok = await confirmAction("Bạn có chắc muốn đổi mật khẩu không?");
    if (!ok) return;

    try {
      setChanging(true);

      await changeMyPassword({
        currentPassword,
        newPassword,
      });

      notify("success", "Đổi mật khẩu thành công");

      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      notify(
        "error",
        error instanceof Error ? error.message : "Đổi mật khẩu thất bại",
      );
    } finally {
      setChanging(false);
    }
  }

  async function handleLogout() {
    const ok = await confirmAction("Bạn có chắc muốn đăng xuất không?");
    if (!ok) return;

    clearAuth();
    notify("success", "Đăng xuất thành công");
    router.push("/");
    router.refresh();
  }

  return (
    <section className="card profile-card">
      <h1>Hồ sơ tài khoản</h1>

      {!profile ? (
        <p>Đang tải hồ sơ...</p>
      ) : (
        <div className="profile-grid">
          <div>
            <b>Thông tin tài khoản</b>
            <p>ID: #{profile.id}</p>
            <p>Username: {profile.username}</p>
            <p>Email: {profile.email}</p>
            <p>Role: {profile.role}</p>
            <p>Trạng thái: {profile.status}</p>
            <p>Số dư: {formatCurrency(profile.balance)}</p>
          </div>

          <div>
            <b>Thời gian tài khoản</b>
            <p>Ngày tạo: {formatDateTime(profile.createdAt)}</p>
            <p>Cập nhật: {formatDateTime(profile.updatedAt)}</p>
            <p>
              Lần đăng nhập gần nhất:{" "}
              {profile.lastLoginAt
                ? formatDateTime(profile.lastLoginAt)
                : "Chưa ghi nhận"}
            </p>
          </div>
        </div>
      )}

      <form className="change-password-box" onSubmit={handleChangePassword}>
        <h2>Đổi mật khẩu</h2>

        <input
          className="input"
          type="password"
          placeholder="Mật khẩu hiện tại"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="Mật khẩu mới"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <button className="btn-primary" type="submit" disabled={changing}>
          {changing ? "Đang đổi..." : "Đổi mật khẩu"}
        </button>
      </form>

      <button className="btn-secondary" type="button" onClick={handleLogout}>
        Đăng xuất tài khoản
      </button>
    </section>
  );
}
