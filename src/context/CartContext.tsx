import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  clearCart as apiClearCart,
} from "../api/cart";
import type { CartItemResponse } from "../generated/models";
import { useAuth } from "./AuthContext";

const GUEST_CART_KEY = "guest_cart";

export interface GuestCartItem {
  articleId: number;
  articleName: string;
  mainImageUrl?: string;
  unitPrice: number;
  quantity: number;
}

interface CartContextValue {
  items: CartItemResponse[];
  itemCount: number;
  totalPrice: number;
  addItem: (item: { articleId: number; quantity: number; articleName?: string; mainImageUrl?: string; unitPrice?: number }) => Promise<void>;
  updateQuantity: (articleId: number, quantity: number) => Promise<void>;
  removeItem: (articleId: number) => Promise<void>;
  clearItems: () => Promise<void>;
  loading: boolean;
}

const CartContext = createContext<CartContextValue | null>(null);

function loadGuestCart(): GuestCartItem[] {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveGuestCart(items: GuestCartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

function guestItemsToCartItems(items: GuestCartItem[]): CartItemResponse[] {
  return items.map((item) => ({
    articleId: item.articleId,
    articleName: item.articleName,
    mainImageUrl: item.mainImageUrl,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    lineTotal: item.unitPrice * item.quantity,
  }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  const [items, setItems] = useState<CartItemResponse[]>([]);
  const [loading, setLoading] = useState(false);

  // Load cart whenever auth state changes
  useEffect(() => {
    if (token) {
      loadServerCart();
    } else {
      setItems(guestItemsToCartItems(loadGuestCart()));
    }
  }, [token]);

  async function loadServerCart() {
    setLoading(true);
    try {
      const cart = await getCart();
      setItems(cart?.items ?? []);
    } catch {
      // silently fail — cart will be empty
    } finally {
      setLoading(false);
    }
  }

  const addItem = useCallback(
    async (item: { articleId: number; quantity: number; articleName?: string; mainImageUrl?: string; unitPrice?: number }) => {
      if (token) {
        const cart = await apiAddToCart({ articleId: item.articleId, quantity: item.quantity });
        setItems(cart?.items ?? []);
      } else {
        const guest = loadGuestCart();
        const existing = guest.find((i) => i.articleId === item.articleId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          guest.push({
            articleId: item.articleId,
            articleName: item.articleName ?? "Product",
            mainImageUrl: item.mainImageUrl,
            unitPrice: item.unitPrice ?? 0,
            quantity: item.quantity,
          });
        }
        saveGuestCart(guest);
        setItems(guestItemsToCartItems(guest));
      }
    },
    [token]
  );

  const updateQuantity = useCallback(
    async (articleId: number, quantity: number) => {
      if (token) {
        const cart = quantity <= 0
          ? await apiRemoveCartItem(articleId)
          : await apiUpdateCartItem(articleId, { quantity });
        setItems(cart?.items ?? []);
      } else {
        const guest = loadGuestCart();
        const idx = guest.findIndex((i) => i.articleId === articleId);
        if (idx !== -1) {
          if (quantity <= 0) {
            guest.splice(idx, 1);
          } else {
            guest[idx].quantity = quantity;
          }
          saveGuestCart(guest);
          setItems(guestItemsToCartItems(guest));
        }
      }
    },
    [token]
  );

  const removeItem = useCallback(
    async (articleId: number) => {
      if (token) {
        const cart = await apiRemoveCartItem(articleId);
        setItems(cart?.items ?? []);
      } else {
        const guest = loadGuestCart().filter((i) => i.articleId !== articleId);
        saveGuestCart(guest);
        setItems(guestItemsToCartItems(guest));
      }
    },
    [token]
  );

  const clearItems = useCallback(async () => {
    if (token) {
      const cart = await apiClearCart();
      setItems(cart?.items ?? []);
    } else {
      saveGuestCart([]);
      setItems([]);
    }
  }, [token]);

  const itemCount = items.reduce((sum, i) => sum + (i.quantity ?? 0), 0);
  const totalPrice = items.reduce((sum, i) => sum + (i.lineTotal ?? 0), 0);

  return (
    <CartContext.Provider value={{ items, itemCount, totalPrice, addItem, updateQuantity, removeItem, clearItems, loading }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

/** Merge guest cart into server cart after login. Call this after successful login. */
export async function mergeGuestCartIntoServer() {
  const guest = loadGuestCart();
  if (guest.length === 0) return;
  await Promise.allSettled(
    guest.map((item) => apiAddToCart({ articleId: item.articleId, quantity: item.quantity }))
  );
  saveGuestCart([]);
}
