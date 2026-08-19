"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { clearAuth, getAccessToken, getUserRole } from "@/lib/auth";
import { getListings } from "@/services/listing.service";
import { getMyBalance } from "@/services/user.service";
import { Listing } from "@/types/listing";
import { UserBalance } from "@/types/user";
import { formatCurrency } from "@/lib/format";
import { useNotify } from "@/components/shared/NotificationProvider";
import { useCart } from "@/components/cart/CartContext";
import useWebSocket from "@/hooks/useWebSocket";
import { ShoppingCart, User, ChevronDown } from "lucide-react";

export default function PublicNavbar() {
  const { notify, confirmAction } = useNotify();
  const { count } = useCart();
  useWebSocket(); // Kết nối WebSocket real-time, fallback polling nếu không có

  const [listings, setListings] = useState<Listing[]>([]);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      setOpenDropdown(null);
    }
    if (openDropdown) {
      setTimeout(() => document.addEventListener("click", handleClick), 0);
      return () => document.removeEventListener("click", handleClick);
    }
  }, [openDropdown]);

  async function syncAuthState() {
    const token = getAccessToken();

    if (!token) {
      setLoggedIn(false);
      setRole(null);
      setBalance(null);
      return;
    }

    setLoggedIn(true);
    setRole(getUserRole());

    try {
      const data = await getMyBalance();
      setBalance(data);
    } catch {
      // Silently fail — apiFetch already handles 401 via auth-expired event
    }
  }

  useEffect(() => {
    async function loadNavbarData() {
      try {
        const data = await getListings();
        setListings(data);
      } catch {
        setListings([]);
      }
    }

    const initTimer = window.setTimeout(() => {
      void loadNavbarData();
      void syncAuthState();
    }, 0);

    function handleAuthChanged() {
      void syncAuthState();
    }

    function handleFocus() {
      void syncAuthState();
    }

    function handleBalanceChanged() {
      void syncAuthState();
    }

    window.addEventListener("auth-changed", handleAuthChanged);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("balance-changed", handleBalanceChanged);

    return () => {
      window.clearTimeout(initTimer);
      window.removeEventListener("auth-changed", handleAuthChanged);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("balance-changed", handleBalanceChanged);
    };
  }, []);

  const games = useMemo(() => {
    return Array.from(
      new Set(listings.map((listing) => listing.gameName).filter(Boolean)),
    );
  }, [listings]);

  async function handleLogout() {
    const ok = await confirmAction("Bạn có chắc muốn đăng xuất không?");

    if (!ok) return;

    clearAuth();
    notify("success", "Đăng xuất thành công");
    window.location.href = "/";
  }

  return (
    <header className="public-navbar">
      <Link href="/" className="public-logo">
        <img src="/logo_2.png" alt="shopthien.xyz" />
      </Link>

      <nav className="public-nav">
        <Link href="/">Trang chủ</Link>

        <Link href="/accounts">Kho acc</Link>

        <Link href="/services">Dịch vụ</Link>

        <Link href="https://zalo.me/g/eyaot0lf9jm4qegzhu9u">Cộng Đồng</Link>

        <Link href="/youtube">Youtube</Link>

        <Link href="/me/deposits">Nạp tiền</Link>

        <button
          type="button"
          className="btn-primary"
          style={{
            background: "var(--color-bg-card)",
            color: "var(--color-text)",
            position: "relative",
            height: 44,
          }}
          onClick={() => window.dispatchEvent(new Event("cart:toggle"))}
        >
          <ShoppingCart size={18} />

          {count > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[11px] font-black">
              {count}
            </span>
          )}
        </button>

        {!loggedIn ? (
          <>
            <Link
              href="/register"
              className="nav-login"
              style={{ color: "var(--color-primary)" }}
            >
              Đăng ký
            </Link>

            <Link href="/login" className="nav-login">
              Đăng nhập
            </Link>
          </>
        ) : (
          <div className="user-menu">
            <button className="user-menu-button" type="button">
              <span className="user-avatar">
                <User size={20} />
              </span>

              <span>
                <b>{balance?.username || "Tài khoản"}</b>
                <small>{formatCurrency(balance?.balance || 0)}</small>
              </span>
            </button>

            <div className="user-dropdown">
              {role === "ADMIN" && <Link href="/admin">Trang quản lý</Link>}

              <Link href="/me">Thông tin cá nhân</Link>
              <Link href="/me/orders">Lịch sử mua</Link>
              <Link href="/me/service-orders">Đơn dịch vụ</Link>
              <Link href="/me/tickets">Gửi hỗ trợ - lỗi</Link>

              <button type="button" onClick={handleLogout}>
                Đăng xuất
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
