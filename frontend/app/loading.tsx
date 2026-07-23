export default function Loading() {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "var(--color-bg)",
      display: "grid", placeItems: "center",
      zIndex: 9999,
    }}>
      <div style={{ textAlign: "center", display: "grid", gap: 16, justifyItems: "center" }}>
        <div className="loading-spinner" style={{ width: 44, height: 44 }} />
        <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>Đang tải...</p>
      </div>
    </div>
  );
}
