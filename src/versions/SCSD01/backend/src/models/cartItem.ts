export type CartItemStatus = 'ACTIVE' | 'SAVED';

export type CartItem = {
  id: string;
  cart_id: string;
  sku: string;
  status: CartItemStatus;
  quantity: number;
  unit_price_minor: number;
  line_total_minor: number;
};

