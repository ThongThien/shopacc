import Link from "next/link";
import { getListings } from "@/services/listing.service";
import { formatCurrency } from "@/lib/format";
import NoticeBox from "@/components/layout/NoticeBox";
import { Listing } from "@/types/listing";

interface ServiceItem {
  id: number;
  gameName: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  thumbnail?: string;
  serverName?: string;
}

const API = process.env.NEXT_PUBLIC_API_BASE_URL || "";

const ACCOUNT_IMAGE =
  "https://cdn.phototourl.com/free/2026-08-27-d5816456-b6bf-4bc7-84c3-d8de19259e41.jpg";

const TYPE_CARDS = [
  {
    type: "ACCOUNT",
    label: "Tài khoản",
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.2)",
    color: "var(--color-price)",
  },
];

function countByType(listings: Listing[], type: string) {
  return listings.filter(
    (l) => l.status === "PUBLISHED" && l.listingType === type,
  ).length;
}

function soldByType(listings: Listing[], type: string) {
  return listings.filter(
    (l) => l.status === "SOLD_OUT" && l.listingType === type,
  ).length;
}

function priceFrom(listings: Listing[], type: string) {
  const pubs = listings.filter(
    (l) => l.status === "PUBLISHED" && l.listingType === type,
  );

  if (pubs.length === 0) return null;

  return Math.min(...pubs.map((l) => l.price));
}

async function getServices(): Promise<ServiceItem[]> {
  try {
    const res = await fetch(`${API}/api/services`, {
      cache: "no-store",
    });

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [listings, services] = await Promise.all([
    getListings(),
    getServices(),
  ]);

  const games = Array.from(
    new Set(listings.map((l) => l.gameName).filter(Boolean)),
  ) as string[];

  const serviceGroups = services.reduce<Record<string, ServiceItem[]>>(
    (acc, svc) => {
      if (!acc[svc.gameName]) {
        acc[svc.gameName] = [];
      }

      acc[svc.gameName].push(svc);

      return acc;
    },
    {},
  );

  return (
    <div className="page-container" style={{ paddingTop: 20 }}>
      <NoticeBox type="home" />

      <div style={{ display: "grid", gap: 32 }}>
        {/* ==================== PRODUCTS ==================== */}
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
                  borderBottom: "2px solid var(--color-border)",
                }}
              >
                <h1
                  style={{
                    margin: 0,
                    fontSize: 22,
                    fontWeight: 900,
                  }}
                >
                  {game}
                </h1>

                <span
                  style={{
                    background: "var(--color-danger)",
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

              {/* Account Card */}
              <div
                className="home-type-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: 14,
                }}
              >
                {TYPE_CARDS.map((card) => {
                  const count = countByType(gameListings, card.type);

                  const sold = soldByType(gameListings, card.type);

                  const from = priceFrom(gameListings, card.type);

                  return (
                    <Link
                      key={card.type}
                      href="/accounts"
                      className="listing-card"
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                        background: card.bg,
                        border: `1.5px solid ${card.border}`,
                        borderRadius: 14,
                        overflow: "hidden",
                        transition: "transform 0.2s ease, box-shadow 0.2s ease",
                      }}
                    >
                      {/* Account Image */}
                      <div className="listing-image-wrap">
                        <img src={ACCOUNT_IMAGE} alt="Tài khoản" />
                      </div>

                      {/* Account Information */}
                      <div className="listing-card-body">
                        <h3
                          style={{
                            color: card.color,
                          }}
                        >
                          {card.label}
                        </h3>

                        {count > 0 ? (
                          <div
                            style={{
                              display: "grid",
                              gap: 2,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: "var(--color-text)",
                              }}
                            >
                              {count} sản phẩm
                              {sold > 0 && (
                                <span
                                  style={{
                                    color: "var(--color-text-muted)",
                                    fontWeight: 400,
                                  }}
                                >
                                  {" "}
                                  · {sold} đã bán
                                </span>
                              )}
                            </span>

                            {from != null && (
                              <span
                                style={{
                                  fontSize: 13,
                                  color: "var(--color-primary)",
                                  fontWeight: 800,
                                }}
                              >
                                Giá từ {formatCurrency(from)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span
                            style={{
                              fontSize: 13,
                              color: "var(--color-text-muted)",
                            }}
                          >
                            Chưa có sản phẩm
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}

        {games.length === 0 && (
          <p
            style={{
              color: "var(--color-text-muted)",
              textAlign: "center",
              padding: 40,
            }}
          >
            Chưa có sản phẩm nào.
          </p>
        )}

        {/* ==================== SERVICES ==================== */}
        <section>
          <section className="page-heading">
            <h1>Dịch vụ</h1>
            <p>Đặt dịch vụ game — uy tín, an toàn.</p>
          </section>

          {Object.keys(serviceGroups).length === 0 ? (
            <p
              style={{
                color: "var(--color-text-muted)",
                textAlign: "center",
                padding: 40,
              }}
            >
              Chưa có dịch vụ nào.
            </p>
          ) : (
            Object.entries(serviceGroups).map(([gameName, items]) => (
              <section key={gameName} style={{ marginBottom: 32 }}>
                <h2
                  style={{
                    margin: "0 0 14px",
                    fontSize: 20,
                    fontWeight: 900,
                  }}
                >
                  {gameName}
                </h2>

                <div className="listing-grid">
                  {items.map((svc) => (
                    <Link
                      key={svc.id}
                      href={`/services/${svc.id}`}
                      className="listing-card"
                      style={{
                        textDecoration: "none",
                        color: "inherit",
                      }}
                    >
                      <div className="listing-image-wrap">
                        {svc.thumbnail ? (
                          <img src={svc.thumbnail} alt={svc.title} />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "grid",
                              placeItems: "center",
                              fontSize: 48,
                              background: "var(--color-bg-secondary)",
                            }}
                          >
                            🔧
                          </div>
                        )}
                      </div>

                      <div className="listing-card-body">
                        <h3>{svc.title}</h3>

                        {svc.serverName && (
                          <span
                            className="listing-tags"
                            style={{
                              marginBottom: 8,
                            }}
                          >
                            <span>{svc.serverName}</span>
                          </span>
                        )}

                        <p
                          style={{
                            color: "var(--color-primary)",
                            fontWeight: 700,
                            fontSize: 18,
                            margin: 0,
                          }}
                        >
                          {formatCurrency(svc.price)}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
