import { CartItem } from '../../core/models/cart-item.model';

export interface CartState {
  items: CartItem[];
  totalAmount: number;
}

export const initialCartState: CartState = {
  items: [],
  totalAmount: 0
};