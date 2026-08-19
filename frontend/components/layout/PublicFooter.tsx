import Link from "next/link";

export default function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="footer-grid">
        <div>
          <img
            src="/logo_footer.png"
            alt="shopthien.xyz"
            style={{ height: 100, width: 100, borderRadius: 30 }}
          />
        </div>
        <div>
          <h3>shopthien.xyz</h3>
          <p>Shop acc game uy tín — Ngọc Rồng Online</p>
          <p>Hỗ trợ 24/7, giao dịch tự động, bảo mật tuyệt đối.</p>
        </div>
        <div className="footer-links">
          <h3>Liên kết</h3>
          <ul>
            <li>
              <Link href="/accounts">Kho acc</Link>
            </li>
            <li>
              <Link href="/services">Dịch vụ</Link>
            </li>
            <li>
              <Link href="/me/deposits">Nạp tiền</Link>
            </li>
            <li>
              <Link href="/me/tickets">Hỗ trợ</Link>
            </li>
          </ul>
        </div>
        <div>
          <h3>Liên hệ</h3>
          <p>Zalo: 0772438318</p>
          <p>Email: thongthien2004@gmail.com</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 shopthien.xyz</span>
        <span>Phát triển bởi chính tay Thiên Ngọc Rồng</span>
      </div>
    </footer>
  );
}
