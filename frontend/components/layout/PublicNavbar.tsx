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

export default function PublicNavbar() {
  const { notify, confirmAction } = useNotify();
  const { count } = useCart();

  const [listings, setListings] = useState<Listing[]>([]);
  const [balance, setBalance] = useState<UserBalance | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState<string | null>(null);

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
      clearAuth();
      setLoggedIn(false);
      setRole(null);
      setBalance(null);
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
        <img src="/logo.png" alt="shopthien.xyz" />
      </Link>

      <nav className="public-nav">
        <Link href="/">Trang chủ</Link>

        <div className="nav-dropdown">
          <Link href="/accounts">Kho acc</Link>

          <div className="nav-dropdown-menu">
            {games.length === 0 && <span>Chưa có game</span>}

            {games.map((game) => (
              <Link
                key={game}
                href={`/accounts?game=${encodeURIComponent(game)}`}
              >
                {game}
              </Link>
            ))}
          </div>
        </div>

        <Link href="/services">Dịch vụ</Link>
        <Link href="/me/orders">Lịch sử mua</Link>
        <Link href="/me/deposits">Nạp tiền</Link>

        <button
          type="button"
          className="nav-login"
          style={{
            background: "white",
            color: "var(--text)",
            position: "relative",
          }}
          onClick={() => window.dispatchEvent(new Event("cart:toggle"))}
        >
          🛒 Giỏ hàng
          {count > 0 && (
            <span
              style={{
                position: "absolute",
                top: -6,
                right: -6,
                background: "var(--accent)",
                color: "white",
                borderRadius: "50%",
                width: 20,
                height: 20,
                fontSize: 11,
                fontWeight: 900,
                display: "grid",
                placeItems: "center",
              }}
            >
              {count}
            </span>
          )}
        </button>

        {!loggedIn ? (
          <>
            <Link
              href="/register"
              className="nav-login"
              style={{ background: "white", color: "var(--primary)" }}
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
              <span className="user-avatar">👤</span>

              <span>
                <b>{balance?.username || "Tài khoản"}</b>
                <small>{formatCurrency(balance?.balance || 0)}</small>
              </span>
            </button>

            <div className="user-dropdown">
              <Link href="/me">Hồ sơ</Link>
              <Link href="/me/tickets">Hỗ trợ</Link>

              {role === "ADMIN" && <Link href="/admin">Admin</Link>}

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
