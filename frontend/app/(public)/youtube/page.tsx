interface YoutubeChannel {
  name: string;
  description: string;
  url: string;
  subscribers: string;
}

const channels: YoutubeChannel[] = [
  {
    name: "Thiên Ngọc Rồng 3",
    description: "Kênh YouTube Thiên Ngọc Rồng.",
    url: "https://www.youtube.com/@thienngocrong3",
    subscribers: "1N5 sub",
  },
  {
    name: "Thiên Làng Lá",
    description: "Kênh YouTube Thiên Làng Lá",
    url: "https://www.youtube.com/@thienlangla",
    subscribers: "1N6 sub",
  },
  {
    name: "Thiên Ngọc Rồng 2",
    description: "Kênh YouTube Thiên Ngọc Rồng.",
    url: "https://www.youtube.com/@thienngocrong2",
    subscribers: "500 sub",
  },
  {
    name: "Thiên Ngọc Rồng 1",
    description: "Kênh YouTube Thiên Ngọc Rồng.",
    url: "https://www.youtube.com/@thienngocrong1",
    subscribers: "6N sub",
  },
];

export default function YoutubePage() {
  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ margin: 0 }}>Các Kênh YouTube</h1>

        <p
          style={{
            marginTop: 8,
            color: "var(--color-text-muted)",
          }}
        >
          Khám phá các kênh YouTube của chúng tôi.
        </p>
      </div>

      {/* Channel List */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
        }}
      >
        {channels.map((channel) => (
          <a
            key={channel.url}
            href={channel.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              padding: 22,
              textDecoration: "none",
              color: "inherit",
              border: "1px solid var(--color-border)",
              borderRadius: 16,
              background: "var(--color-background)",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
          >
            {/* YouTube Icon */}
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#ff0000",
                color: "#fff",
                fontSize: 22,
                fontWeight: 800,
                marginBottom: 18,
              }}
            >
              ▶
            </div>

            {/* Channel Name */}
            <h3
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 800,
              }}
            >
              {channel.name}
            </h3>

            {/* Subscribers */}
            <div
              style={{
                marginTop: 6,
                fontSize: 13,
                fontWeight: 600,
                color: "var(--color-text-muted)",
              }}
            >
              {channel.subscribers}
            </div>

            {/* Description */}
            <p
              style={{
                margin: "14px 0 18px",
                fontSize: 14,
                lineHeight: 1.6,
                color: "var(--color-text-muted)",
              }}
            >
              {channel.description}
            </p>

            {/* Button */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 14,
                fontWeight: 700,
                color: "var(--color-primary)",
              }}
            >
              Xem kênh
              <span>→</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
