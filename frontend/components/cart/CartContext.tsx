"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { isLoggedIn } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

export interface CartItem {
  listingId: number;
  title: string;
  price: number;
  thumbnail?: string;
  gameName?: string;
  serverName?: string;
  listingType?: string;
  serviceInfo?: string; // JSON: {accountName, password, server, note}
}

interface BackendCartItem {
  id: number;
  listingId: number;
  addedAt: string;
  title?: string;
  price?: number;
  thumbnail?: string;
  gameName?: string;
  serverName?: string;
  available: boolean;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (listingId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  total: number;
  count: number;
  loading: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchCart() {
    if (!isLoggedIn()) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await apiFetch<BackendCartItem[]>("/api/cart");
      const mapped: CartItem[] = data
        .filter((d) => d.available)
        .map((d) => ({
          listingId: d.listingId,
          title: d.title || "",
          price: d.price || 0,
          thumbnail: d.thumbnail,
          gameName: d.gameName,
          serverName: d.serverName,
        }));
      setItems(mapped);
    } catch {
      // network error — giữ nguyên items cũ
    } finally {
      setLoading(false);
    }
  }

  // Load on mount
  useEffect(() => {
    void fetchCart();
  }, []);

  // Reload on auth change
  useEffect(() => {
    function handleAuthChanged() {
      void fetchCart();
    }

    window.addEventListener("auth-changed", handleAuthChanged);
    return () => window.removeEventListener("auth-changed", handleAuthChanged);
  }, []);

  const addItem = useCallback(async (item: CartItem) => {
    // Optimistic update
    setItems((prev) => {
      if (prev.some((i) => i.listingId === item.listingId)) return prev;
      return [...prev, item];
    });

    try {
      await apiFetch(`/api/cart/${item.listingId}`, { method: "POST" });
    } catch {
      // Revert on failure
      setItems((prev) => prev.filter((i) => i.listingId !== item.listingId));
      throw new Error("Không thể thêm vào giỏ hàng");
    }
  }, []);

  const removeItem = useCallback(async (listingId: number) => {
    const snapshot = items;
    setItems((prev) => prev.filter((i) => i.listingId !== listingId));

    try {
      await apiFetch(`/api/cart/${listingId}`, { method: "DELETE" });
    } catch {
      setItems(snapshot);
    }
  }, [items]);

  const clearCart = useCallback(async () => {
    const snapshot = items;
    setItems([]);

    try {
      await apiFetch("/api/cart", { method: "DELETE" });
    } catch {
      setItems(snapshot);
    }
  }, [items]);

  const total = items.reduce((sum, i) => sum + i.price, 0);
  const count = items.length;

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, total, count, loading }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}
