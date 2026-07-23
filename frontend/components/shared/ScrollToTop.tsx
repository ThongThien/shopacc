"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 300);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Lên đầu trang"
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 99,
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: "var(--color-primary)",
        color: "#fff",
        border: "none",
        cursor: "pointer",
        display: "grid",
        placeItems: "center",
        boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
        transition: "opacity 0.2s, transform 0.2s",
      }}
    >
      <ArrowUp size={20} />
    </button>
  );
}
