import PublicFooter from "@/components/layout/PublicFooter";
import PublicNavbar from "@/components/layout/PublicNavbar";
import ScrollToTop from "@/components/shared/ScrollToTop";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="site-shell">
      <PublicNavbar />
      <main>{children}</main>
      <PublicFooter />
      <ScrollToTop />
    </div>
  );
}
