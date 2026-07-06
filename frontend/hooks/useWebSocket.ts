"use client";

import { useEffect, useRef } from "react";
import { getAccessToken, getUserId } from "@/lib/auth";

const WS_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/^http/, "ws") + "/ws";

export default function useWebSocket() {
  const stompRef = useRef<unknown>(null);
  const connectedRef = useRef(false);

  useEffect(() => {
    const userId = getUserId();
    const token = getAccessToken();
    if (!userId || !token) return;

    let reconnectTimer: ReturnType<typeof setTimeout>;

    async function connect() {
      if (connectedRef.current) return;

      try {
        // Dynamic import to avoid SSR issues
        const { Client } = await import("@stomp/stompjs");

        const client = new Client({
          brokerURL: WS_URL,
          connectHeaders: { Authorization: `Bearer ${token}` },
          reconnectDelay: 5000,
          onConnect: () => {
            connectedRef.current = true;
            client.subscribe(`/topic/user/${userId}/balance`, (msg) => {
              try {
                const data = JSON.parse(msg.body);
                if (data.balance != null) {
                  window.dispatchEvent(
                    new CustomEvent("ws-balance", { detail: data }),
                  );
                  window.dispatchEvent(new Event("balance-changed"));
                }
              } catch {
                /* ignore */
              }
            });
          },
          onDisconnect: () => {
            connectedRef.current = false;
          },
        });

        stompRef.current = client;
        client.activate();
      } catch {
        // STOMP not available, fallback to polling
      }
    }

    // Lazy-load STOMP
    import("@stomp/stompjs")
      .then(() => connect())
      .catch(() => {
        /* ignore — keep using polling */
      });

    return () => {
      clearTimeout(reconnectTimer);
      if (stompRef.current) {
        (stompRef.current as { deactivate?: () => void }).deactivate?.();
      }
      connectedRef.current = false;
    };
  }, []);
}
