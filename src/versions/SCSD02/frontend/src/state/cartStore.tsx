import React, { createContext, useContext, useMemo, useReducer } from 'react';
import type { Cart, CartApi } from '../services/cartApi';

type State = {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
};

type Action =
  | { type: 'loading' }
  | { type: 'loaded'; cart: Cart }
  | { type: 'error'; message: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'loading':
      return { ...state, loading: true, error: null };
    case 'loaded':
      return { cart: action.cart, loading: false, error: null };
    case 'error':
      return { ...state, loading: false, error: action.message };
  }
}

type Ctx = {
  state: State;
  actions: {
    refresh(): Promise<void>;
    setQty(sku: string, qty: number): Promise<void>;
    addItem(sku: string, qty: number): Promise<void>;
    saveForLater(sku: string): Promise<void>;
  };
};

const CartContext = createContext<Ctx | null>(null);

export function CartProvider(props: { api: CartApi; children: React.ReactNode; initialCart?: Cart }) {
  const [state, dispatch] = useReducer(reducer, {
    cart: props.initialCart ?? null,
    loading: false,
    error: null,
  });

  const actions = useMemo(() => {
    const api = props.api;
    return {
      async refresh() {
        dispatch({ type: 'loading' });
        try {
          dispatch({ type: 'loaded', cart: await api.getCart() });
        } catch (e: any) {
          dispatch({ type: 'error', message: e?.message ?? 'Failed to load cart' });
        }
      },
      async setQty(sku: string, qty: number) {
        dispatch({ type: 'loading' });
        try {
          dispatch({ type: 'loaded', cart: await api.setQty({ sku, qty }) });
        } catch (e: any) {
          const msg =
            e?.code === 'INSUFFICIENT_STOCK'
              ? 'Insufficient stock'
              : e?.message ?? 'Failed to update quantity';
          dispatch({ type: 'error', message: msg });
        }
      },
      async addItem(sku: string, qty: number) {
        dispatch({ type: 'loading' });
        try {
          dispatch({ type: 'loaded', cart: await api.addItem({ sku, qty }) });
        } catch (e: any) {
          const msg = e?.code === 'INSUFFICIENT_STOCK' ? 'Insufficient stock' : e?.message ?? 'Failed to add item';
          dispatch({ type: 'error', message: msg });
        }
      },
      async saveForLater(sku: string) {
        dispatch({ type: 'loading' });
        try {
          dispatch({ type: 'loaded', cart: await api.saveForLater({ sku }) });
        } catch (e: any) {
          dispatch({ type: 'error', message: e?.message ?? 'Failed to save item' });
        }
      },
    };
  }, [props.api]);

  const value: Ctx = { state, actions };
  return <CartContext.Provider value={value}>{props.children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
