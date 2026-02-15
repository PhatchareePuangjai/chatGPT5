import type { CartItem } from "./api";

const CART_KEY = "promo-shop-cart-v2";
const SAVED_KEY = "promo-shop-saved-v2";
const USER_KEY = "promo-shop-user-v2";

export function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(x => x && typeof x.productId === "string" && Number.isInteger(x.qty) && x.qty > 0);
  } catch {
    return [];
  }
}

export function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function loadSaved(): CartItem[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(x => x && typeof x.productId === "string" && Number.isInteger(x.qty) && x.qty > 0);
  } catch {
    return [];
  }
}

export function saveSaved(items: CartItem[]) {
  localStorage.setItem(SAVED_KEY, JSON.stringify(items));
}

export function loadUserId(): string {
  return localStorage.getItem(USER_KEY) || "guest";
}

export function saveUserId(userId: string) {
  localStorage.setItem(USER_KEY, userId);
}
