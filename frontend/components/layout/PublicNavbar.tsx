"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getAccessToken, getUserRole, logout } from "@/lib/auth";
import { getMyBalance } from "@/services/user.service";
import { UserBalance } from "@/types/user";
import { formatCurrency } from "@/lib/format";
import { useNotify } from "@/components/shared/NotificationProvider";
import { useCart } from "@/components/cart/CartContext";
import useWebSocket from "@/hooks/useWebSocket";
import { ShoppingCart, User, Menu, X } from "lucide-react";

export default function PublicNavbar() {
  const pathname = usePathname();
  const { notify, confirmAction } = useNotify();
  const { count } = useCart();
  useWebSocket(); // Kết nối WebSocket real-time, fallback polling nếu không có

  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

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
    const initTimer = window.setTimeout(() => {
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

  async function handleLogout() {
    const ok = await confirmAction("Bạn có chắc muốn đăng xuất không?");

    if (!ok) return;

    await logout();
    notify("success", "Đăng xuất thành công");
    window.location.href = "/";
  }

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === href : pathname.startsWith(href);

  return (
    <header className="public-navbar">
      <Link href="/" className="public-logo" aria-label="Về trang chủ">
        <img src="/logo_2.png" alt="shopthien.xyz" />
      </Link>

      <button
        className="mobile-nav-toggle"
        type="button"
        aria-label={mobileOpen ? "Đóng menu" : "Mở menu"}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((value) => !value)}
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <nav className={`public-nav${mobileOpen ? " mobile-open" : ""}`}>
        <Link href="/" className={isActive("/") ? "active" : ""}>Trang chủ</Link>

        <Link href="/accounts" className={isActive("/accounts") || isActive("/account") ? "active" : ""}>Kho acc</Link>

        <Link href="/services" className={isActive("/services") ? "active" : ""}>Dịch vụ</Link>

        <Link href="https://zalo.me/g/eyaot0lf9jm4qegzhu9u">Cộng Đồng</Link>

        <Link href="/youtube">Youtube</Link>

        <Link href="/me/deposits">Nạp tiền</Link>

        <button
          type="button"
          className="nav-cart-button"
          aria-label={`Giỏ hàng, ${count} sản phẩm`}
          onClick={() => window.dispatchEvent(new Event("cart:toggle"))}
        >
          <ShoppingCart size={18} />

          {count > 0 && (
            <span className="nav-cart-count">
              {count}
            </span>
          )}
        </button>

        {!loggedIn ? (
          <>
            <Link
              href="/register"
              className="nav-register"
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
