"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatCurrency } from "@/lib/format";

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

export default function ServiceListPage() {
  const searchParams = useSearchParams();
  const game = searchParams.get("game");
  const [services, setServices] = useState<ServiceItem[]>([]);

  useEffect(() => {
    fetch(
      `${API}/api/services${game ? `?game=${encodeURIComponent(game)}` : ""}`,
    )
      .then((r) => r.json())
      .then(setServices)
      .catch(() => setServices([]));
  }, [game]);

  const groups = game
    ? { [game]: services }
    : services.reduce<Record<string, ServiceItem[]>>((acc, svc) => {
        if (!acc[svc.gameName]) acc[svc.gameName] = [];
        acc[svc.gameName].push(svc);
        return acc;
      }, {});

  return (
    <div className="page-container">
      <section className="page-heading">
        <h1>{game ? `Dịch vụ ${game}` : "Dịch vụ"}</h1>
        <p>Đặt dịch vụ game — uy tín, an toàn.</p>
      </section>

      {Object.keys(groups).length === 0 ? (
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
        Object.entries(groups).map(([gameName, items]) => (
          <section key={gameName} style={{ marginBottom: 32 }}>
            {!game && (
              <h2 style={{ margin: "0 0 14px", fontSize: 20, fontWeight: 900 }}>
                {gameName}
              </h2>
            )}
            <div className="listing-grid">
              {items.map((svc) => (
                <Link
                  key={svc.id}
                  href={`/services/${svc.id}`}
                  className="listing-card"
                  style={{ textDecoration: "none", color: "inherit" }}
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
                        style={{ marginBottom: 8 }}
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
    </div>
  );
}
