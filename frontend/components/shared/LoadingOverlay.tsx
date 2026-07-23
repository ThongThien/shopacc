"use client";

import { useEffect, useState } from "react";

interface LoadingState {
  show: boolean;
  text: string;
}

export default function LoadingOverlay() {
  const [state, setState] = useState<LoadingState>({ show: false, text: "" });

  useEffect(() => {
    function handleShow(e: Event) {
      const detail = (e as CustomEvent<{ text?: string }>).detail;
      setState({ show: true, text: detail?.text || "Đang xử lý..." });
    }

    function handleHide() {
      setState({ show: false, text: "" });
    }

    window.addEventListener("loading-overlay:show", handleShow);
    window.addEventListener("loading-overlay:hide", handleHide);

    return () => {
      window.removeEventListener("loading-overlay:show", handleShow);
      window.removeEventListener("loading-overlay:hide", handleHide);
    };
  }, []);

  if (!state.show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 9998,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 16,
          padding: "32px 40px",
          display: "grid",
          gap: 16,
          justifyItems: "center",
          boxShadow: "0 24px 80px rgba(15,23,42,0.3)",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: "4px solid var(--color-border)",
            borderTopColor: "var(--color-primary)",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }}
        />
        <b style={{ color: "var(--color-text)", fontSize: 15 }}>{state.text}</b>
      </div>
    </div>
  );
}

export function showLoading(text?: string) {
  window.dispatchEvent(
    new CustomEvent("loading-overlay:show", { detail: { text } }),
  );
}

export function hideLoading() {
  window.dispatchEvent(new Event("loading-overlay:hide"));
}
