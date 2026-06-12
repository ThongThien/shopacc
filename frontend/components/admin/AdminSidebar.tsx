"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/admin", label: "Tổng quan", exact: true },
  { href: "/admin/listings", label: "Danh sách sản phẩm" },
  { href: "/admin/categories", label: "Danh mục" },
  { href: "/admin/orders", label: "Đơn hàng" },
  { href: "/admin/users", label: "Người dùng" },
  { href: "/admin/transactions", label: "Giao dịch" },
  { href: "/admin/audit", label: "Nhật ký hệ thống" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside className="admin-sidebar">
      <h2>Xin chào QTV</h2>
      <h4>THIENNGOCRONG.SHOP</h4>

      <nav>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={isActive(link.href, link.exact) ? "active" : ""}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <Link href="/" className="admin-back-shop">
        Quay lại cửa hàng
      </Link>
    </aside>
  );
}
