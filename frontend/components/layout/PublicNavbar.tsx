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

export default function PublicNavbar() {
  const { notify, confirmAction } = useNotify();

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

    window.addEventListener("auth-changed", handleAuthChanged);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearTimeout(initTimer);
      window.removeEventListener("auth-changed", handleAuthChanged);
      window.removeEventListener("focus", handleFocus);
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
        <img src="/logo_shop_2-removebg-preview.png" alt="thienngocrong.shop" />
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

        {!loggedIn ? (
          <Link href="/login" className="nav-login">
            Đăng nhập
          </Link>
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
              <Link href="/me/orders">Lịch sử mua</Link>
              <Link href="/me/deposits">Nạp tiền</Link>

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
