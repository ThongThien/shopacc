import Link from "next/link";
import { getPublicHomeData } from "@/services/listing.service";
import NoticeBox from "@/components/layout/NoticeBox";

const TYPE_CARDS = [
  {
    type: "ACCOUNT",
    label: "Tài khoản",
    desc: "Mua bán tài khoản game.",
    icon: "👤",
    color: "#dbeafe",
    borderColor: "#3b82f6",
    textColor: "#1e40af",
  },
  // {
  //   type: "ITEM",
  //   label: "Vật phẩm",
  //   desc: "Mua bán vật phẩm trong game.",
  //   icon: "🎁",
  //   color: "#fef3c7",
  //   borderColor: "#f59e0b",
  //   textColor: "#92400e",
  // },
  {
    type: "SERVICE",
    label: "Dịch vụ",
    desc: "Up SKH, săn đệ và các dịch vụ khác.",
    icon: "🔧",
    color: "#f3e8ff",
    borderColor: "#a855f7",
    textColor: "#6b21a8",
  },
];

export default async function GamePage({
  params,
}: {
  params: Promise<{ gameName: string }>;
}) {
  const { gameName } = await params;
  const decoded = decodeURIComponent(gameName);
  const homeData = await getPublicHomeData();
  const section = homeData.find((s) => s.gameName === decoded);

  return (
    <div className="page-container">
      <NoticeBox type="home" />

      <section className="page-heading">
        <h1>{decoded}</h1>
        <p>Chọn loại sản phẩm bạn muốn mua.</p>
      </section>

      <div className="category-grid">
        {TYPE_CARDS.map((card) => (
          <Link
            key={card.type}
            href={`/accounts?game=${encodeURIComponent(decoded)}&type=${card.type}`}
            className="card"
            style={{
              textDecoration: "none",
              color: "inherit",
              padding: 24,
              border: `2px solid var(--color-border)`,
              borderRadius: "var(--radius-lg)",
              background: card.color,
              display: "grid",
              gap: 8,
              justifyItems: "center",
              textAlign: "center",
            }}
          >
            <span style={{ fontSize: 40 }}>{card.icon}</span>
            <h3 style={{ margin: 0, color: card.textColor }}>{card.label}</h3>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                color: card.textColor,
                opacity: 0.85,
              }}
            >
              {card.desc}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
