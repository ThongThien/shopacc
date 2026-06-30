export default function Loading() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 9999,
        background: "linear-gradient(90deg, #22c55e, #16a34a, #22c55e)",
        backgroundSize: "200% 100%",
        animation: "loadingBarSlide 1.5s ease-in-out infinite",
      }}
    />
  );
}
