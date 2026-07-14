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

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);

  function notify(type: ToastType, message: string) {
    const id = Date.now();

    setToasts((prev) => [...prev, { id, type, message }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
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

      {/* Toast notifications */}
      <div className="toast-wrapper">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>

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
