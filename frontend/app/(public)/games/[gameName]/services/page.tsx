import Link from "next/link";
import { getListings } from "@/services/listing.service";
import { formatCurrency } from "@/lib/format";
import NoticeBox from "@/components/layout/NoticeBox";

export default async function ServiceListPage({
  params,
}: {
  params: Promise<{ gameName: string }>;
}) {
  const { gameName } = await params;
  const decoded = decodeURIComponent(gameName);
  const listings = await getListings();
  const services = listings.filter(
    (l) => l.gameName === decoded && l.listingType === "SERVICE" && l.status === "PUBLISHED",
  );

  return (
    <div className="page-container">
      <NoticeBox type="home" />

      <section className="page-heading">
        <h1>Dịch vụ {decoded}</h1>
        <p>{services.length} dịch vụ đang mở</p>
      </section>

      {services.length === 0 ? (
        <p style={{ color: "var(--color-text-muted)", textAlign: "center", padding: 40 }}>
          Chưa có dịch vụ nào cho game này.
        </p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {services.map((svc) => (
            <Link
              key={svc.id}
              href={`/services/${svc.id}`}
              className="card"
              style={{ textDecoration: "none", color: "inherit", padding: 0, overflow: "hidden" }}
            >
              <div style={{ height: 160, background: "var(--color-bg-secondary)", display: "grid", placeItems: "center", fontSize: 48 }}>
                {svc.thumbnail ? (
                  <img src={svc.thumbnail} alt={svc.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  "🔧"
                )}
              </div>
              <div style={{ padding: 14 }}>
                <h3 style={{ margin: "0 0 6px" }}>{svc.title}</h3>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                  {svc.serverName && (
                    <span style={{ background: "var(--color-bg-secondary)", padding: "3px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>
                      {svc.serverName}
                    </span>
                  )}
                </div>
                <b style={{ color: "var(--color-primary)", fontSize: 20 }}>
                  {formatCurrency(svc.price)}
                </b>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
