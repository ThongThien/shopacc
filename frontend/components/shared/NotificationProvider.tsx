"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
  useState,
} from "react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ConfirmState {
  title: string;
  message: string;
  resolve: (value: boolean) => void;
}

interface NotificationContextValue {
  notify: (type: ToastType, message: string) => void;
  confirmAction: (message: string, title?: string) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

const TYPE_ICONS: Record<string, string> = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  function notify(type: ToastType, message: string) {
    const id = Date.now();
    setToast({ id, type, message });

    window.setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 2500);
  }

  function confirmAction(message: string, title = "Xác nhận thao tác") {
    return new Promise<boolean>((resolve) => {
      setConfirmState({ title, message, resolve });
    });
  }

  function closeConfirm(value: boolean) {
    if (!confirmState) return;
    confirmState.resolve(value);
    setConfirmState(null);
  }

  const value = useMemo(() => ({ notify, confirmAction }), []);

  return (
    <NotificationContext.Provider value={value}>
      {children}

      {/* Center modal notification */}
      {toast && (
        <div
          className="modal-overlay"
          style={{ background: "transparent", pointerEvents: "none", zIndex: 10001 }}
          onClick={() => setToast(null)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 16,
              padding: "28px 36px",
              boxShadow: "0 24px 80px rgba(15,23,42,0.3)",
              textAlign: "center",
              pointerEvents: "auto",
              animation: "pageFadeIn 0.2s ease-out",
              maxWidth: 400,
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>
              {TYPE_ICONS[toast.type]}
            </div>
            <p
              style={{
                margin: 0,
                fontWeight: 700,
                fontSize: 15,
                color:
                  toast.type === "error"
                    ? "var(--danger)"
                    : toast.type === "success"
                      ? "var(--success)"
                      : "var(--text)",
              }}
            >
              {toast.message}
            </p>
          </div>
        </div>
      )}

      {/* Confirm modal */}
      {confirmState && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h2>{confirmState.title}</h2>
            <p className="muted-text">{confirmState.message}</p>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                type="button"
                onClick={() => closeConfirm(false)}
              >
                Hủy
              </button>
              <button
                className="btn-primary"
                type="button"
                onClick={() => closeConfirm(true)}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotify() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotify must be inside NotificationProvider");
  }
  return context;
}
