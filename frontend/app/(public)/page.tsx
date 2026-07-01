import Link from "next/link";
import { getListings } from "@/services/listing.service";
import { formatCurrency } from "@/lib/format";
import NoticeBox from "@/components/layout/NoticeBox";
import { Listing } from "@/types/listing";

const TYPE_CARDS = [
  { type: "ACCOUNT", label: "Tài khoản", icon: "👤", bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af" },
  { type: "ITEM", label: "Vật phẩm", icon: "🎁", bg: "#fffbeb", border: "#fde68a", color: "#92400e" },
  { type: "SERVICE", label: "Dịch vụ", icon: "🔧", bg: "#faf5ff", border: "#d8b4fe", color: "#6b21a8" },
];

function countByType(listings: Listing[], type: string) {
  return listings.filter((l) => l.status === "PUBLISHED" && l.listingType === type).length;
}

function priceFrom(listings: Listing[], type: string) {
  const pubs = listings.filter((l) => l.status === "PUBLISHED" && l.listingType === type);
  if (pubs.length === 0) return null;
  return Math.min(...pubs.map((l) => l.price));
}

export default async function HomePage() {
  const listings = await getListings();
  const games = Array.from(new Set(listings.map((l) => l.gameName).filter(Boolean))) as string[];

  return (
    <div className="page-container" style={{ paddingTop: 20 }}>
      <NoticeBox type="home" />

      <section className="page-heading">
        <h1>Kho acc game</h1>
        <p>Chọn game và loại sản phẩm bạn muốn mua.</p>
      </section>

      <div style={{ display: "grid", gap: 32 }}>
        {games.map((game) => {
          const gameListings = listings.filter((l) => l.gameName === game);

          return (
            <section key={game}>
              {/* Game Name Row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 14,
                  paddingBottom: 10,
                  borderBottom: "2px solid var(--border)",
                }}
              >
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>{game}</h2>
                <span
                  style={{
                    background: "var(--accent)",
                    color: "white",
                    padding: "2px 10px",
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 900,
                  }}
                >
                  HOT
                </span>
              </div>

              {/* Type Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 14,
                }}
              >
                {TYPE_CARDS.map((card) => {
                  const count = countByType(gameListings, card.type);
                  const from = priceFrom(gameListings, card.type);
                  const href =
                    card.type === "SERVICE"
                      ? `/games/${encodeURIComponent(game)}/services`
                      : `/accounts?game=${encodeURIComponent(game)}&type=${card.type}`;

                  return (
                    <Link
                      key={card.type}
                      href={href}
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                        background: card.bg,
                        border: `1.5px solid ${card.border}`,
                        borderRadius: 14,
                        padding: "18px 20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        position: "relative",
                        overflow: "hidden",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      }}
                    >
                      {/* HOT badge top-right */}
                      {count > 0 && (
                        <span
                          style={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            background: "var(--accent)",
                            color: "white",
                            fontSize: 10,
                            fontWeight: 900,
                            padding: "2px 8px",
                            borderRadius: 999,
                          }}
                        >
                          HOT
                        </span>
                      )}

                      <span style={{ fontSize: 32 }}>{card.icon}</span>
                      <b style={{ fontSize: 16, color: card.color }}>{card.label}</b>

                      {count > 0 ? (
                        <div style={{ display: "grid", gap: 2 }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>
                            {count} sản phẩm
                          </span>
                          {from != null && (
                            <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 800 }}>
                              Giá từ {formatCurrency(from)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: 13, color: "var(--muted)" }}>
                          Chưa có sản phẩm
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      {games.length === 0 && (
        <p style={{ color: "var(--muted)", textAlign: "center", padding: 40 }}>
          Chưa có sản phẩm nào.
        </p>
      )}
    </div>
  );
}
