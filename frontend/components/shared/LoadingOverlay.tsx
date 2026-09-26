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
    <div className="loading-overlay" role="status" aria-live="polite">
      <div className="loading-overlay-card">
        <div className="loading-spinner loading-spinner-large" />
        <b>{state.text}</b>
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
