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
    <div className="page-container home-page">
      <NoticeBox type="home" />

      <div className="home-content">
        {/* ==================== PRODUCTS ==================== */}
        {games.map((game) => {
          const gameListings = listings.filter((l) => l.gameName === game);

          return (
            <section key={game} className="market-section">
              {/* Game Name Row */}
              <div className="market-section-heading">
                <div>
                  <span className="section-kicker">KHO TÀI KHOẢN</span>
                  <h1>{game}</h1>
                </div>

                <span className="live-badge">
                  <i /> ĐANG MỞ BÁN
                </span>
              </div>

              {/* Account Card */}
              <div
                className="home-type-grid"
              >
                {TYPE_CARDS.map((card) => {
                  const count = countByType(gameListings, card.type);

                  const sold = soldByType(gameListings, card.type);

                  const from = priceFrom(gameListings, card.type);

                  return (
                    <Link
                      key={card.type}
                      href="/accounts"
                      className="home-feature-card"
                    >
                      {/* Account Image */}
                      <div className="listing-image-wrap">
                        <img src={ACCOUNT_IMAGE} alt="Tài khoản" />
                      </div>

                      {/* Account Information */}
                      <div className="home-feature-body">
                        <div className="home-feature-title">
                          <h3>{card.label}</h3>
                          <span>Xem kho <b>→</b></span>
                        </div>

                      {count > 0 ? (
                        <div className="home-feature-meta">
                          <span>
                            {count} sản phẩm
                            {sold > 0 && (
                              <span
                                className="muted-text"
                              >
                                {" "}
                                · {sold} đã bán
                              </span>
                            )}
                          </span>

                          {from != null && (
                            <strong>
                              Giá từ {formatCurrency(from)}
                            </strong>
                          )}
                        </div>
                      ) : (
                        <span className="muted-text">
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
        <section className="market-section">
          <div className="market-section-heading">
            <div>
              <span className="section-kicker">TIỆN ÍCH GAME</span>
              <h1>Dịch vụ nổi bật</h1>
            </div>
            <Link href="/services" className="section-link">Xem tất cả →</Link>
          </div>

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
              <section key={gameName} className="service-group">
                <div className="listing-grid">
                  {items.map((svc) => (
                    <Link
                      key={svc.id}
                      href={`/services/${svc.id}`}
                      className="listing-card service-card"
                    >
                      {/* HOT badge */}
                      <span className="hot-badge">
                        Siêu HOT
                      </span>

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

                        <p className="service-price">
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
